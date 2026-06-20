import Link from "next/link";
import { isDbConfigured } from "@/lib/env";
import { requireUser } from "@/lib/auth-guards";
import { listCampaigns } from "@/modules/prospector/data/campaigns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CampaignForm } from "./campaign-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Campagne" };

export default async function CampaignsPage() {
  // Il layout mostra l'avviso di setup quando manca il DB; qui evitiamo query a vuoto.
  if (!isDbConfigured) return null;

  const user = await requireUser();
  const campaigns = await listCampaigns();
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
        {campaigns.length === 0 ? (
          <p className="text-sm text-neutral-500">Nessuna campagna ancora.</p>
        ) : (
          campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 hover:bg-neutral-50"
            >
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-neutral-500">
                  {c.category} · {c.city}
                </div>
              </div>
              <Badge variant="secondary">{c.status}</Badge>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
