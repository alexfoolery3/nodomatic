/**
 * Inngest functions del modulo reporting.
 * Pull metriche per connessione (on-demand + cron giornaliero) → rep_metrics_daily.
 */
import { inngest } from "./client";
import { getClient } from "../data/clients";
import { getConnection, listActiveConnections } from "../data/connections";
import { replaceConnectionMetrics } from "../data/metrics";
import { compileAndStoreReport } from "../report-service";
import type { DailyMetric } from "../integrations";
import { fetchGa4Metrics } from "../integrations/ga4";
import { fetchMetaAdsMetrics } from "../integrations/meta-ads";
import { fetchGoogleAdsMetrics } from "../integrations/google-ads";
import { fetchMetaOrganicMetrics } from "../integrations/meta-organic";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Pull metriche di una singola connessione (per ora GA4; altri provider nelle fasi successive).
export const refreshConnection = inngest.createFunction(
  {
    id: "reporting-refresh-connection",
    triggers: [{ event: "reporting/connection.refresh.requested" }],
    throttle: { limit: 200, period: "1d" },
  },
  async ({ event, step }) => {
    const { connectionId } = event.data as { connectionId?: string };
    if (!connectionId) throw new Error("connectionId mancante nell'evento");

    return step.run("refresh", async () => {
      const conn = await getConnection(connectionId);
      if (!conn || !conn.active) return { skipped: true };

      const until = new Date();
      const since = new Date(Date.now() - 30 * 86_400_000);
      const range = { since: isoDate(since), until: isoDate(until) };

      let metrics: DailyMetric[];
      if (conn.provider === "ga4") {
        metrics = await fetchGa4Metrics(conn.externalId, range);
      } else if (conn.provider === "meta_ads") {
        metrics = await fetchMetaAdsMetrics(conn.externalId, range);
      } else if (conn.provider === "google_ads") {
        metrics = await fetchGoogleAdsMetrics(conn.externalId, range);
      } else {
        metrics = await fetchMetaOrganicMetrics(conn.externalId, range);
      }

      await replaceConnectionMetrics(connectionId, since, metrics);
      return { ok: true, days: metrics.length };
    });
  },
);

// Cron giornaliero: aggiorna tutte le connessioni attive.
export const dailyRefresh = inngest.createFunction(
  { id: "reporting-daily-refresh", triggers: [{ cron: "TZ=Europe/Rome 0 6 * * *" }] },
  async ({ step }) => {
    const conns = await step.run("list-active", () => listActiveConnections());
    if (conns.length > 0) {
      await step.sendEvent(
        "refresh-all",
        conns.map((c) => ({
          name: "reporting/connection.refresh.requested",
          data: { connectionId: c.id },
        })),
      );
    }
    return { ok: true, enqueued: conns.length };
  },
);

// Genera il report compilato di un cliente per un periodo.
export const generateReport = inngest.createFunction(
  { id: "reporting-generate-report", triggers: [{ event: "reporting/report.generate.requested" }] },
  async ({ event, step }) => {
    const { clientId, since, until } = event.data as {
      clientId?: string;
      since?: string;
      until?: string;
    };
    if (!clientId) throw new Error("clientId mancante nell'evento");

    return step.run("compile", async () => {
      const client = await getClient(clientId);
      if (!client) return { skipped: true };
      const s = since ? new Date(since) : new Date(Date.now() - 30 * 86_400_000);
      const u = until ? new Date(until) : new Date();
      const report = await compileAndStoreReport(clientId, client.name, s, u);
      return { ok: true, slug: report.slug };
    });
  },
);

// Cron mensile (1° del mese): genera il report del mese precedente per ogni cliente con connessioni.
export const monthlyReports = inngest.createFunction(
  { id: "reporting-monthly-reports", triggers: [{ cron: "TZ=Europe/Rome 0 7 1 * *" }] },
  async ({ step }) => {
    const conns = await step.run("list-active", () => listActiveConnections());
    const clientIds = [...new Set(conns.map((c) => c.clientId))];

    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const until = new Date(now.getFullYear(), now.getMonth(), 0);

    if (clientIds.length > 0) {
      await step.sendEvent(
        "generate-all",
        clientIds.map((clientId) => ({
          name: "reporting/report.generate.requested",
          data: { clientId, since: since.toISOString(), until: until.toISOString() },
        })),
      );
    }
    return { ok: true, clients: clientIds.length };
  },
);

export const functions = [
  refreshConnection,
  dailyRefresh,
  generateReport,
  monthlyReports,
];
