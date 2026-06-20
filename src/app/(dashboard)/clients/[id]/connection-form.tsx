"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addConnectionAction,
  type ConnectionActionState,
} from "@/modules/reporting/actions/connections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PROVIDERS = [
  { value: "ga4", label: "Google Analytics 4 (property id)" },
  { value: "meta_ads", label: "Meta Ads (act_…)" },
  { value: "google_ads", label: "Google Ads (customer id)" },
  { value: "meta_organic", label: "Social organico (page/IG id)" },
] as const;

const initial: ConnectionActionState = {};

export function ConnectionForm({ clientId }: { clientId: string }) {
  const [state, action, pending] = useActionState(addConnectionAction, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="clientId" value={clientId} />
      <div className="grid gap-3 sm:grid-cols-3">
        <select name="provider" className="h-9 rounded-md border bg-white px-2 text-sm">
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <Input name="externalId" placeholder="ID risorsa *" required />
        <Input name="displayName" placeholder="Etichetta (opzionale)" />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-700">Connessione aggiunta.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Aggiungo…" : "Collega sorgente"}
      </Button>
    </form>
  );
}
