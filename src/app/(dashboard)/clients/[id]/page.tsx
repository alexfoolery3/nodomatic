import Link from "next/link";
import { notFound } from "next/navigation";
import { isDbConfigured } from "@/lib/env";
import { requireUser } from "@/lib/auth-guards";
import { getClient } from "@/modules/reporting/data/clients";
import { listConnections } from "@/modules/reporting/data/connections";
import { listConnectionMetrics } from "@/modules/reporting/data/metrics";
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
import { RefreshButton } from "./refresh-button";
import { MetricsChart, type ChartLine } from "./metrics-chart";

export const dynamic = "force-dynamic";

const PROVIDER_LABEL: Record<string, string> = {
  ga4: "GA4",
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  meta_organic: "Social organico",
};

const GA4_LINES: ChartLine[] = [
  { key: "sessions", label: "Sessioni", color: "#6366f1" },
  { key: "users", label: "Utenti", color: "#10b981" },
];
const META_LINES: ChartLine[] = [
  { key: "spend", label: "Spesa €", color: "#6366f1" },
  { key: "clicks", label: "Click", color: "#f59e0b" },
];

const eur = (n: number) => `€ ${n.toLocaleString("it-IT", { maximumFractionDigits: 2 })}`;
const int = (n: number) => Math.round(n).toLocaleString("it-IT");

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured) return null;

  const user = await requireUser();
  const { id } = await params;

  const client = await getClient(id);
  if (!client) notFound();

  const connections = await listConnections(id);
  const isAdmin = user.role === "admin";

  // Dashboard GA4: aggrega le metriche delle connessioni Google Analytics 4.
  const ga4 = connections.filter((c) => c.provider === "ga4");
  const ga4Dashboards = await Promise.all(
    ga4.map(async (conn) => {
      const rows = await listConnectionMetrics(conn.id, 30);
      let sessions = 0;
      let users = 0;
      let conversions = 0;
      const series = rows.map((r) => {
        const m = (r.metrics ?? {}) as Record<string, number>;
        sessions += m.sessions ?? 0;
        users += m.activeUsers ?? 0;
        conversions += m.conversions ?? 0;
        return {
          date: new Date(r.date).toISOString().slice(0, 10),
          sessions: m.sessions ?? 0,
          users: m.activeUsers ?? 0,
        };
      });
      return { conn, series, totals: { sessions, users, conversions } };
    }),
  );

  // Dashboard Meta Ads: aggrega le metriche delle connessioni Meta.
  const meta = connections.filter((c) => c.provider === "meta_ads");
  const metaDashboards = await Promise.all(
    meta.map(async (conn) => {
      const rows = await listConnectionMetrics(conn.id, 30);
      let spend = 0;
      let impressions = 0;
      let clicks = 0;
      let conversions = 0;
      const series = rows.map((r) => {
        const m = (r.metrics ?? {}) as Record<string, number>;
        spend += m.spend ?? 0;
        impressions += m.impressions ?? 0;
        clicks += m.clicks ?? 0;
        conversions += m.conversions ?? 0;
        return {
          date: new Date(r.date).toISOString().slice(0, 10),
          spend: m.spend ?? 0,
          clicks: m.clicks ?? 0,
        };
      });
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpc = clicks > 0 ? spend / clicks : 0;
      return { conn, series, totals: { spend, impressions, clicks, conversions, ctr, cpc } };
    }),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
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
        {isAdmin && <RefreshButton clientId={id} />}
      </div>

      {/* Dashboard GA4 (ultimi 30 giorni) */}
      {ga4Dashboards.map(({ conn, series, totals }) => (
        <Card key={conn.id}>
          <CardHeader>
            <CardTitle>GA4 · {conn.displayName ?? conn.externalId} (ultimi 30 giorni)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Utenti", value: totals.users },
                { label: "Sessioni", value: totals.sessions },
                { label: "Conversioni", value: totals.conversions },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border bg-neutral-50 p-4 text-center">
                  <div className="text-2xl font-semibold">{s.value.toLocaleString("it-IT")}</div>
                  <div className="mt-1 text-xs text-neutral-500">{s.label}</div>
                </div>
              ))}
            </div>
            {series.length > 0 ? (
              <MetricsChart data={series} lines={GA4_LINES} />
            ) : (
              <p className="text-sm text-neutral-500">
                Nessun dato ancora. Premi &quot;Aggiorna dati&quot; per il primo pull.
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Dashboard Meta Ads (ultimi 30 giorni) */}
      {metaDashboards.map(({ conn, series, totals }) => (
        <Card key={conn.id}>
          <CardHeader>
            <CardTitle>
              Meta Ads · {conn.displayName ?? conn.externalId} (ultimi 30 giorni)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Spesa", value: eur(totals.spend) },
                { label: "Impression", value: int(totals.impressions) },
                { label: "Click", value: int(totals.clicks) },
                { label: "CTR", value: `${totals.ctr.toFixed(2)}%` },
                { label: "CPC", value: eur(totals.cpc) },
                { label: "Conversioni", value: int(totals.conversions) },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border bg-neutral-50 p-4 text-center">
                  <div className="text-lg font-semibold">{s.value}</div>
                  <div className="mt-1 text-xs text-neutral-500">{s.label}</div>
                </div>
              ))}
            </div>
            {series.length > 0 ? (
              <MetricsChart data={series} lines={META_LINES} />
            ) : (
              <p className="text-sm text-neutral-500">
                Nessun dato ancora. Premi &quot;Aggiorna dati&quot; per il primo pull.
              </p>
            )}
          </CardContent>
        </Card>
      ))}

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
