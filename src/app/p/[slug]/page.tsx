/**
 * Landing dinamica del prospect — /p/[slug] (PRD §8).
 *
 * Mostra screenshot del sito attuale + metriche audit + analisi e proposta
 * generate dall'AI. Registra le visite (landing_tracker). Pagina pubblica:
 * build-green con guard isDbConfigured + force-dynamic.
 */
import { notFound } from "next/navigation";
import { isDbConfigured } from "@/lib/env";
import { getLandingDataBySlug } from "@/modules/prospector/data/reports";
import { LandingTracker } from "./landing-tracker";

export const dynamic = "force-dynamic";

function metricColor(v: number | null) {
  if (v == null) return "text-neutral-500";
  if (v >= 90) return "text-green-400";
  if (v >= 50) return "text-amber-400";
  return "text-red-400";
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 text-center">
      <div className={`text-2xl font-semibold ${metricColor(value)}`}>{value ?? "—"}</div>
      <div className="mt-1 text-xs text-neutral-400">{label}</div>
    </div>
  );
}

function Bool({ label, ok }: { label: string; ok: boolean | null }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 text-center">
      <div className={`text-2xl font-semibold ${ok ? "text-green-400" : "text-red-400"}`}>
        {ok ? "✓" : "✗"}
      </div>
      <div className="mt-1 text-xs text-neutral-400">{label}</div>
    </div>
  );
}

export default async function ProspectLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isDbConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-center text-neutral-300">
        <p>Landing non disponibile: configurazione del database mancante.</p>
      </main>
    );
  }

  const data = await getLandingDataBySlug(slug);
  if (!data) notFound();

  const { prospect, audit, report } = data;
  const copy = report?.landingCopy ?? null;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <LandingTracker slug={slug} />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(120,119,198,0.18),transparent)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm text-neutral-400">Proposta per {prospect.businessName}</p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {copy?.headline ?? `Il sito di ${prospect.businessName} può fare molto di più.`}
          </h1>
          {copy?.subheadline && (
            <p className="mt-5 text-pretty text-lg text-neutral-400">{copy.subheadline}</p>
          )}
        </div>
      </section>

      {/* Il tuo sito oggi */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="mb-6 text-xl font-semibold">Il tuo sito oggi</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
            {audit?.screenshotMobile ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={audit.screenshotMobile}
                alt={`Screenshot del sito di ${prospect.businessName}`}
                className="w-full"
              />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center text-sm text-neutral-500">
                anteprima del sito
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 self-start">
            <Metric label="Performance" value={audit?.performanceScore ?? null} />
            <Metric label="SEO" value={audit?.seoScore ?? null} />
            <Metric label="Accessibilità" value={audit?.accessibilityScore ?? null} />
            <Metric label="Best practices" value={audit?.bestPracticesScore ?? null} />
            <Bool label="Mobile friendly" ok={audit?.mobileFriendly ?? null} />
            <Bool label="HTTPS" ok={audit?.hasHttps ?? null} />
          </div>
        </div>
      </section>

      {/* Cosa non va / Come lo risolviamo */}
      {copy && (
        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-xl font-semibold">Cosa non va</h2>
              <ul className="space-y-3">
                {copy.problems.map((p, i) => (
                  <li key={i} className="flex gap-3 text-neutral-300">
                    <span className="text-red-400">●</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-xl font-semibold">Come lo risolviamo</h2>
              <ul className="space-y-3">
                {copy.solutions.map((s, i) => (
                  <li key={i} className="flex gap-3 text-neutral-300">
                    <span className="text-green-400">●</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <a
          href="mailto:hello@nodomatic.com"
          className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
        >
          {copy?.cta ?? "Prenota una call"}
        </a>
      </section>

      <footer className="mx-auto max-w-3xl px-6 pb-10 text-center text-sm text-neutral-500">
        Nodomatic · RT Studio
      </footer>
    </main>
  );
}
