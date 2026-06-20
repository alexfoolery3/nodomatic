/**
 * Guardie di autenticazione/autorizzazione (server).
 * Riusano l'istanza BetterAuth di `@/lib/auth`. Girano solo a runtime.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@/lib/db/schema";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const u = session.user as { id: string; email: string; name: string; role?: Role };
  return { id: u.id, email: u.email, name: u.name, role: u.role ?? "sales" };
}

/** Richiede un utente loggato, altrimenti redirect alla pagina di login. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
