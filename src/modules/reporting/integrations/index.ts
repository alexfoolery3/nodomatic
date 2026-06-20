/**
 * Integrazioni dati del modulo reporting. In Fase 0 sono stub tipizzati:
 * espongono firme stabili e lanciano se invocate. Implementate nelle fasi
 * successive (GA4 Fase 1, Meta Ads Fase 2, Google Ads + organico Fase 3),
 * sempre con `requireEnv` a runtime (accesso agency-managed).
 */
export class NotImplementedError extends Error {
  constructor(provider: string, phase: string) {
    super(`Integrazione "${provider}" non ancora implementata (prevista in ${phase}).`);
    this.name = "NotImplementedError";
  }
}

/** Metriche giornaliere normalizzate (jsonb-friendly). */
export type DailyMetric = { date: string; metrics: Record<string, number> };

/** Intervallo di date ISO (YYYY-MM-DD). */
export type FetchRange = { since: string; until: string };

export * from "./ga4";
export * from "./meta-ads";
export * from "./google-ads";
export * from "./meta-organic";
