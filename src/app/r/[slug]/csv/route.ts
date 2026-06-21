import { isDbConfigured } from "@/lib/env";
import { getReportBySlug } from "@/modules/reporting/data/reports";
import type { ReportData } from "@/modules/reporting/report-service";

export const dynamic = "force-dynamic";

function cell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!isDbConfigured) return new Response("Report non disponibile", { status: 503 });

  const { slug } = await params;
  const report = await getReportBySlug(slug);
  if (!report) return new Response("Report non trovato", { status: 404 });

  const data = report.data as ReportData | null;
  const lines = ["provider,display_name,date,metric,value"];
  for (const p of data?.providers ?? []) {
    for (const point of p.series) {
      const { date, ...metrics } = point;
      for (const [metric, value] of Object.entries(metrics)) {
        lines.push([p.provider, p.displayName, date, metric, value].map(cell).join(","));
      }
    }
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="report-${slug}.csv"`,
    },
  });
}
