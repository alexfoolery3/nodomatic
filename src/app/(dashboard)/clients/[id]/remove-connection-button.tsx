"use client";

import { useTransition } from "react";
import { removeConnectionAction } from "@/modules/reporting/actions/connections";

export function RemoveConnectionButton({ id, clientId }: { id: string; clientId: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => void (await removeConnectionAction({ id, clientId })))}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Rimuovi
    </button>
  );
}
