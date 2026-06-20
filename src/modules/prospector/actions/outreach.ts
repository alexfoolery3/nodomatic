"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth-guards";
import { prospectStatusEnum } from "@/lib/db/schema";
import { setCampaignStatus } from "../data/campaigns";
import { listOutreachTargets, setProspectStatus } from "../data/prospects";
import { inngest } from "../inngest/client";

export type OutreachActionState = { error?: string; ok?: boolean; count?: number };

/**
 * Avvia l'outreach di una campagna: invia un evento di sequenza per ogni prospect
 * qualificato con email + report (PRD §9). Solo admin (PRD §2).
 */
export async function startOutreachAction(campaignId: string): Promise<OutreachActionState> {
  const user = await requireUser();
  if (user.role !== "admin") {
    return { error: "Solo gli amministratori possono avviare l'outreach." };
  }

  const id = z.string().uuid().safeParse(campaignId);
  if (!id.success) return { error: "Campagna non valida." };

  const targets = await listOutreachTargets(id.data);
  if (targets.length > 0) {
    await inngest.send(
      targets.map((t) => ({
        name: "prospector/prospect.outreach.requested",
        data: { prospectId: t.id },
      })),
    );
    await setCampaignStatus(id.data, "active");
  }

  revalidatePath(`/campaigns/${id.data}`);
  return { ok: true, count: targets.length };
}

const statusSchema = z.object({
  prospectId: z.string().uuid(),
  campaignId: z.string().uuid(),
  status: z.enum(prospectStatusEnum.enumValues),
});

/**
 * Aggiorna manualmente lo stato di un prospect (es. Sales marca "replied" per
 * fermare l'automazione, o "won"/"lost"). Sales e admin (PRD §2, §9).
 */
export async function setProspectStatusAction(input: {
  prospectId: string;
  campaignId: string;
  status: string;
}): Promise<OutreachActionState> {
  await requireUser();
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { error: "Input non valido." };

  await setProspectStatus(parsed.data.prospectId, parsed.data.status);
  revalidatePath(`/campaigns/${parsed.data.campaignId}`);
  return { ok: true };
}
