import { isDbConfigured } from "@/lib/env";
import { getClient } from "@/modules/reporting/data/clients";
import { getReportBySlug } from "@/modules/reporting/data/reports";
import type { ReportData } from "@/modules/reporting/report-service";
import { renderReportPdf } from "../report-pdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMPTY: ReportData = { periodStart: "", periodEnd: "", providers: [] };

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!isDbConfigured) return new Response("Report non disponibile", { status: 503 });

  const { slug } = await params;
  const report = await getReportBySlug(slug);
  if (!report) return new Response("Report non trovato", { status: 404 });

  const client = await getClient(report.clientId);
  const data = (report.data as ReportData | null) ?? EMPTY;

  const buf = await renderReportPdf({
    clientName: client?.name ?? "Cliente",
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
    narrative: report.narrativeText ?? "",
    data,
  });

  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="report-${slug}.pdf"`,
    },
  });
}
