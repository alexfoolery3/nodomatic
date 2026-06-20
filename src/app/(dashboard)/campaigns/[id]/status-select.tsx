"use client";

import { useTransition } from "react";
import { setProspectStatusAction } from "@/modules/prospector/actions/outreach";

// Allineato a prospectStatusEnum (PRD §5). Hardcoded per non importare lo schema nel bundle client.
const OPTIONS = [
  "scraped",
  "audited",
  "contacted",
  "opened",
  "clicked",
  "replied",
  "meeting",
  "won",
  "lost",
  "cold",
] as const;

/** Cambio stato manuale del prospect (PRD §9: Sales marca "replied"/"won"/...). */
export function StatusSelect({
  prospectId,
  campaignId,
  value,
}: {
  prospectId: string;
  campaignId: string;
  value: string;
}) {
  const [pending, start] = useTransition();

  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) => {
        const status = e.target.value;
        start(async () => {
          await setProspectStatusAction({ prospectId, campaignId, status });
        });
      }}
      className="h-8 rounded-md border bg-white px-2 text-sm disabled:opacity-50"
    >
      {OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
