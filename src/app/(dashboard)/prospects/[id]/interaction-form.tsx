"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addInteractionAction,
  type InteractionState,
} from "@/modules/prospector/actions/interactions";
import { Button } from "@/components/ui/button";

const initial: InteractionState = {};

export function InteractionForm({ prospectId }: { prospectId: string }) {
  const [state, action, pending] = useActionState(addInteractionAction, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="prospectId" value={prospectId} />
      <div className="flex flex-wrap gap-3">
        <select name="type" className="h-9 rounded-md border bg-white px-2 text-sm">
          <option value="note">Nota</option>
          <option value="call">Call</option>
          <option value="email_manual">Email manuale</option>
          <option value="meeting">Meeting</option>
        </select>
        <input
          type="datetime-local"
          name="scheduledAt"
          className="h-9 rounded-md border bg-white px-2 text-sm"
          aria-label="Programmato per"
        />
      </div>
      <textarea
        name="content"
        required
        rows={3}
        placeholder="Dettagli dell'interazione…"
        className="w-full rounded-md border bg-white p-2 text-sm"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvo…" : "Aggiungi interazione"}
      </Button>
    </form>
  );
}
