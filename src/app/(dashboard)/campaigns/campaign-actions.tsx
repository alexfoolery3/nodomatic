"use client";

/**
 * Azioni su una campagna: archivia / ripristina / elimina (Fase 1 — 1C).
 * Elimina usa un confirm a due passi inline (niente dialog/lib esterne), coerente
 * con l'approccio nativo del progetto. Le action server applicano la guardia admin.
 */
import { useState, useTransition } from "react";
import {
  archiveCampaignAction,
  unarchiveCampaignAction,
  deleteCampaignAction,
} from "@/modules/prospector/actions/campaigns";
import { Button } from "@/components/ui/button";

export function CampaignActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500">Eliminare definitivamente?</span>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() => start(async () => void (await deleteCampaignAction(id)))}
        >
          Sì, elimina
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setConfirming(false)}>
          Annulla
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {status === "archived" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => start(async () => void (await unarchiveCampaignAction(id)))}
        >
          Ripristina
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => start(async () => void (await archiveCampaignAction(id)))}
        >
          Archivia
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="text-red-600 hover:text-red-700"
        disabled={pending}
        onClick={() => setConfirming(true)}
      >
        Elimina
      </Button>
    </div>
  );
}
