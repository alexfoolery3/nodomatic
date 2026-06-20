/**
 * Data layer — utenti del team (Drizzle). Runtime-only.
 * La creazione utente passa da BetterAuth (vedi actions/users.ts); qui solo lettura e ruoli.
 */
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, type Role } from "@/lib/db/schema";

export async function listUsers() {
  return db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(asc(user.createdAt));
}

export async function setUserRole(id: string, role: Role) {
  await db.update(user).set({ role }).where(eq(user.id, id));
}

export async function setUserRoleByEmail(email: string, role: Role) {
  await db.update(user).set({ role }).where(eq(user.email, email));
}
