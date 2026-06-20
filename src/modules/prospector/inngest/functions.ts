/**
 * Inngest functions del modulo prospector (PRD §3 funnel).
 *
 * STUB di fase fondamenta: le funzioni sono registrate e reagiscono agli eventi,
 * ma la logica reale (integrazioni esterne) sarà implementata nelle fasi
 * successive. Ogni TODO indica la fase del PRD in cui va completata.
 *
 * API Inngest v4: createFunction(options con `triggers`, handler).
 */
import { inngest } from "./client";

// Fase 1 — scraping di una campagna: Apify Google Maps → prospects.
export const scrapeCampaign = inngest.createFunction(
  { id: "scrape-campaign", triggers: [{ event: "prospector/campaign.scrape.requested" }] },
  async ({ event }) => {
    const { campaignId } = event.data as { campaignId?: string };
    // TODO Fase 1: scrapeGoogleMaps({category, city}) → insert prospects → emit audit events.
    return { ok: true, todo: "Fase 1: implementare scraping", campaignId: campaignId ?? null };
  },
);

// Fase 1 — audit di un prospect: PageSpeed + screenshot + scoring.
export const auditProspect = inngest.createFunction(
  { id: "audit-prospect", triggers: [{ event: "prospector/prospect.audit.requested" }] },
  async ({ event }) => {
    const { prospectId } = event.data as { prospectId?: string };
    // TODO Fase 1: auditWebsite(url) → computeProspectScore(...) → update prospect+audit.
    return { ok: true, todo: "Fase 1: implementare audit+scoring", prospectId: prospectId ?? null };
  },
);

// Fase 2 — generazione contenuti AI per un prospect qualificato.
export const generateContent = inngest.createFunction(
  { id: "generate-content", triggers: [{ event: "prospector/prospect.content.requested" }] },
  async ({ event }) => {
    const { prospectId } = event.data as { prospectId?: string };
    // TODO Fase 2: generateProspectContent(...) → insert report → set slug landing.
    return { ok: true, todo: "Fase 2: implementare generazione AI", prospectId: prospectId ?? null };
  },
);

// Fase 3 — invio email di outreach con link alla landing.
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
