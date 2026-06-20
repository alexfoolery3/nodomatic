import Link from "next/link";
import { notFound } from "next/navigation";
import { isDbConfigured } from "@/lib/env";
import { requireUser } from "@/lib/auth-guards";
import { getAuditByProspectId, getProspect } from "@/modules/prospector/data/prospects";
import { getReportByProspectId } from "@/modules/prospector/data/reports";
import { listEventsByProspect } from "@/modules/prospector/data/emailEvents";
import { listInteractionsByProspect } from "@/modules/prospector/data/interactions";
import { StatusSelect } from "@/components/status-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InteractionForm } from "./interaction-form";

export const dynamic = "force-dynamic";

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleString("it-IT") : "—";
}

export default async function ProspectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured) return null;
  await requireUser();
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) notFound();

  const [audit, report, events, interactions] = await Promise.all([
    getAuditByProspectId(id),
    getReportByProspectId(id),
    listEventsByProspect(id),
    listInteractionsByProspect(id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/campaigns/${prospect.campaignId}`}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← Campagna
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{prospect.businessName}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {[prospect.category, prospect.phone, prospect.email].filter(Boolean).join(" · ") || "—"}
          </p>
          {prospect.website && (
            <a
              href={prospect.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neutral-600 underline underline-offset-2"
            >
              {prospect.website}
            </a>
          )}
        </div>
        <div className="flex items-center gap-3">
          {prospect.prospectScore != null && (
            <Badge variant={prospect.prospectScore >= 6 ? "destructive" : "secondary"}>
              score {prospect.prospectScore}
            </Badge>
          )}
          <StatusSelect prospectId={prospect.id} campaignId={prospect.campaignId} value={prospect.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Audit */}
        <Card>
          <CardHeader>
            <CardTitle>Audit</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-neutral-700">
            {audit ? (
              <ul className="grid grid-cols-2 gap-2">
                <li>Performance: {audit.performanceScore ?? "—"}</li>
                <li>SEO: {audit.seoScore ?? "—"}</li>
                <li>Accessibilità: {audit.accessibilityScore ?? "—"}</li>
                <li>Best practices: {audit.bestPracticesScore ?? "—"}</li>
                <li>Mobile: {audit.mobileFriendly ? "sì" : "no"}</li>
                <li>HTTPS: {audit.hasHttps ? "sì" : "no"}</li>
                <li>Caricamento: {audit.loadTimeMs ? `${(audit.loadTimeMs / 1000).toFixed(1)}s` : "—"}</li>
              </ul>
            ) : (
              <p className="text-neutral-500">Audit non ancora disponibile.</p>
            )}
          </CardContent>
        </Card>

        {/* Landing / report */}
        <Card>
          <CardHeader>
            <CardTitle>Landing & contenuti AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-neutral-700">
            {prospect.slug && (
              <Link
                href={`/p/${prospect.slug}`}
                className="inline-block text-neutral-600 underline underline-offset-2"
              >
                Apri landing /p/{prospect.slug}
              </Link>
            )}
            {report ? (
              <>
                <p className="text-neutral-600">{report.analysisText}</p>
                {report.emailSubject && (
                  <p className="text-neutral-500">
                    <span className="font-medium">Email:</span> {report.emailSubject}
                  </p>
                )}
              </>
            ) : (
              <p className="text-neutral-500">Contenuti non ancora generati.</p>
            )}
          </CardContent>
        </Card>

        {/* Storico email */}
        <Card>
          <CardHeader>
            <CardTitle>Storico email</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {events.length === 0 ? (
              <p className="text-neutral-500">Nessun evento email.</p>
            ) : (
              <ul className="space-y-1">
                {events.map((e) => (
                  <li key={e.id} className="flex justify-between text-neutral-700">
                    <span>{e.eventType}</span>
                    <span className="text-neutral-400">{fmt(e.occurredAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Interazioni */}
        <Card>
          <CardHeader>
            <CardTitle>Interazioni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <InteractionForm prospectId={prospect.id} />
            {interactions.length === 0 ? (
              <p className="text-neutral-500">Nessuna interazione registrata.</p>
            ) : (
              <ul className="space-y-3">
                {interactions.map(({ interaction, userName }) => (
                  <li key={interaction.id} className="border-l-2 border-neutral-200 pl-3">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>
                        {interaction.type}
                        {userName ? ` · ${userName}` : ""}
                      </span>
                      <span>{fmt(interaction.createdAt)}</span>
                    </div>
                    <p className="text-neutral-700">{interaction.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
