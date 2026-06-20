import Link from "next/link";
import { notFound } from "next/navigation";
import { isDbConfigured } from "@/lib/env";
import { requireUser } from "@/lib/auth-guards";
import { getCampaign } from "@/modules/prospector/data/campaigns";
import { listProspectsByCampaign } from "@/modules/prospector/data/prospects";
import { getCampaignAnalytics } from "@/modules/prospector/data/analytics";
import { prospectStatusEnum, type ProspectStatus } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusSelect } from "@/components/status-select";
import { OutreachButton } from "./outreach-button";
import { ManualProspectForm } from "./manual-prospect-form";

export const dynamic = "force-dynamic";

function scoreBadge(score: number | null) {
  if (score == null) return <Badge variant="outline">—</Badge>;
  if (score >= 8) return <Badge variant="destructive">{score}</Badge>;
  if (score >= 6) return <Badge variant="warning">{score}</Badge>;
  return <Badge variant="secondary">{score}</Badge>;
}

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; minScore?: string; q?: string }>;
}) {
  if (!isDbConfigured) return null;

  await requireUser();
  const { id } = await params;
  const sp = await searchParams;

  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  const status = (prospectStatusEnum.enumValues as readonly string[]).includes(sp.status ?? "")
    ? (sp.status as ProspectStatus)
    : undefined;
  const minScore = sp.minScore ? Number(sp.minScore) : undefined;

  const [rows, analytics] = await Promise.all([
    listProspectsByCampaign(id, {
      status,
      minScore: Number.isFinite(minScore) ? minScore : undefined,
      q: sp.q,
    }),
    getCampaignAnalytics(id),
  ]);

  const stats = [
    { label: "Prospect", value: analytics.total },
    { label: "Contattati", value: analytics.contacted },
    { label: "Aperture", value: `${analytics.openRate}%` },
    { label: "Click", value: `${analytics.clickRate}%` },
    { label: "Risposte", value: `${analytics.replyRate}%` },
    { label: "Vinti", value: analytics.won },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/campaigns" className="text-sm text-neutral-500 hover:text-neutral-900">
            ← Campagne
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{campaign.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {campaign.category} · {campaign.city} · stato {campaign.status}
          </p>
        </div>
        <OutreachButton campaignId={id} />
      </div>

      {/* Analytics aggregati (PRD §10 Fase 4) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-semibold">{s.value}</div>
              <div className="mt-1 text-xs text-neutral-500">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtri (GET): ricerca + stato + score minimo */}
      <form className="flex flex-wrap items-end gap-3" method="get">
        <div className="space-y-1">
          <label className="text-xs text-neutral-500">Ricerca</label>
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="nome attività…"
            className="h-9 w-48 rounded-md border bg-white px-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-neutral-500">Stato</label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-9 rounded-md border bg-white px-2 text-sm"
          >
            <option value="">Tutti</option>
            {prospectStatusEnum.enumValues.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-neutral-500">Score minimo</label>
          <input
            type="number"
            name="minScore"
            min={0}
            max={10}
            defaultValue={sp.minScore ?? ""}
            className="h-9 w-28 rounded-md border bg-white px-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white"
        >
          Filtra
        </button>
        <a
          href={`/campaigns/${id}/export`}
          className="h-9 rounded-md border px-4 text-sm font-medium leading-9 text-neutral-700 hover:bg-neutral-50"
        >
          Export CSV
        </a>
      </form>

      <ManualProspectForm campaignId={id} />

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Score</TableHead>
              <TableHead>Attività</TableHead>
              <TableHead>Sito</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Landing</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-neutral-500">
                  Nessun prospect. Lo scraping potrebbe essere ancora in corso.
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ prospect, audit }) => (
                <TableRow key={prospect.id}>
                  <TableCell>{scoreBadge(prospect.prospectScore)}</TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/prospects/${prospect.id}`}
                      className="hover:underline underline-offset-2"
                    >
                      {prospect.businessName}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[14rem] truncate">
                    {prospect.website ? (
                      <a
                        href={prospect.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-600 underline underline-offset-2"
                      >
                        {prospect.website}
                      </a>
                    ) : (
                      <span className="text-neutral-400">nessun sito</span>
                    )}
                  </TableCell>
                  <TableCell>{audit?.performanceScore ?? "—"}</TableCell>
                  <TableCell>
                    <StatusSelect
                      prospectId={prospect.id}
                      campaignId={id}
                      value={prospect.status}
                    />
                  </TableCell>
                  <TableCell>
                    {prospect.slug ? (
                      <Link
                        href={`/p/${prospect.slug}`}
                        className="text-neutral-600 underline underline-offset-2"
                      >
                        /p/{prospect.slug}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
