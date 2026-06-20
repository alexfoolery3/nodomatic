/**
 * Data layer — metriche giornaliere delle connessioni (rep_metrics_daily). Runtime-only.
 */
import { and, asc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { repMetricsDaily } from "@/lib/db/schema";
import type { DailyMetric } from "../integrations";

/** Sostituisce le metriche di una connessione dal `since` in poi (refresh idempotente). */
export async function replaceConnectionMetrics(
  connectionId: string,
  since: Date,
  metrics: DailyMetric[],
) {
  await db
    .delete(repMetricsDaily)
    .where(and(eq(repMetricsDaily.connectionId, connectionId), gte(repMetricsDaily.date, since)));

  if (metrics.length === 0) return;
  await db.insert(repMetricsDaily).values(
    metrics.map((m) => ({
      connectionId,
      date: new Date(m.date),
      metrics: m.metrics,
    })),
  );
}

export async function listConnectionMetrics(connectionId: string, sinceDays = 30) {
  const since = new Date(Date.now() - sinceDays * 86_400_000);
  return db
    .select()
    .from(repMetricsDaily)
    .where(and(eq(repMetricsDaily.connectionId, connectionId), gte(repMetricsDaily.date, since)))
    .orderBy(asc(repMetricsDaily.date));
}
