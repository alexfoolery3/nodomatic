/**
 * Google Ads API — metriche campagne (Fase 3).
 *
 * Accesso agency-managed via manager account (MCC): OAuth refresh token + developer
 * token. Implementazione REST (`searchStream`) con solo `fetch`, nessuna dipendenza.
 * externalId = customer id del cliente (es. "123-456-7890" o "1234567890").
 */
import { requireEnv } from "@/lib/env";
import type { DailyMetric, FetchRange } from "./index";

const digits = (s: string) => s.replace(/\D/g, "");

async function accessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireEnv("GOOGLE_ADS_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_ADS_CLIENT_SECRET"),
      refresh_token: requireEnv("GOOGLE_ADS_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google OAuth fallito (${res.status}): ${await res.text()}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Google OAuth: access_token mancante");
  return json.access_token;
}

type GAdsRow = {
  segments?: { date?: string };
  metrics?: { costMicros?: string; impressions?: string; clicks?: string; conversions?: number };
};

export async function fetchGoogleAdsMetrics(
  customerId: string,
  range: FetchRange,
): Promise<DailyMetric[]> {
  const token = await accessToken();
  const cid = digits(customerId);
  const query =
    "SELECT segments.date, metrics.cost_micros, metrics.impressions, metrics.clicks, " +
    `metrics.conversions FROM campaign WHERE segments.date BETWEEN '${range.since}' AND '${range.until}'`;

  const res = await fetch(
    `https://googleads.googleapis.com/v17/customers/${cid}/googleAds:searchStream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "developer-token": requireEnv("GOOGLE_ADS_DEVELOPER_TOKEN"),
        "login-customer-id": digits(requireEnv("GOOGLE_ADS_LOGIN_CUSTOMER_ID")),
      },
      body: JSON.stringify({ query }),
    },
  );
  if (!res.ok) throw new Error(`Google Ads fallito (${res.status}): ${await res.text()}`);

  // searchStream restituisce un array di chunk { results: [...] }.
  const raw = (await res.json()) as Array<{ results?: GAdsRow[] }> | { results?: GAdsRow[] };
  const chunks = Array.isArray(raw) ? raw : [raw];

  const byDate = new Map<
    string,
    { spend: number; impressions: number; clicks: number; conversions: number }
  >();
  for (const chunk of chunks) {
    for (const row of chunk.results ?? []) {
      const date = row.segments?.date;
      if (!date) continue;
      const e = byDate.get(date) ?? { spend: 0, impressions: 0, clicks: 0, conversions: 0 };
      e.spend += Number(row.metrics?.costMicros ?? 0) / 1_000_000;
      e.impressions += Number(row.metrics?.impressions ?? 0);
      e.clicks += Number(row.metrics?.clicks ?? 0);
      e.conversions += Number(row.metrics?.conversions ?? 0);
      byDate.set(date, e);
    }
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, m]) => ({ date, metrics: m }));
}
