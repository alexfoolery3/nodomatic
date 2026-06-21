"use client";

import { MetricsChart, type ChartLine } from "@/components/metrics-chart";
import type { ReportData } from "@/modules/reporting/report-service";

const PROVIDER_LABEL: Record<string, string> = {
  ga4: "Sito web (Google Analytics)",
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  meta_organic: "Social organico",
};

type Kpi = { key: string; label: string; fmt: "eur" | "int" };

const KPIS: Record<string, Kpi[]> = {
  ga4: [
    { key: "activeUsers", label: "Utenti", fmt: "int" },
    { key: "sessions", label: "Sessioni", fmt: "int" },
    { key: "conversions", label: "Conversioni", fmt: "int" },
  ],
  meta_ads: [
    { key: "spend", label: "Spesa", fmt: "eur" },
    { key: "impressions", label: "Impression", fmt: "int" },
    { key: "clicks", label: "Click", fmt: "int" },
    { key: "conversions", label: "Conversioni", fmt: "int" },
  ],
  google_ads: [
    { key: "spend", label: "Spesa", fmt: "eur" },
    { key: "impressions", label: "Impression", fmt: "int" },
    { key: "clicks", label: "Click", fmt: "int" },
    { key: "conversions", label: "Conversioni", fmt: "int" },
  ],
  meta_organic: [
    { key: "impressions", label: "Impression", fmt: "int" },
    { key: "engagement", label: "Engagement", fmt: "int" },
    { key: "followers", label: "Nuovi follower", fmt: "int" },
  ],
};

const LINES: Record<string, ChartLine[]> = {
  ga4: [
    { key: "sessions", label: "Sessioni", color: "#6366f1" },
    { key: "activeUsers", label: "Utenti", color: "#10b981" },
  ],
  meta_ads: [
    { key: "spend", label: "Spesa €", color: "#6366f1" },
    { key: "clicks", label: "Click", color: "#f59e0b" },
  ],
  google_ads: [
    { key: "spend", label: "Spesa €", color: "#6366f1" },
    { key: "clicks", label: "Click", color: "#f59e0b" },
  ],
  meta_organic: [
    { key: "impressions", label: "Impression", color: "#6366f1" },
    { key: "engagement", label: "Engagement", color: "#10b981" },
  ],
};

function fmt(v: number, kind: "eur" | "int") {
  if (kind === "eur") return `€ ${v.toLocaleString("it-IT", { maximumFractionDigits: 2 })}`;
  return Math.round(v).toLocaleString("it-IT");
}

export function ReportView({ data }: { data: ReportData }) {
  return (
    <div className="space-y-8">
      {data.providers.map((p, idx) => (
        <section key={idx} className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {PROVIDER_LABEL[p.provider] ?? p.provider} · {p.displayName}
          </h2>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(KPIS[p.provider] ?? []).map((k) => (
              <div key={k.key} className="rounded-lg border bg-neutral-50 p-4 text-center">
                <div className="text-xl font-semibold">{fmt(p.totals[k.key] ?? 0, k.fmt)}</div>
                <div className="mt-1 text-xs text-neutral-500">{k.label}</div>
              </div>
            ))}
          </div>
          {p.series.length > 0 && <MetricsChart data={p.series} lines={LINES[p.provider] ?? []} />}
        </section>
      ))}
    </div>
  );
}
