/**
 * Inngest functions del modulo prospector (PRD §3 funnel).
 *
 * Fase 1: scraping (Apify) → audit (PageSpeed) → scoring → DB.
 * Fase 2: generazione contenuti AI (Claude) → report → landing /p/[slug].
 * La logica pesante gira qui, mai in request handler sincroni (PRD §4.3).
 *
 * sendOutreach (Fase 3) resta stub.
 */
import { inngest } from "./client";
import { getCampaign, setCampaignStatus } from "../data/campaigns";
import {
  getAuditByProspectId,
  getProspect,
  insertScrapedProspects,
  setAuditAndScore,
} from "../data/prospects";
import { upsertReport } from "../data/reports";
import { scrapeGoogleMaps } from "../integrations/apify";
import { auditWebsite, type AuditResult } from "../integrations/pagespeed";
import { generateProspectContent } from "../integrations/ai";
import { isR2Configured, uploadToR2 } from "../integrations/r2";
import { computeProspectScore, isQualified, NO_WEBSITE_SCORE } from "../scoring";

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
        outdatedTech: null, // PSI non fornisce il tech stack → nessun punto
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

// Fase 3 — invio email di outreach con link alla landing. STUB.
export const sendOutreach = inngest.createFunction(
  { id: "send-outreach", triggers: [{ event: "prospector/prospect.outreach.requested" }] },
  async ({ event }) => {
    const { prospectId } = event.data as { prospectId?: string };
    // TODO Fase 3: sendOutreachEmail(...) → insert email_event 'sent' → schedule follow-up.
    return { ok: true, todo: "Fase 3: implementare outreach", prospectId: prospectId ?? null };
  },
);

/** Tutte le funzioni registrate, servite da /api/inngest. */
export const functions = [scrapeCampaign, auditProspect, generateContent, sendOutreach];
