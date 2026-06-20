"use client";

import { useActionState, useEffect, useRef } from "react";
import { createClientAction, type ClientActionState } from "@/modules/reporting/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ClientActionState = {};

export function ClientForm() {
  const [state, action, pending] = useActionState(createClientAction, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome cliente</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Sito</Label>
          <Input id="website" name="website" placeholder="https://cliente.it" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Note</Label>
        <Input id="notes" name="notes" />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-700">Cliente creato.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Creo…" : "Crea cliente"}
      </Button>
    </form>
  );
}
