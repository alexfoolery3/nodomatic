/**
 * Data layer — campagne (Drizzle). Le query girano solo a runtime.
 */
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { campaigns, type CampaignStatus } from "@/lib/db/schema";

export async function listCampaigns() {
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
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
}) {
  const rows = await db
    .insert(campaigns)
    .values({
      name: input.name,
      city: input.city,
      category: input.category,
      status: "scraping",
      createdBy: input.createdBy,
    })
    .returning();
  return rows[0];
}

export async function setCampaignStatus(id: string, status: CampaignStatus) {
  await db.update(campaigns).set({ status }).where(eq(campaigns.id, id));
}
