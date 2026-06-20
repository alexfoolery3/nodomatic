"use client";

import { useActionState, useEffect, useRef } from "react";
import { inviteUserAction, type UserActionState } from "@/modules/prospector/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: UserActionState = {};

export function InviteUserForm() {
  const [state, action, pending] = useActionState(inviteUserAction, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password iniziale</Label>
          <Input id="password" name="password" type="text" minLength={8} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Ruolo</Label>
          <select
            id="role"
            name="role"
            defaultValue="sales"
            className="h-9 w-full rounded-md border bg-white px-2 text-sm"
          >
            <option value="admin">admin</option>
            <option value="sales">sales</option>
            <option value="viewer">viewer</option>
          </select>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && state.createdEmail && (
        <p className="text-sm text-green-700">
          Utente creato: {state.createdEmail}. Comunica la password alla persona.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Creo…" : "Invita utente"}
      </Button>
    </form>
  );
}
