"use client";

import { useState, useTransition } from "react";
import { refreshClientAction } from "@/modules/reporting/actions/refresh";
import { Button } from "@/components/ui/button";

export function RefreshButton({ clientId }: { clientId: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await refreshClientAction(clientId);
            setMsg(
              res.error ??
                (res.count === 0
                  ? "Nessuna connessione attiva"
                  : `Aggiornamento avviato (${res.count})`),
            );
          })
        }
      >
        {pending ? "Avvio…" : "Aggiorna dati"}
      </Button>
      {msg && <span className="text-sm text-neutral-500">{msg}</span>}
    </div>
  );
}
