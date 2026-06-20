/**
 * Landing dinamica del prospect — /p/[slug] (PRD §8).
 *
 * STUB di fase fondamenta: la struttura della pagina è pronta ma i dati reali
 * (report + audit + screenshot per slug) verranno caricati dal DB in Fase 2,
 * insieme al design curato e al tracking delle visite (landing_visits).
 */

export default async function ProspectLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
        <span className="mb-4 rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-xs text-neutral-400">
          Anteprima landing · {slug}
        </span>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          La tua proposta personalizzata sta arrivando.
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-neutral-400">
          Questa pagina mostrerà l&apos;analisi del sito attuale, i problemi
          rilevati e la proposta di redesign. I contenuti dinamici (screenshot,
          metriche, copy generato dall&apos;AI) saranno collegati in Fase 2.
        </p>
      </section>
      <footer className="mx-auto max-w-3xl px-6 pb-10 text-center text-sm text-neutral-500">
        Nodomatic · RT Studio
      </footer>
    </main>
  );
}
