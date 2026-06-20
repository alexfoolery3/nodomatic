/**
 * Export CSV dei prospect di una campagna (PRD §10 Fase 4).
 * Route handler: l'auth gate del layout non lo copre → controllo qui.
 */
import { getCurrentUser } from "@/lib/auth-guards";
import { isDbConfigured } from "@/lib/env";
import { getCampaign } from "@/modules/prospector/data/campaigns";
import { listProspectsByCampaign } from "@/modules/prospector/data/prospects";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured) return new Response("DB non configurato", { status: 503 });

  const user = await getCurrentUser();
  if (!user) return new Response("Non autorizzato", { status: 401 });

  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) return new Response("Campagna non trovata", { status: 404 });

  const rows = await listProspectsByCampaign(id);
  const header = ["business_name", "website", "email", "phone", "category", "score", "status", "slug"];
  const lines = [header.join(",")];
  for (const { prospect: p } of rows) {
    lines.push(
      [p.businessName, p.website, p.email, p.phone, p.category, p.prospectScore, p.status, p.slug]
        .map(csvCell)
        .join(","),
    );
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="campagna-${id}.csv"`,
    },
  });
}
