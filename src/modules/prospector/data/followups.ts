/**
 * Data layer — sequenze di follow-up (Drizzle). Runtime-only.
 * Traccia gli step della sequenza per visibilità nel CRM (PRD §9).
 */
import { db } from "@/lib/db";
import { followupSequences, followupStatusEnum } from "@/lib/db/schema";

export type FollowupStatus = (typeof followupStatusEnum.enumValues)[number];

export async function recordFollowup(input: {
  prospectId: string;
  step: number;
  status: FollowupStatus;
  scheduledAt?: Date | null;
  sentAt?: Date | null;
}) {
  await db.insert(followupSequences).values({
    prospectId: input.prospectId,
    step: input.step,
    status: input.status,
    scheduledAt: input.scheduledAt ?? null,
    sentAt: input.sentAt ?? null,
  });
}
