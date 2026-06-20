import Link from "next/link";
import { isDbConfigured } from "@/lib/env";
import { requireUser } from "@/lib/auth-guards";
import { listClients } from "@/modules/reporting/data/clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientForm } from "./client-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clienti" };

export default async function ClientsPage() {
  if (!isDbConfigured) return null;

  const user = await requireUser();
  const clients = await listClients();
  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clienti</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Analisi marketing dei clienti (GA4, Meta, Google Ads, social) — report online ed esportabili.
        </p>
      </div>

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Nuovo cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientForm />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-neutral-500">Solo gli amministratori possono creare clienti.</p>
      )}

      <div className="space-y-3">
        {clients.length === 0 ? (
          <p className="text-sm text-neutral-500">Nessun cliente ancora.</p>
        ) : (
          clients.map((c) => (
            <Link
              key={c.id}
              href={`/clients/${c.id}`}
              className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 hover:bg-neutral-50"
            >
              <div className="font-medium">{c.name}</div>
              <span className="text-sm text-neutral-500">{c.website ?? ""}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
