"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth-guards";
import { isApolloConfigured } from "../integrations/apollo";
import { insertManualProspect, setProspectMonitored } from "../data/prospects";
import { inngest } from "../inngest/client";

const schema = z.object({
  campaignId: z.string().uuid(),
  businessName: z.string().trim().min(1, "Nome obbligatorio").max(160),
  website: z.union([z.string().trim().url("URL non valido"), z.literal("")]).optional(),
  email: z.union([z.string().trim().toLowerCase().email("Email non valida"), z.literal("")]).optional(),
  phone: z.string().trim().max(40).optional(),
  category: z.string().trim().max(80).optional(),
  address: z.string().trim().max(200).optional(),
});

export type ManualProspectState = { error?: string; ok?: boolean };

/**
 * Aggiunge a mano un prospect/cliente (non da scraping) a una campagna.
 * Avvia comunque l'audit (se c'è un sito) per farlo entrare nel funnel.
 */
export async function addManualProspectAction(
  _prev: ManualProspectState,
  formData: FormData,
): Promise<ManualProspectState> {
  await requireUser();

  const parsed = schema.safeParse({
    campaignId: formData.get("campaignId"),
    businessName: formData.get("businessName"),
    website: formData.get("website") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    category: formData.get("category") ?? "",
    address: formData.get("address") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  const d = parsed.data;

  const prospect = await insertManualProspect(d.campaignId, {
    businessName: d.businessName,
    website: d.website || null,
    email: d.email || null,
    phone: d.phone || null,
    category: d.category || null,
    address: d.address || null,
  });

  // Entra nel funnel come un prospect scrapato: audit → scoring → (se qualificato) AI.
  await inngest.send({
    name: "prospector/prospect.audit.requested",
    data: { prospectId: prospect.id },
  });

  // Se manca l'email ma c'è un sito, prova l'arricchimento Apollo (se configurato).
  if (isApolloConfigured && prospect.website && !prospect.email) {
    await inngest.send({
      name: "prospector/prospect.enrich.requested",
      data: { prospectId: prospect.id },
    });
  }

  revalidatePath(`/campaigns/${d.campaignId}`);
  return { ok: true };
}

const monitoredSchema = z.object({
  prospectId: z.string().uuid(),
  monitored: z.boolean(),
});

/** Attiva/disattiva il monitoraggio continuo del sito di un prospect/cliente. */
export async function setProspectMonitoredAction(input: {
  prospectId: string;
  monitored: boolean;
}): Promise<ManualProspectState> {
  await requireUser();
  const parsed = monitoredSchema.safeParse(input);
  if (!parsed.success) return { error: "Input non valido." };

  await setProspectMonitored(parsed.data.prospectId, parsed.data.monitored);
  revalidatePath(`/prospects/${parsed.data.prospectId}`);
  return { ok: true };
}
