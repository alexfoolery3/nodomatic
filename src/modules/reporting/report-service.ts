/**
 * Compilazione del report cliente: aggrega le metriche di tutte le connessioni
 * in un periodo + narrativa AI → riga `rep_reports`. Riusato da action e cron.
 */
import type { ConnectionProvider } from "@/lib/db/schema";
import { listConnections } from "./data/connections";
import { listConnectionMetricsRange } from "./data/metrics";
import { createReport } from "./data/reports";
import { generateReportNarrative } from "./integrations/ai";

export type ProviderReport = {
  provider: ConnectionProvider;
  displayName: string;
  totals: Record<string, number>;
  series: Record<string, number | string>[];
};

export type ReportData = {
  periodStart: string;
  periodEnd: string;
  providers: ProviderReport[];
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

export async function buildReportData(
  clientId: string,
  since: Date,
  until: Date,
): Promise<ReportData> {
  const conns = (await listConnections(clientId)).filter((c) => c.active);
  const providers: ProviderReport[] = [];

  for (const conn of conns) {
    const rows = await listConnectionMetricsRange(conn.id, since, until);
    const totals: Record<string, number> = {};
    const series = rows.map((r) => {
      const m = (r.metrics ?? {}) as Record<string, number>;
      for (const [k, v] of Object.entries(m)) {
        if (typeof v === "number") totals[k] = (totals[k] ?? 0) + v;
      }
      return { date: new Date(r.date).toISOString().slice(0, 10), ...m };
    });
    providers.push({
      provider: conn.provider,
      displayName: conn.displayName ?? conn.externalId,
      totals,
      series,
    });
  }

  return { periodStart: iso(since), periodEnd: iso(until), providers };
}

/** Compila e salva il report (narrativa AI best-effort). */
export async function compileAndStoreReport(
  clientId: string,
  clientName: string,
  since: Date,
  until: Date,
) {
  const data = await buildReportData(clientId, since, until);

  let narrative = "";
  try {
    narrative = await generateReportNarrative({ clientName, data });
  } catch {
    narrative = ""; // l'assenza della chiave AI non blocca la generazione
  }

  return createReport({
    clientId,
    periodStart: since,
    periodEnd: until,
    data,
    narrativeText: narrative,
  });
}
