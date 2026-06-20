/**
 * Data layer — connessioni dati di un cliente (GA4, Meta, ...). Runtime-only.
 */
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { repConnections, type ConnectionProvider } from "@/lib/db/schema";

export async function listConnections(clientId: string) {
  return db
    .select()
    .from(repConnections)
    .where(eq(repConnections.clientId, clientId))
    .orderBy(desc(repConnections.createdAt));
}

export async function getConnection(id: string) {
  const rows = await db.select().from(repConnections).where(eq(repConnections.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function listActiveConnections() {
  return db.select().from(repConnections).where(eq(repConnections.active, true));
}

export async function addConnection(input: {
  clientId: string;
  provider: ConnectionProvider;
  externalId: string;
  displayName: string | null;
}) {
  await db.insert(repConnections).values({
    clientId: input.clientId,
    provider: input.provider,
    externalId: input.externalId,
    displayName: input.displayName,
  });
}

export async function removeConnection(id: string) {
  await db.delete(repConnections).where(eq(repConnections.id, id));
}
