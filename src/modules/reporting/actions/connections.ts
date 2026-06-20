"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth-guards";
import { connectionProviderEnum } from "@/lib/db/schema";
import { addConnection, removeConnection } from "../data/connections";

export type ConnectionActionState = { error?: string; ok?: boolean };

const addSchema = z.object({
  clientId: z.string().uuid(),
  provider: z.enum(connectionProviderEnum.enumValues),
  externalId: z.string().trim().min(1, "ID risorsa obbligatorio").max(120),
  displayName: z.string().trim().max(120).optional(),
});

/** Collega una sorgente dati al cliente (GA4 property, Meta ad account, ...). Solo admin. */
export async function addConnectionAction(
  _prev: ConnectionActionState,
  formData: FormData,
): Promise<ConnectionActionState> {
  const user = await requireUser();
  if (user.role !== "admin") return { error: "Solo gli amministratori." };

  const parsed = addSchema.safeParse({
    clientId: formData.get("clientId"),
    provider: formData.get("provider"),
    externalId: formData.get("externalId"),
    displayName: formData.get("displayName") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  await addConnection({
    clientId: parsed.data.clientId,
    provider: parsed.data.provider,
    externalId: parsed.data.externalId,
    displayName: parsed.data.displayName || null,
  });

  revalidatePath(`/clients/${parsed.data.clientId}`);
  return { ok: true };
}

const removeSchema = z.object({ id: z.string().uuid(), clientId: z.string().uuid() });

export async function removeConnectionAction(input: {
  id: string;
  clientId: string;
}): Promise<ConnectionActionState> {
  const user = await requireUser();
  if (user.role !== "admin") return { error: "Solo gli amministratori." };

  const parsed = removeSchema.safeParse(input);
  if (!parsed.success) return { error: "Input non valido." };

  await removeConnection(parsed.data.id);
  revalidatePath(`/clients/${parsed.data.clientId}`);
  return { ok: true };
}
