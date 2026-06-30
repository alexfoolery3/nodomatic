"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCampaignAction,
  type CreateCampaignState,
} from "@/modules/prospector/actions/campaigns";
import { SECTORS } from "@/content/site";
import { CITIES } from "@/content/cities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateCampaignState = {};

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

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
          <Input
            id="category"
            name="category"
            list="category-options"
            placeholder="fisioterapisti"
            autoComplete="off"
            required
          />
          <datalist id="category-options">
            {SECTORS.map((s) => (
              <option key={s.slug} value={s.name} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Città</Label>
          <Input
            id="city"
            name="city"
            list="city-options"
            placeholder="Bologna"
            autoComplete="off"
            required
          />
          <datalist id="city-options">
            {CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nome campagna</Label>
          <Input id="name" name="name" placeholder="Fisioterapisti Bologna - Gen 2026" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="scrapeLimit">Quante attività cercare</Label>
          <select id="scrapeLimit" name="scrapeLimit" defaultValue="50" className={selectClass}>
            <option value="25">25 attività</option>
            <option value="50">50 attività</option>
            <option value="100">100 attività</option>
          </select>
          <p className="text-xs text-neutral-500">Più attività = scraping più lungo e costoso.</p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <input type="checkbox" name="scrape" defaultChecked className="size-4" />
        Avvia subito lo scraping (deseleziona per una campagna a inserimento manuale)
      </label>

      <p className="text-xs text-neutral-500">
        Cerca su Google Maps &quot;categoria + città&quot; e analizza i siti trovati. La ricerca è
        ottimizzata per l&apos;Italia: per città estere i risultati possono essere meno precisi.
      </p>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-700">Campagna creata.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Avvio…" : "Crea campagna"}
      </Button>
    </form>
  );
}
