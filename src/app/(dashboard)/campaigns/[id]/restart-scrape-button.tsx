"use client";

/**
 * Pulsante "Riavvia scraping": ri-invia l'evento Inngest per una campagna rimasta
 * bloccata (es. evento perso prima del sync). La pagina lo mostra solo quando la
 * campagna ha 0 prospect, per evitare duplicati (lo scraping non deduplica).
 */
import { useState, useTransition } from "react";
import { restartScrapeAction } from "@/modules/prospector/actions/campaigns";
import { Button } from "@/components/ui/button";

export function RestartScrapeButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await restartScrapeAction(id);
            setMsg(res.error ?? "Scraping riavviato.");
          })
        }
      >
        {pending ? "Riavvio…" : "Riavvia scraping"}
      </Button>
      {msg && <span className="text-xs text-neutral-500">{msg}</span>}
    </div>
  );
}
