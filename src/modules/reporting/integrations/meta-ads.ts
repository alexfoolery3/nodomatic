/**
 * Meta Marketing API — insights campagne via System User token (Fase 2).
 *
 * Accesso agency-managed: token System User del Business Manager RT Studio
 * (permesso `ads_read`); l'ad account del cliente è condiviso col BM.
 * externalId = ad account id ("act_123..." o "123..."). Solo `fetch`.
 */
import { requireEnv } from "@/lib/env";
import type { DailyMetric, FetchRange } from "./index";

const GRAPH = "https://graph.facebook.com/v21.0";
const CONVERSION_ACTION = /lead|purchase|complete_registration|offsite_conversion/i;

type MetaRow = {
  date_start: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  actions?: { action_type: string; value: string }[];
};

function normalizeAct(id: string): string {
  return id.startsWith("act_") ? id : `act_${id}`;
}

export async function fetchMetaAdsMetrics(
  adAccountId: string,
  range: FetchRange,
): Promise<DailyMetric[]> {
  const token = requireEnv("META_SYSTEM_USER_TOKEN");
  const params = new URLSearchParams({
    time_range: JSON.stringify({ since: range.since, until: range.until }),
    time_increment: "1",
    level: "account",
    fields: "spend,impressions,clicks,ctr,cpc,actions",
    limit: "100",
    access_token: token,
  });

  let url: string | null = `${GRAPH}/${normalizeAct(adAccountId)}/insights?${params.toString()}`;
  const out: DailyMetric[] = [];
  let guard = 0;

  while (url && guard < 20) {
    guard += 1;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Meta insights fallito (${res.status}): ${await res.text()}`);
    }
    const json = (await res.json()) as { data?: MetaRow[]; paging?: { next?: string } };

    for (const row of json.data ?? []) {
      const conversions = (row.actions ?? [])
        .filter((a) => CONVERSION_ACTION.test(a.action_type))
        .reduce((sum, a) => sum + Number(a.value || 0), 0);

      out.push({
        date: row.date_start,
        metrics: {
          spend: Number(row.spend ?? 0),
          impressions: Number(row.impressions ?? 0),
          clicks: Number(row.clicks ?? 0),
          ctr: Number(row.ctr ?? 0),
          cpc: Number(row.cpc ?? 0),
          conversions,
        },
      });
    }

    url = json.paging?.next ?? null;
  }

  return out;
}
