"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { startOutreachAction } from "@/modules/prospector/actions/outreach";

/** Avvia l'outreach della campagna (PRD §9). Solo admin (controllato server-side). */
export function OutreachButton({ campaignId }: { campaignId: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <Button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await startOutreachAction(campaignId);
            setMsg(
              res.error ??
                (res.count === 0
                  ? "Nessun prospect pronto (serve email + report)"
                  : `Outreach avviato per ${res.count} prospect`),
            );
          })
        }
      >
        {pending ? "Avvio…" : "Avvia outreach"}
      </Button>
      {msg && <span className="text-sm text-neutral-500">{msg}</span>}
    </div>
  );
}
