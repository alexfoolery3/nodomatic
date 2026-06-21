"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth-guards";
import { getClient } from "../data/clients";
import { compileAndStoreReport } from "../report-service";

export type ReportActionState = { error?: string; ok?: boolean; slug?: string };

/** Genera il report dell'ultimo mese per un cliente (admin). */
export async function generateReportAction(clientId: string): Promise<ReportActionState> {
  const user = await requireUser();
  if (user.role !== "admin") return { error: "Solo gli amministratori." };

  const id = z.string().uuid().safeParse(clientId);
  if (!id.success) return { error: "Cliente non valido." };

  const client = await getClient(id.data);
  if (!client) return { error: "Cliente non trovato." };

  const until = new Date();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const report = await compileAndStoreReport(id.data, client.name, since, until);
  revalidatePath(`/clients/${id.data}`);
  return { ok: true, slug: report.slug ?? undefined };
}
