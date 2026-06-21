/**
 * Data layer — report compilati (rep_reports). Runtime-only.
 */
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { repReports } from "@/lib/db/schema";
import { generateSlug } from "@/lib/slug";

export async function createReport(input: {
  clientId: string;
  periodStart: Date;
  periodEnd: Date;
  data: unknown;
  narrativeText: string;
}) {
  const rows = await db
    .insert(repReports)
    .values({
      clientId: input.clientId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      slug: generateSlug(),
      data: input.data,
      narrativeText: input.narrativeText,
      status: "ready",
    })
    .returning();
  return rows[0];
}

export async function getReportBySlug(slug: string) {
  const rows = await db.select().from(repReports).where(eq(repReports.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function listReportsByClient(clientId: string) {
  return db
    .select()
    .from(repReports)
    .where(eq(repReports.clientId, clientId))
    .orderBy(desc(repReports.createdAt));
}
