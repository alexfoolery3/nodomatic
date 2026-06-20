/**
 * Inngest functions del modulo prospector (PRD §3 funnel).
 *
 * Fase 1: scraping (Apify) → audit (PageSpeed) → scoring → DB.
 * Fase 2: generazione contenuti AI (Claude) → report → landing /p/[slug].
 * Fase 3: outreach (Resend) + sequenza follow-up condizionale (PRD §9) + warmup.
 *
 * La logica pesante gira qui, mai in request handler sincroni (PRD §4.3).
 */
import { env } from "@/lib/env";
import { inngest } from "./client";
import { getCampaign, setCampaignStatus } from "../data/campaigns";
import {
  getAuditByProspectId,
  getProspect,
  insertScrapedProspects,
  setAuditAndScore,
  setProspectStatus,
} from "../data/prospects";
import { getReportByProspectId, upsertReport } from "../data/reports";
import { hasEventType, insertEmailEvent } from "../data/emailEvents";
import { recordFollowup } from "../data/followups";
import { scrapeGoogleMaps } from "../integrations/apify";
import { auditWebsite, type AuditResult } from "../integrations/pagespeed";
import { detectTech } from "../integrations/techdetect";
import { generateProspectContent } from "../integrations/ai";
import { isR2Configured, uploadToR2 } from "../integrations/r2";
import { sendOutreachEmail } from "../integrations/resend";
import { computeProspectScore, isQualified, NO_WEBSITE_SCORE } from "../scoring";
import type { ProspectStatus } from "@/lib/db/schema";

/** Converte un data URI base64 in bytes + content type (per upload R2). */
function dataUriToBytes(dataUri: string): { data: Uint8Array; contentType: string } | null {
  const m = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUri);
  if (!m) return null;
  return { contentType: m[1], data: new Uint8Array(Buffer.from(m[2], "base64")) };
}

// Fase 1 — scraping di una campagna: Apify Google Maps → prospects → eventi di audit.
export const scrapeCampaign = inngest.createFunction(
  { id: "scrape-campaign", triggers: [{ event: "prospector/campaign.scrape.requested" }] },
  async ({ event, step }) => {
    const { campaignId } = event.data as { campaignId?: string };
    if (!campaignId) throw new Error("campaignId mancante nell'evento");

    const businesses = await step.run("scrape-google-maps", async () => {
      const campaign = await getCampaign(campaignId);
      if (!campaign) throw new Error(`Campagna ${campaignId} non trovata`);
      return scrapeGoogleMaps({ category: campaign.category, city: campaign.city });
    });

    const inserted = await step.run("insert-prospects", () =>
      insertScrapedProspects(campaignId, businesses),
    );

    if (inserted.length > 0) {
      await step.sendEvent(
        "request-audits",
        inserted.map((p) => ({
          name: "prospector/prospect.audit.requested",
          data: { prospectId: p.id },
        })),
      );
    }

    await step.run("mark-auditing", () => setCampaignStatus(campaignId, "auditing"));

    return { ok: true, campaignId, scraped: businesses.length, inserted: inserted.length };
  },
);

// Fase 1 — audit di un prospect: PageSpeed + screenshot + scoring (PRD §6). Idempotente.
export const auditProspect = inngest.createFunction(
  { id: "audit-prospect", triggers: [{ event: "prospector/prospect.audit.requested" }] },
  async ({ event, step }) => {
    const { prospectId } = event.data as { prospectId?: string };
    if (!prospectId) throw new Error("prospectId mancante nell'evento");

    const result = await step.run("audit-and-score", async () => {
      const prospect = await getProspect(prospectId);
      if (!prospect) throw new Error(`Prospect ${prospectId} non trovato`);

      // Nessun sito = ottimo target: score fisso, niente audit (PRD §6).
      if (!prospect.website) {
        await setAuditAndScore(prospectId, null, NO_WEBSITE_SCORE);
        return { score: NO_WEBSITE_SCORE, qualified: false };
      }

      const audit = await auditWebsite(prospect.website);

      // Tech detection (PRD §6): popola lo stack e il flag "obsoleto" per lo scoring.
      const tech = await detectTech(prospect.website);
      audit.techStack = tech.techStack;

      // Screenshot del sito attuale → R2 (se configurato), per la landing.
      let screenshotUrl: string | null = null;
      if (isR2Configured && audit.screenshotDataUri) {
        const img = dataUriToBytes(audit.screenshotDataUri);
        if (img) {
          screenshotUrl = await uploadToR2(
            `screenshots/${prospectId}-mobile.jpg`,
            img.data,
            img.contentType,
          );
        }
      }

      const score = computeProspectScore({
        hasWebsite: true,
        performanceScore: audit.performanceScore,
        mobileFriendly: audit.mobileFriendly,
        hasHttps: audit.hasHttps,
        outdatedTech: tech.outdated,
        loadTimeMs: audit.loadTimeMs,
      });
      await setAuditAndScore(prospectId, audit, score, screenshotUrl);
      return { score, qualified: isQualified(score) };
    });

    // I prospect qualificati con un sito entrano nel flusso AI (PRD §6).
    if (result.qualified) {
      await step.sendEvent("request-content", {
        name: "prospector/prospect.content.requested",
        data: { prospectId },
      });
    }

    return { ok: true, prospectId, ...result };
  },
);

// Fase 2 — generazione contenuti AI per un prospect qualificato (PRD §7).
export const generateContent = inngest.createFunction(
  { id: "generate-content", triggers: [{ event: "prospector/prospect.content.requested" }] },
  async ({ event, step }) => {
    const { prospectId } = event.data as { prospectId?: string };
    if (!prospectId) throw new Error("prospectId mancante nell'evento");

    await step.run("generate-content", async () => {
      const prospect = await getProspect(prospectId);
      if (!prospect) throw new Error(`Prospect ${prospectId} non trovato`);

      const auditRow = await getAuditByProspectId(prospectId);
      if (!auditRow) throw new Error(`Audit mancante per ${prospectId}`);
      const campaign = await getCampaign(prospect.campaignId);

      const audit: AuditResult = {
        performanceScore: auditRow.performanceScore ?? 0,
        seoScore: auditRow.seoScore ?? 0,
        accessibilityScore: auditRow.accessibilityScore ?? 0,
        bestPracticesScore: auditRow.bestPracticesScore ?? 0,
        mobileFriendly: auditRow.mobileFriendly ?? false,
        hasHttps: auditRow.hasHttps ?? false,
        techStack: auditRow.techStack ?? {},
        loadTimeMs: auditRow.loadTimeMs ?? 0,
        screenshotDataUri: null,
      };

      const content = await generateProspectContent({
        businessName: prospect.businessName,
        city: campaign?.city ?? "",
        category: prospect.category,
        audit,
      });

      await upsertReport({ prospectId, ...content });
    });

    return { ok: true, prospectId };
  },
);

// ---------------------------------------------------------------------------
// Fase 3 — Outreach + sequenza follow-up (PRD §9)
// ---------------------------------------------------------------------------

type SequenceCtx = {
  prospectId: string;
  campaignId: string;
  email: string;
  landingUrl: string;
};

/** Stati che fermano la sequenza (risposta ricevuta o trattativa chiusa). */
function isClosed(status: ProspectStatus): boolean {
  return status === "replied" || status === "meeting" || status === "won" || status === "lost";
}

/** Subject/body dei follow-up condizionali (PRD §9). */
function followupContent(step: number, businessName: string): { subject: string; body: string } {
  switch (step) {
    case 2:
      return {
        subject: "Hai visto l'analisi del tuo sito?",
        body: `Ciao,\n\nqualche giorno fa ti ho inviato un'analisi gratuita del sito di ${businessName}. Hai avuto modo di darci un'occhiata? Ci sono un paio di punti migliorabili in fretta — li trovi al link qui sotto.`,
      };
    case 3:
      return {
        subject: "Facciamo una call sul redesign?",
        body: `Ciao,\n\nho visto che hai aperto l'analisi del sito di ${businessName}. Se ti va, possiamo sentirci 15 minuti per vedere insieme come intervenire, senza impegno.`,
      };
    default:
      return {
        subject: `Il sito di ${businessName}: un'occhiata veloce`,
        body: `Ciao,\n\nti riscrivo perché credo che il sito di ${businessName} possa rendere molto di più. Ho preparato un'analisi con i problemi principali e una proposta concreta: la trovi al link qui sotto.`,
      };
  }
}

/** Valuta lo stato e, se la condizione dello step è soddisfatta, invia il follow-up. */
async function maybeFollowup(ctx: SequenceCtx, step: number): Promise<{ stopped: boolean }> {
  const prospect = await getProspect(ctx.prospectId);
  if (!prospect) return { stopped: true };
  if (isClosed(prospect.status)) return { stopped: true };

  const opened =
    (await hasEventType(ctx.prospectId, "open")) ||
    prospect.status === "opened" ||
    prospect.status === "clicked";
  const clicked = (await hasEventType(ctx.prospectId, "click")) || prospect.status === "clicked";

  // PRD §9: 2=aperta non cliccata, 3=cliccata, 4=non aperta affatto.
  const shouldSend = step === 2 ? opened && !clicked : step === 3 ? clicked : !opened;

  if (!shouldSend) {
    await recordFollowup({ prospectId: ctx.prospectId, step, status: "skipped" });
    return { stopped: false };
  }

  const { subject, body } = followupContent(step, prospect.businessName);
  const { resendId } = await sendOutreachEmail({
    to: ctx.email,
    subject,
    body,
    landingUrl: ctx.landingUrl,
  });
  await insertEmailEvent({
    prospectId: ctx.prospectId,
    campaignId: ctx.campaignId,
    eventType: "sent",
    resendId,
  });
  await recordFollowup({ prospectId: ctx.prospectId, step, status: "sent", sentAt: new Date() });
  return { stopped: false };
}

/**
 * Sequenza di outreach completa e durevole (PRD §9), idempotente.
 * Warmup: max 50 invii/giorno (settimana 1); alzare il limite via `throttle`
 * man mano che la reputazione del dominio cresce.
 */
export const outreachSequence = inngest.createFunction(
  {
    id: "outreach-sequence",
    triggers: [{ event: "prospector/prospect.outreach.requested" }],
    throttle: { limit: 50, period: "1d" },
  },
  async ({ event, step }) => {
    const { prospectId } = event.data as { prospectId?: string };
    if (!prospectId) throw new Error("prospectId mancante nell'evento");

    // Step 1 (T+0) — email iniziale con link alla landing.
    const initial = await step.run("send-initial", async () => {
      const prospect = await getProspect(prospectId);
      if (!prospect || !prospect.email || !prospect.slug) return { skipped: true as const };
      const report = await getReportByProspectId(prospectId);
      if (!report?.emailSubject || !report.emailBody) return { skipped: true as const };

      const landingUrl = `${env.appUrl}/p/${prospect.slug}`;
      const { resendId } = await sendOutreachEmail({
        to: prospect.email,
        subject: report.emailSubject,
        body: report.emailBody,
        landingUrl,
      });
      await insertEmailEvent({
        prospectId,
        campaignId: prospect.campaignId,
        eventType: "sent",
        resendId,
      });
      await setProspectStatus(prospectId, "contacted");
      await recordFollowup({ prospectId, step: 1, status: "sent", sentAt: new Date() });

      return {
        skipped: false as const,
        campaignId: prospect.campaignId,
        email: prospect.email,
        landingUrl,
      };
    });

    if (initial.skipped) return { ok: true, prospectId, skipped: true };

    const ctx: SequenceCtx = {
      prospectId,
      campaignId: initial.campaignId,
      email: initial.email,
      landingUrl: initial.landingUrl,
    };

    // Step 2 (T+3gg)
    await step.sleep("wait-step-2", "3d");
    const s2 = await step.run("followup-2", () => maybeFollowup(ctx, 2));
    if (s2.stopped) return { ok: true, prospectId, stoppedAt: 2 };

    // Step 3 (T+5gg → +2gg)
    await step.sleep("wait-step-3", "2d");
    const s3 = await step.run("followup-3", () => maybeFollowup(ctx, 3));
    if (s3.stopped) return { ok: true, prospectId, stoppedAt: 3 };

    // Step 4 (T+7gg → +2gg)
    await step.sleep("wait-step-4", "2d");
    const s4 = await step.run("followup-4", () => maybeFollowup(ctx, 4));
    if (s4.stopped) return { ok: true, prospectId, stoppedAt: 4 };

    // Dopo 4 step senza risposta → cold (se non già chiuso nel frattempo).
    await step.run("mark-cold", async () => {
      const p = await getProspect(prospectId);
      if (p && !isClosed(p.status)) await setProspectStatus(prospectId, "cold");
    });

    return { ok: true, prospectId, completed: true };
  },
);

/** Tutte le funzioni registrate, servite da /api/inngest. */
export const functions = [
  scrapeCampaign,
  auditProspect,
  generateContent,
  outreachSequence,
];
