import Link from "next/link";
import { isDbConfigured } from "@/lib/env";
import { getGlobalAnalytics } from "@/modules/prospector/data/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Dashboard",
};

const modules = [
  {
    name: "Campagne",
    description: "Crea una campagna (categoria + città) e lancia lo scraping.",
    phase: "Fase 1",
  },
  {
    name: "Prospect",
    description: "Lista auditata e ordinata per score, con filtri.",
    phase: "Fase 1",
  },
  {
    name: "Landing",
    description: "Pagine personalizzate /p/[slug] per ogni prospect qualificato.",
    phase: "Fase 2",
  },
  {
    name: "Outreach & CRM",
    description: "Email tracciate, follow-up automatici, schede prospect.",
    phase: "Fase 3-4",
  },
];

export default async function DashboardPage() {
  const analytics = isDbConfigured ? await getGlobalAnalytics() : null;

  const stats = analytics
    ? [
        { label: "Prospect", value: analytics.total },
        { label: "Contattati", value: analytics.contacted },
        { label: "Aperture", value: `${analytics.openRate}%` },
        { label: "Click", value: `${analytics.clickRate}%` },
        { label: "Risposte", value: `${analytics.replyRate}%` },
        { label: "Vinti", value: analytics.won },
      ]
    : [];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Prospector</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Modulo di acquisizione clienti. Panoramica e moduli.
          </p>
        </div>
        <Button asChild>
          <Link href="/campaigns">Campagne</Link>
        </Button>
      </div>

      {stats.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="py-4 text-center">
                <div className="text-2xl font-semibold">{s.value}</div>
                <div className="mt-1 text-xs text-neutral-500">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <Card key={m.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{m.name}</CardTitle>
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">
                  {m.phase}
                </span>
              </div>
              <CardDescription>{m.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
