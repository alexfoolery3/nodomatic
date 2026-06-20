/**
 * Data layer — monitoraggio continuo dei siti (snapshot periodici). Runtime-only.
 */
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { monitoringSnapshots, prospects } from "@/lib/db/schema";

/** Prospect da monitorare: flag attivo e con un sito. */
export async function listMonitoredProspects() {
  return db
    .select()
    .from(prospects)
    .where(and(eq(prospects.monitored, true), isNotNull(prospects.website)));
}

export async function insertSnapshot(input: {
  prospectId: string;
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  loadTimeMs: number;
  hasHttps: boolean;
}) {
  await db.insert(monitoringSnapshots).values(input);
}

export async function getLatestSnapshot(prospectId: string) {
  const rows = await db
    .select()
    .from(monitoringSnapshots)
    .where(eq(monitoringSnapshots.prospectId, prospectId))
    .orderBy(desc(monitoringSnapshots.capturedAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function listSnapshots(prospectId: string, limit = 12) {
  return db
    .select()
    .from(monitoringSnapshots)
    .where(eq(monitoringSnapshots.prospectId, prospectId))
    .orderBy(desc(monitoringSnapshots.capturedAt))
    .limit(limit);
}
