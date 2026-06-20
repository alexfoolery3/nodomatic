/**
 * Inngest functions del modulo prospector (PRD §3 funnel).
 *
 * Fase 1: scraping (Apify) → audit (PageSpeed) → scoring → DB.
 * La logica pesante gira qui, mai in request handler sincroni (PRD §4.3).
 * Le funzioni girano solo a runtime (richiedono DB + chiavi integrazioni).
 *
 * generateContent (Fase 2) e sendOutreach (Fase 3) restano stub.
 */
import { inngest } from "./client";
import { getCampaign, setCampaignStatus } from "../data/campaigns";
import {
  getProspect,
  insertScrapedProspects,
  setAuditAndScore,
} from "../data/prospects";
import { scrapeGoogleMaps } from "../integrations/apify";
import { auditWebsite } from "../integrations/pagespeed";
import { computeProspectScore, NO_WEBSITE_SCORE } from "../scoring";

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

// Fase 1 — audit di un prospect: PageSpeed + scoring (PRD §6). Idempotente per prospect.
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
        return { score: NO_WEBSITE_SCORE, audited: false };
      }

      const audit = await auditWebsite(prospect.website);
      const score = computeProspectScore({
        hasWebsite: true,
        performanceScore: audit.performanceScore,
        mobileFriendly: audit.mobileFriendly,
        hasHttps: audit.hasHttps,
        // outdatedTech non ancora rilevato (PSI non lo fornisce) → nessun punto.
        outdatedTech: null,
        loadTimeMs: audit.loadTimeMs,
      });
      await setAuditAndScore(prospectId, audit, score);
      return { score, audited: true };
    });

    return { ok: true, prospectId, ...result };
  },
);

// Fase 2 — generazione contenuti AI per un prospect qualificato. STUB.
export const generateContent = inngest.createFunction(
  { id: "generate-content", triggers: [{ event: "prospector/prospect.content.requested" }] },
  async ({ event }) => {
    const { prospectId } = event.data as { prospectId?: string };
    // TODO Fase 2: generateProspectContent(...) → insert report → set slug landing.
    return { ok: true, todo: "Fase 2: implementare generazione AI", prospectId: prospectId ?? null };
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
