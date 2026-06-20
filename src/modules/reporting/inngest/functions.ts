/**
 * Inngest functions del modulo reporting.
 * Pull metriche per connessione (on-demand + cron giornaliero) → rep_metrics_daily.
 */
import { inngest } from "./client";
import { getConnection, listActiveConnections } from "../data/connections";
import { replaceConnectionMetrics } from "../data/metrics";
import type { DailyMetric } from "../integrations";
import { fetchGa4Metrics } from "../integrations/ga4";
import { fetchMetaAdsMetrics } from "../integrations/meta-ads";

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
      } else {
        return { skipped: true, reason: "provider non ancora implementato" };
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

export const functions = [refreshConnection, dailyRefresh];
