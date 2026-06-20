/**
 * Data layer — prospect e audit (Drizzle). Le query girano solo a runtime.
 */
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { audits, prospects, type ProspectStatus } from "@/lib/db/schema";
import { generateSlug } from "@/lib/slug";
import type { ScrapedBusiness } from "../integrations/apify";
import type { AuditResult } from "../integrations/pagespeed";

export type ProspectFilters = {
  status?: ProspectStatus;
  minScore?: number;
};

/** Lista prospect di una campagna con l'audit (se presente), ordinati per score desc. */
export async function listProspectsByCampaign(campaignId: string, filters: ProspectFilters = {}) {
  const conds = [eq(prospects.campaignId, campaignId)];
  if (filters.status) conds.push(eq(prospects.status, filters.status));
  if (typeof filters.minScore === "number") {
    conds.push(gte(prospects.prospectScore, filters.minScore));
  }

  return db
    .select({ prospect: prospects, audit: audits })
    .from(prospects)
    .leftJoin(audits, eq(audits.prospectId, prospects.id))
    .where(and(...conds))
    .orderBy(sql`${prospects.prospectScore} desc nulls last`, desc(prospects.createdAt));
}

export async function getProspect(id: string) {
  const rows = await db.select().from(prospects).where(eq(prospects.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getProspectBySlug(slug: string) {
  const rows = await db.select().from(prospects).where(eq(prospects.slug, slug)).limit(1);
  return rows[0] ?? null;
}

/** Inserisce i prospect prodotti dallo scraping, assegnando uno slug univoco a ciascuno. */
export async function insertScrapedProspects(campaignId: string, businesses: ScrapedBusiness[]) {
  if (businesses.length === 0) return [];

  const values = businesses.map((b) => ({
    campaignId,
    businessName: b.businessName,
    website: b.website,
    phone: b.phone,
    address: b.address,
    category: b.category,
    gmapsRating: b.gmapsRating != null ? String(b.gmapsRating) : null,
    gmapsReviews: b.gmapsReviews,
    status: "scraped" as ProspectStatus,
    slug: generateSlug(),
    scrapedAt: new Date(),
  }));

  return db.insert(prospects).values(values).returning();
}

/** Salva l'audit (se disponibile) e aggiorna score + stato del prospect. */
export async function setAuditAndScore(
  prospectId: string,
  auditResult: AuditResult | null,
  score: number,
) {
  if (auditResult) {
    await db.insert(audits).values({
      prospectId,
      performanceScore: auditResult.performanceScore,
      seoScore: auditResult.seoScore,
      accessibilityScore: auditResult.accessibilityScore,
      bestPracticesScore: auditResult.bestPracticesScore,
      mobileFriendly: auditResult.mobileFriendly,
      hasHttps: auditResult.hasHttps,
      techStack: auditResult.techStack,
      loadTimeMs: auditResult.loadTimeMs,
      auditedAt: new Date(),
    });
  }

  await db
    .update(prospects)
    .set({ prospectScore: score, status: "audited" })
    .where(eq(prospects.id, prospectId));
}
