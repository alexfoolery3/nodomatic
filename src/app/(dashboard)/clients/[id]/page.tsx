import Link from "next/link";
import { notFound } from "next/navigation";
import { isDbConfigured } from "@/lib/env";
import { requireUser } from "@/lib/auth-guards";
import { getClient } from "@/modules/reporting/data/clients";
import { listConnections } from "@/modules/reporting/data/connections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConnectionForm } from "./connection-form";
import { RemoveConnectionButton } from "./remove-connection-button";

export const dynamic = "force-dynamic";

const PROVIDER_LABEL: Record<string, string> = {
  ga4: "GA4",
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  meta_organic: "Social organico",
};

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured) return null;

  const user = await requireUser();
  const { id } = await params;

  const client = await getClient(id);
  if (!client) notFound();

  const connections = await listConnections(id);
  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/clients" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Clienti
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{client.name}</h1>
        {client.website && (
          <a
            href={client.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-neutral-600 underline underline-offset-2"
          >
            {client.website}
          </a>
        )}
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Collega una sorgente dati</CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectionForm clientId={id} />
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Sorgente</TableHead>
              <TableHead>Etichetta</TableHead>
              <TableHead>ID risorsa</TableHead>
              {isAdmin && <TableHead className="w-24" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {connections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3} className="py-8 text-center text-neutral-500">
                  Nessuna sorgente collegata.
                </TableCell>
              </TableRow>
            ) : (
              connections.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Badge variant="secondary">{PROVIDER_LABEL[c.provider] ?? c.provider}</Badge>
                  </TableCell>
                  <TableCell>{c.displayName ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs text-neutral-600">{c.externalId}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <RemoveConnectionButton id={c.id} clientId={id} />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-neutral-500">
        Dashboard dei dati e report (online + PDF/CSV) arrivano nelle fasi successive: GA4, poi Meta
        Ads, Google Ads e social organico.
      </p>
    </div>
  );
}
