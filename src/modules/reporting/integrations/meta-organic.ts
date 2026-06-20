/**
 * Meta Graph API — insights organici pagina FB / profilo IG (Fase 3).
 * Riusa `META_SYSTEM_USER_TOKEN`. externalId = page id (o IG user id). Solo `fetch`.
 */
import { requireEnv } from "@/lib/env";
import type { DailyMetric, FetchRange } from "./index";

const GRAPH = "https://graph.facebook.com/v21.0";
const METRICS = ["page_impressions", "page_post_engagements", "page_fan_adds"];
const KEY: Record<string, string> = {
  page_impressions: "impressions",
  page_post_engagements: "engagement",
  page_fan_adds: "followers",
};

export async function fetchMetaOrganicMetrics(
  pageId: string,
  range: FetchRange,
): Promise<DailyMetric[]> {
  const token = requireEnv("META_SYSTEM_USER_TOKEN");
  const params = new URLSearchParams({
    metric: METRICS.join(","),
    period: "day",
    since: range.since,
    until: range.until,
    access_token: token,
  });

  const res = await fetch(`${GRAPH}/${pageId}/insights?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Meta organic insights fallito (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as {
    data?: { name: string; values?: { value: number; end_time?: string }[] }[];
  };

  const byDate = new Map<string, Record<string, number>>();
  for (const metric of json.data ?? []) {
    const key = KEY[metric.name];
    if (!key) continue;
    for (const v of metric.values ?? []) {
      const date = (v.end_time ?? "").slice(0, 10);
      if (!date) continue;
      const entry = byDate.get(date) ?? {};
      entry[key] = typeof v.value === "number" ? v.value : Number(v.value ?? 0);
      byDate.set(date, entry);
    }
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, metrics]) => ({ date, metrics }));
}
