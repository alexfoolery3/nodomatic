import Link from "next/link";
import { isDbConfigured } from "@/lib/env";
import { requireUser } from "@/lib/auth-guards";
import { listCampaignsWithCounts } from "@/modules/prospector/data/campaigns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CampaignForm } from "./campaign-form";
import { CampaignActions } from "./campaign-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Campagne" };

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  // Il layout mostra l'avviso di setup quando manca il DB; qui evitiamo query a vuoto.
  if (!isDbConfigured) return null;

  const user = await requireUser();
  const { archived } = await searchParams;
  const includeArchived = archived === "1";
  const campaigns = await listCampaignsWithCounts({ includeArchived });
  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Campagne</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Scegli categoria + città per avviare scraping e audit.
        </p>
      </div>

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Nuova campagna</CardTitle>
          </CardHeader>
          <CardContent>
            <CampaignForm />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-neutral-500">
          Solo gli amministratori possono lanciare campagne.
        </p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700">
            {includeArchived ? "Tutte le campagne" : "Campagne attive"}
          </h2>
          <Link
            href={includeArchived ? "/campaigns" : "/campaigns?archived=1"}
            className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
          >
            {includeArchived ? "Nascondi archiviate" : "Mostra archiviate"}
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-white px-4 py-8 text-center text-sm text-neutral-500">
            {includeArchived
              ? "Nessuna campagna."
              : isAdmin
                ? "Nessuna campagna ancora. Compila il form qui sopra per crearne una."
                : "Nessuna campagna ancora."}
          </p>
        ) : (
          campaigns.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-4 rounded-lg border bg-white px-4 py-3 hover:bg-neutral-50"
            >
              <Link href={`/campaigns/${c.id}`} className="min-w-0 flex-1">
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-neutral-500">
                  {c.category} · {c.city} · {Number(c.prospectCount)} prospect
                </div>
              </Link>
              <div className="flex shrink-0 items-center gap-3">
                <Badge variant="secondary">{c.status}</Badge>
                {isAdmin && <CampaignActions id={c.id} status={c.status} />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
