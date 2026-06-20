"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCampaignAction,
  type CreateCampaignState,
} from "@/modules/prospector/actions/campaigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateCampaignState = {};

export function CampaignForm() {
  const [state, action, pending] = useActionState(createCampaignAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Input id="category" name="category" placeholder="fisioterapisti" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Città</Label>
          <Input id="city" name="city" placeholder="Bologna" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nome campagna</Label>
          <Input id="name" name="name" placeholder="Fisioterapisti Bologna - Gen 2026" required />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && (
        <p className="text-sm text-green-700">Campagna creata. Scraping avviato.</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Avvio…" : "Lancia campagna"}
      </Button>
    </form>
  );
}
