/**
 * PageSpeed Insights API v5 — audit performance/SEO/accessibility (PRD §3 [3], Fase 1).
 *
 * build-green: `PAGESPEED_API_KEY` viene letto a runtime con `requireEnv`.
 *
 * Nota: `techStack` non è fornito da PSI → lasciato vuoto (TODO: tech-detect in una
 * fase successiva). Lo scoring non assegna punti per `outdatedTech` finché il dato manca.
 */
import type { TechStack } from "@/lib/db/schema";
import { requireEnv } from "@/lib/env";

export type AuditResult = {
  performanceScore: number; // 0-100
  seoScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  mobileFriendly: boolean;
  hasHttps: boolean;
  techStack: TechStack;
  loadTimeMs: number;
  /** Screenshot mobile come data URI (da Lighthouse), se disponibile. */
  screenshotDataUri: string | null;
};

type LighthouseCategory = { score?: number | null };
type LighthouseAudit = {
  numericValue?: number | null;
  score?: number | null;
  details?: { data?: string } | null;
};
type PageSpeedResponse = {
  lighthouseResult?: {
    categories?: Record<string, LighthouseCategory>;
    audits?: Record<string, LighthouseAudit>;
  };
};

const toScore = (c?: LighthouseCategory) => Math.round((c?.score ?? 0) * 100);

export async function auditWebsite(url: string): Promise<AuditResult> {
  const key = requireEnv("PAGESPEED_API_KEY");

  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("key", key);
  endpoint.searchParams.set("strategy", "mobile");
  for (const c of ["performance", "seo", "accessibility", "best-practices"]) {
    endpoint.searchParams.append("category", c);
  }

  const res = await fetch(endpoint, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`PageSpeed audit fallito (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as PageSpeedResponse;
  const categories = data.lighthouseResult?.categories ?? {};
  const audits = data.lighthouseResult?.audits ?? {};

  const interactive =
    audits["interactive"]?.numericValue ?? audits["speed-index"]?.numericValue ?? 0;
  const viewport = audits["viewport"]?.score;

  return {
    performanceScore: toScore(categories["performance"]),
    seoScore: toScore(categories["seo"]),
    accessibilityScore: toScore(categories["accessibility"]),
    bestPracticesScore: toScore(categories["best-practices"]),
    // viewport assente → assumiamo ok; 1 = pass, 0 = fail.
    mobileFriendly: viewport == null ? true : viewport === 1,
    hasHttps: url.startsWith("https://"),
    techStack: {} as TechStack,
    loadTimeMs: Math.round(interactive ?? 0),
    screenshotDataUri: audits["final-screenshot"]?.details?.data ?? null,
  };
}
