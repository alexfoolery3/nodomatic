/**
 * Data layer — campagne (Drizzle). Le query girano solo a runtime.
 */
import { desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { campaigns, prospects, type CampaignStatus } from "@/lib/db/schema";

export async function listCampaigns() {
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
}

/**
 * Campagne con il numero di prospect (per la lista).
 * Di default nasconde le archiviate; `includeArchived` le mostra tutte (Fase 1 — 1C).
 */
export async function listCampaignsWithCounts(opts?: { includeArchived?: boolean }) {
  const q = db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      city: campaigns.city,
      category: campaigns.category,
      status: campaigns.status,
      createdAt: campaigns.createdAt,
      prospectCount: sql<number>`count(${prospects.id})`,
    })
    .from(campaigns)
    .leftJoin(prospects, eq(prospects.campaignId, campaigns.id))
    .$dynamic();

  const filtered = opts?.includeArchived ? q : q.where(ne(campaigns.status, "archived"));

  return filtered.groupBy(campaigns.id).orderBy(desc(campaigns.createdAt));
}

export async function getCampaign(id: string) {
  const rows = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createCampaign(input: {
  name: string;
  city: string;
  category: string;
  createdBy: string | null;
  status?: CampaignStatus;
  scrapeLimit?: number;
}) {
  const rows = await db
    .insert(campaigns)
    .values({
      name: input.name,
      city: input.city,
      category: input.category,
      status: input.status ?? "scraping",
      scrapeLimit: input.scrapeLimit ?? 50,
      createdBy: input.createdBy,
    })
    .returning();
  return rows[0];
}

export async function setCampaignStatus(id: string, status: CampaignStatus) {
  await db.update(campaigns).set({ status }).where(eq(campaigns.id, id));
}

/** Elimina definitivamente una campagna; i prospect collegati cadono in cascade (Fase 1 — 1C). */
export async function deleteCampaign(id: string) {
  await db.delete(campaigns).where(eq(campaigns.id, id));
}
