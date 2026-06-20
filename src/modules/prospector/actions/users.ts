"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authAdmin } from "@/lib/auth";
import { requireUser } from "@/lib/auth-guards";
import { roleEnum } from "@/lib/db/schema";
import { setUserRole, setUserRoleByEmail } from "../data/users";

const inviteSchema = z.object({
  name: z.string().trim().min(1, "Nome obbligatorio").max(120),
  email: z.string().trim().toLowerCase().email("Email non valida"),
  password: z.string().min(8, "Password troppo corta (min 8)").max(100),
  role: z.enum(roleEnum.enumValues),
});

export type UserActionState = { error?: string; ok?: boolean; createdEmail?: string };

/**
 * Invita un membro del team: crea l'utente (BetterAuth) con ruolo (PRD §2, §10 Fase 4).
 * Uso interno → l'admin imposta una password iniziale che comunica alla persona.
 * Solo admin.
 */
export async function inviteUserAction(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const admin = await requireUser();
  if (admin.role !== "admin") return { error: "Solo gli amministratori possono invitare utenti." };

  const parsed = inviteSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    // authAdmin: niente cookie → non sostituisce la sessione dell'admin.
    await authAdmin.api.signUpEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.name,
      },
    });
  } catch {
    return { error: "Creazione fallita: l'email potrebbe essere già registrata." };
  }

  await setUserRoleByEmail(parsed.data.email, parsed.data.role);
  revalidatePath("/team");
  return { ok: true, createdEmail: parsed.data.email };
}

const roleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(roleEnum.enumValues),
});

/** Aggiorna il ruolo di un utente. Solo admin. */
export async function setUserRoleAction(input: {
  userId: string;
  role: string;
}): Promise<UserActionState> {
  const admin = await requireUser();
  if (admin.role !== "admin") return { error: "Solo gli amministratori." };

  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) return { error: "Input non valido." };

  await setUserRole(parsed.data.userId, parsed.data.role);
  revalidatePath("/team");
  return { ok: true };
}
