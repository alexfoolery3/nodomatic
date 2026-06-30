"use client";

/**
 * Indicatore di lavorazione + auto-refresh della pagina campagna.
 * Mentre la campagna è in uno stato "di lavoro" (scraping/auditing) ricarica i dati
 * server ogni pochi secondi, così i prospect e gli score compaiono man mano senza
 * reload manuale. Smette quando il lavoro finisce o dopo un tetto di tempo
 * (per non pollare all'infinito se qualcosa si blocca).
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const WORKING = new Set(["scraping", "auditing"]);
const REFRESH_MS = 4000;
const MAX_MS = 3 * 60 * 1000; // smette di pollare dopo ~3 min

export function CampaignProgress({ status }: { status: string }) {
  const router = useRouter();
  const working = WORKING.has(status);
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    if (!working) return;
    setStalled(false);
    const start = Date.now();
    const t = setInterval(() => {
      if (Date.now() - start > MAX_MS) {
        setStalled(true);
        clearInterval(t);
        return;
      }
      router.refresh();
    }, REFRESH_MS);
    return () => clearInterval(t);
  }, [working, status, router]);

  if (!working) return null;

  if (stalled) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Sta impiegando più del previsto. Ricarica la pagina tra poco; se resta fermo,
        controlla che lo scraping (Inngest) sia attivo.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      <span className="relative flex size-2.5 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-blue-500" />
      </span>
      <span>
        {status === "scraping"
          ? "Ricerca su Google Maps in corso… i prospect compaiono qui sotto man mano."
          : "Analisi dei siti in corso… gli score si popolano man mano."}
      </span>
      <span className="text-blue-500">· aggiornamento automatico</span>
    </div>
  );
}
