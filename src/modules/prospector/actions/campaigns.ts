"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth-guards";
import { createCampaign, deleteCampaign, setCampaignStatus } from "../data/campaigns";
import { inngest } from "../inngest/client";

/** Validazione input (Zod obbligatorio su tutte le mutation — PRD §0). */
const createCampaignSchema = z.object({
  name: z.string().trim().min(1, "Nome obbligatorio").max(120),
  city: z.string().trim().min(1, "Città obbligatoria").max(80),
  category: z.string().trim().min(1, "Categoria obbligatoria").max(80),
  // Quante attività scrapare: bound difensivo (basso volume — PRD §1.5).
  scrapeLimit: z.coerce.number().int().min(10).max(150).default(50),
});

export type CreateCampaignState = { error?: string; ok?: boolean };

type CampaignActionResult = { error?: string; ok?: boolean };

const campaignIdSchema = z.string().uuid();

/** Guardia admin condivisa: ritorna un errore se l'utente non è admin, altrimenti null. */
async function ensureAdmin(): Promise<CampaignActionResult | null> {
  const user = await requireUser();
  if (user.role !== "admin") return { error: "Solo gli amministratori." };
  return null;
}

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
    scrapeLimit: formData.get("scrapeLimit") ?? undefined,
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
    try {
      await inngest.send({
        name: "prospector/campaign.scrape.requested",
        data: { campaignId: campaign.id },
      });
    } catch (err) {
      // Inngest non configurato (manca INNGEST_EVENT_KEY) o invio fallito: la
      // campagna resta creata, ma senza scraping avviato. Riportiamo lo status a
      // "draft" e informiamo l'utente, invece di far crashare la pagina.
      console.error("[campaigns] invio evento scrape fallito:", err);
      await setCampaignStatus(campaign.id, "draft");
      revalidatePath("/campaigns");
      return {
        error:
          "Campagna creata, ma lo scraping non è partito: Inngest non è configurato. Aggiungi INNGEST_EVENT_KEY/INNGEST_SIGNING_KEY e sincronizza /api/inngest.",
      };
    }
  }

  revalidatePath("/campaigns");
  return { ok: true };
}

/** Archivia una campagna (soft: resta nel DB, nascosta di default). Solo admin (Fase 1 — 1C). */
export async function archiveCampaignAction(id: string): Promise<CampaignActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  if (!campaignIdSchema.safeParse(id).success) return { error: "ID non valido." };

  await setCampaignStatus(id, "archived");
  revalidatePath("/campaigns");
  return { ok: true };
}

/** Ripristina una campagna archiviata (torna a draft). Solo admin (Fase 1 — 1C). */
export async function unarchiveCampaignAction(id: string): Promise<CampaignActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  if (!campaignIdSchema.safeParse(id).success) return { error: "ID non valido." };

  await setCampaignStatus(id, "draft");
  revalidatePath("/campaigns");
  return { ok: true };
}

/** Elimina definitivamente una campagna (cascade sui prospect). Solo admin (Fase 1 — 1C). */
export async function deleteCampaignAction(id: string): Promise<CampaignActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  if (!campaignIdSchema.safeParse(id).success) return { error: "ID non valido." };

  await deleteCampaign(id);
  revalidatePath("/campaigns");
  redirect("/campaigns");
}
