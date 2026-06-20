"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth-guards";
import { createCampaign } from "../data/campaigns";
import { inngest } from "../inngest/client";

/** Validazione input (Zod obbligatorio su tutte le mutation — PRD §0). */
const createCampaignSchema = z.object({
  name: z.string().trim().min(1, "Nome obbligatorio").max(120),
  city: z.string().trim().min(1, "Città obbligatoria").max(80),
  category: z.string().trim().min(1, "Categoria obbligatoria").max(80),
});

export type CreateCampaignState = { error?: string; ok?: boolean };

/**
 * Crea una campagna e avvia lo scraping (PRD §3 [1][2]).
 * Solo gli admin possono lanciare campagne (PRD §2).
 */
export async function createCampaignAction(
  _prev: CreateCampaignState,
  formData: FormData,
): Promise<CreateCampaignState> {
  const user = await requireUser();
  if (user.role !== "admin") {
    return { error: "Solo gli amministratori possono lanciare campagne." };
  }

  const parsed = createCampaignSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
    category: formData.get("category"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  // Checkbox: se deselezionato, crea una campagna "contenitore" senza scraping
  // (utile per lead manuali / clienti esistenti).
  const scrape = formData.get("scrape") !== null;

  const campaign = await createCampaign({
    ...parsed.data,
    createdBy: user.id,
    status: scrape ? "scraping" : "draft",
  });

  if (scrape) {
    await inngest.send({
      name: "prospector/campaign.scrape.requested",
      data: { campaignId: campaign.id },
    });
  }

  revalidatePath("/campaigns");
  return { ok: true };
}
