/**
 * Data layer — clienti (entità condivisa). Runtime-only.
 */
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";

export async function listClients() {
  return db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getClient(id: string) {
  const rows = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createClient(input: {
  name: string;
  website: string | null;
  notes: string | null;
  prospectId?: string | null;
}) {
  const rows = await db
    .insert(clients)
    .values({
      name: input.name,
      website: input.website,
      notes: input.notes,
      prospectId: input.prospectId ?? null,
    })
    .returning();
  return rows[0];
}
