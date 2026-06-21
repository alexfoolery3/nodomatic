import { notFound } from "next/navigation";
import { isDbConfigured } from "@/lib/env";
import { getClient } from "@/modules/reporting/data/clients";
import { getReportBySlug } from "@/modules/reporting/data/reports";
import type { ReportData } from "@/modules/reporting/report-service";
import { ReportView } from "./report-view";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Report",
  robots: { index: false, follow: false },
};

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("it-IT");
}

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isDbConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-neutral-500">
        Report non disponibile.
      </main>
    );
  }

  const report = await getReportBySlug(slug);
  if (!report) notFound();
  const client = await getClient(report.clientId);
  const data = report.data as ReportData | null;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-8">
          <p className="text-sm text-neutral-500">Report performance</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{client?.name ?? "Cliente"}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {fmtDate(report.periodStart)} – {fmtDate(report.periodEnd)}
          </p>
          <div className="mt-4 flex gap-3 text-sm">
            <a
              href={`/r/${slug}/pdf`}
              className="rounded-md border bg-white px-3 py-1.5 font-medium hover:bg-neutral-100"
            >
              Scarica PDF
            </a>
            <a
              href={`/r/${slug}/csv`}
              className="rounded-md border bg-white px-3 py-1.5 font-medium hover:bg-neutral-100"
            >
              Scarica CSV
            </a>
          </div>
        </header>

        {report.narrativeText && (
          <div className="mb-8 whitespace-pre-line rounded-xl border bg-white p-6 text-[15px] leading-relaxed text-neutral-700">
            {report.narrativeText}
          </div>
        )}

        {data && data.providers.length > 0 ? (
          <ReportView data={data} />
        ) : (
          <p className="text-sm text-neutral-500">Nessun dato nel periodo.</p>
        )}

        <footer className="mt-10 text-center text-sm text-neutral-400">
          Report a cura di RT Studio · Nodomatic
        </footer>
      </div>
    </main>
  );
}
