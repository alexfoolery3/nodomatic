/**
 * Data layer — interazioni manuali con i prospect (note, call, meeting). Runtime-only.
 */
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { interactions, interactionTypeEnum, user } from "@/lib/db/schema";

export type InteractionType = (typeof interactionTypeEnum.enumValues)[number];

export async function listInteractionsByProspect(prospectId: string) {
  return db
    .select({ interaction: interactions, userName: user.name })
    .from(interactions)
    .leftJoin(user, eq(user.id, interactions.userId))
    .where(eq(interactions.prospectId, prospectId))
    .orderBy(desc(interactions.createdAt));
}

export async function createInteraction(input: {
  prospectId: string;
  userId: string | null;
  type: InteractionType;
  content: string;
  scheduledAt?: Date | null;
}) {
  await db.insert(interactions).values({
    prospectId: input.prospectId,
    userId: input.userId,
    type: input.type,
    content: input.content,
    scheduledAt: input.scheduledAt ?? null,
  });
}
