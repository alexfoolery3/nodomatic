"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth-guards";
import { inngest } from "@/lib/inngest";
import { listConnections } from "../data/connections";

export type RefreshState = { error?: string; ok?: boolean; count?: number };

/** Avvia il pull dati per tutte le connessioni attive di un cliente. Solo admin. */
export async function refreshClientAction(clientId: string): Promise<RefreshState> {
  const user = await requireUser();
  if (user.role !== "admin") return { error: "Solo gli amministratori." };

  const id = z.string().uuid().safeParse(clientId);
  if (!id.success) return { error: "Cliente non valido." };

  const active = (await listConnections(id.data)).filter((c) => c.active);
  if (active.length > 0) {
    await inngest.send(
      active.map((c) => ({
        name: "reporting/connection.refresh.requested",
        data: { connectionId: c.id },
      })),
    );
  }

  revalidatePath(`/clients/${id.data}`);
  return { ok: true, count: active.length };
}
