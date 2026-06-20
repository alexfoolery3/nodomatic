"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth-guards";
import { interactionTypeEnum } from "@/lib/db/schema";
import { createInteraction } from "../data/interactions";

const schema = z.object({
  prospectId: z.string().uuid(),
  type: z.enum(interactionTypeEnum.enumValues),
  content: z.string().trim().min(1, "Contenuto obbligatorio").max(2000),
  scheduledAt: z.string().trim().optional(),
});

export type InteractionState = { error?: string; ok?: boolean };

/** Aggiunge un'interazione manuale (note, call, email_manual, meeting) — PRD §10 Fase 4. */
export async function addInteractionAction(
  _prev: InteractionState,
  formData: FormData,
): Promise<InteractionState> {
  const user = await requireUser();

  const parsed = schema.safeParse({
    prospectId: formData.get("prospectId"),
    type: formData.get("type"),
    content: formData.get("content"),
    scheduledAt: formData.get("scheduledAt") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const scheduledAt =
    parsed.data.scheduledAt && parsed.data.scheduledAt.length > 0
      ? new Date(parsed.data.scheduledAt)
      : null;

  await createInteraction({
    prospectId: parsed.data.prospectId,
    userId: user.id,
    type: parsed.data.type,
    content: parsed.data.content,
    scheduledAt: Number.isNaN(scheduledAt?.getTime() ?? NaN) ? null : scheduledAt,
  });

  revalidatePath(`/prospects/${parsed.data.prospectId}`);
  return { ok: true };
}
