"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addManualProspectAction,
  type ManualProspectState,
} from "@/modules/prospector/actions/prospects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: ManualProspectState = {};

export function ManualProspectForm({ campaignId }: { campaignId: string }) {
  const [state, action, pending] = useActionState(addManualProspectAction, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <details className="rounded-lg border bg-white p-4">
      <summary className="cursor-pointer text-sm font-medium text-neutral-700">
        + Aggiungi prospect manualmente
      </summary>
      <form ref={ref} action={action} className="mt-4 space-y-3">
        <input type="hidden" name="campaignId" value={campaignId} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input name="businessName" placeholder="Nome attività *" required />
          <Input name="website" placeholder="https://sito.it" />
          <Input name="email" type="email" placeholder="email@esempio.it" />
          <Input name="phone" placeholder="Telefono" />
          <Input name="category" placeholder="Categoria" />
          <Input name="address" placeholder="Indirizzo" />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.ok && <p className="text-sm text-green-700">Prospect aggiunto. Audit avviato.</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Aggiungo…" : "Aggiungi"}
        </Button>
      </form>
    </details>
  );
}
