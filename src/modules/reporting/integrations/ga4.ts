/**
 * Google Analytics 4 — Data API via service account (Fase 1).
 *
 * Accesso agency-managed: il service account RT Studio viene aggiunto come viewer
 * alla property GA4 del cliente. Credenziali da `GOOGLE_SERVICE_ACCOUNT_JSON`
 * (JSON della service account, codificato base64), lette a runtime.
 * externalId = GA4 property id ("123456789" o "properties/123456789").
 */
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { requireEnv } from "@/lib/env";
import type { DailyMetric, FetchRange } from "./index";

/** Metriche richieste a GA4 (ordine stabile = indice nelle righe di risposta). */
export const GA4_METRICS = [
  "activeUsers",
  "newUsers",
  "sessions",
  "screenPageViews",
  "conversions",
  "bounceRate",
] as const;

function credentials(): { client_email: string; private_key: string } {
  const raw = requireEnv("GOOGLE_SERVICE_ACCOUNT_JSON");
  const json = JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as {
    client_email?: string;
    private_key?: string;
  };
  if (!json.client_email || !json.private_key) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON non valido (client_email/private_key mancanti).");
  }
  return { client_email: json.client_email, private_key: json.private_key };
}

function normalizeProperty(id: string): string {
  return id.startsWith("properties/") ? id : `properties/${id}`;
}

export async function fetchGa4Metrics(
  propertyId: string,
  range: FetchRange,
): Promise<DailyMetric[]> {
  const client = new BetaAnalyticsDataClient({ credentials: credentials() });

  const [res] = await client.runReport({
    property: normalizeProperty(propertyId),
    dateRanges: [{ startDate: range.since, endDate: range.until }],
    dimensions: [{ name: "date" }],
    metrics: GA4_METRICS.map((name) => ({ name })),
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });

  return (res.rows ?? []).map((row) => {
    const raw = row.dimensionValues?.[0]?.value ?? ""; // "YYYYMMDD"
    const date =
      raw.length === 8 ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : raw;
    const metrics: Record<string, number> = {};
    GA4_METRICS.forEach((name, i) => {
      metrics[name] = Number(row.metricValues?.[i]?.value ?? 0);
    });
    return { date, metrics };
  });
}
