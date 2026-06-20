/**
 * Data layer — campagne (Drizzle). Le query girano solo a runtime.
 */
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { campaigns, prospects, type CampaignStatus } from "@/lib/db/schema";

export async function listCampaigns() {
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
}

/** Campagne con il numero di prospect (per la lista). */
export async function listCampaignsWithCounts() {
  return db
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
    .groupBy(campaigns.id)
    .orderBy(desc(campaigns.createdAt));
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
}) {
  const rows = await db
    .insert(campaigns)
    .values({
      name: input.name,
      city: input.city,
      category: input.category,
      status: input.status ?? "scraping",
      createdBy: input.createdBy,
    })
    .returning();
  return rows[0];
}

export async function setCampaignStatus(id: string, status: CampaignStatus) {
  await db.update(campaigns).set({ status }).where(eq(campaigns.id, id));
}
