"use client";

import { useState, useTransition } from "react";
import { generateReportAction } from "@/modules/reporting/actions/reports";
import { Button } from "@/components/ui/button";

export function GenerateReportButton({ clientId }: { clientId: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await generateReportAction(clientId);
            setMsg(res.error ?? "Report generato");
          })
        }
      >
        {pending ? "Genero…" : "Genera report (ultimo mese)"}
      </Button>
      {msg && <span className="text-sm text-neutral-500">{msg}</span>}
    </div>
  );
}
