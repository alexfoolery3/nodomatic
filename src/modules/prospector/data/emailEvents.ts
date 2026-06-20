/**
 * Data layer — eventi email (Drizzle). Runtime-only.
 */
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailEvents, emailEventTypeEnum } from "@/lib/db/schema";

export type EmailEventType = (typeof emailEventTypeEnum.enumValues)[number];

export async function insertEmailEvent(input: {
  prospectId: string;
  campaignId: string | null;
  eventType: EmailEventType;
  resendId?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  await db.insert(emailEvents).values({
    prospectId: input.prospectId,
    campaignId: input.campaignId,
    eventType: input.eventType,
    resendId: input.resendId ?? null,
    metadata: input.metadata ?? null,
  });
}

/** Trova l'evento associato a un id messaggio Resend (per correlare i webhook). */
export async function findEventByResendId(resendId: string) {
  const rows = await db
    .select()
    .from(emailEvents)
    .where(eq(emailEvents.resendId, resendId))
    .orderBy(desc(emailEvents.occurredAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function hasEventType(prospectId: string, eventType: EmailEventType): Promise<boolean> {
  const rows = await db
    .select({ id: emailEvents.id })
    .from(emailEvents)
    .where(and(eq(emailEvents.prospectId, prospectId), eq(emailEvents.eventType, eventType)))
    .limit(1);
  return rows.length > 0;
}

export async function listEventsByProspect(prospectId: string) {
  return db
    .select()
    .from(emailEvents)
    .where(eq(emailEvents.prospectId, prospectId))
    .orderBy(desc(emailEvents.occurredAt));
}
