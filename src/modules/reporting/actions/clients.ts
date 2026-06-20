"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth-guards";
import { createClient } from "../data/clients";

const schema = z.object({
  name: z.string().trim().min(1, "Nome obbligatorio").max(160),
  website: z.union([z.string().trim().url("URL non valido"), z.literal("")]).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type ClientActionState = { error?: string; ok?: boolean };

/** Crea un cliente. Solo admin (gestione configurazione, PRD §2). */
export async function createClientAction(
  _prev: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const user = await requireUser();
  if (user.role !== "admin") return { error: "Solo gli amministratori possono creare clienti." };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    website: formData.get("website") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  await createClient({
    name: parsed.data.name,
    website: parsed.data.website || null,
    notes: parsed.data.notes || null,
  });

  revalidatePath("/clients");
  return { ok: true };
}
