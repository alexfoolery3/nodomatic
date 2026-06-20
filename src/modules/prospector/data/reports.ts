/**
 * Data layer — report AI e dati per la landing (Drizzle). Runtime-only.
 */
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { audits, prospects, reports, type LandingCopy } from "@/lib/db/schema";

export async function getReportByProspectId(prospectId: string) {
  const rows = await db.select().from(reports).where(eq(reports.prospectId, prospectId)).limit(1);
  return rows[0] ?? null;
}

/** Crea o sostituisce il report di un prospect (idempotente per prospect). */
export async function upsertReport(input: {
  prospectId: string;
  analysisText: string;
  landingCopy: LandingCopy;
  emailSubject: string;
  emailBody: string;
}) {
  await db.delete(reports).where(eq(reports.prospectId, input.prospectId));
  const rows = await db
    .insert(reports)
    .values({
      prospectId: input.prospectId,
      analysisText: input.analysisText,
      landingCopy: input.landingCopy,
      emailSubject: input.emailSubject,
      emailBody: input.emailBody,
      generatedAt: new Date(),
    })
    .returning();
  return rows[0];
}

/** Tutti i dati per renderizzare la landing /p/[slug]: prospect + audit + report. */
export async function getLandingDataBySlug(slug: string) {
  const rows = await db
    .select({ prospect: prospects, audit: audits, report: reports })
    .from(prospects)
    .leftJoin(audits, eq(audits.prospectId, prospects.id))
    .leftJoin(reports, eq(reports.prospectId, prospects.id))
    .where(eq(prospects.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}
