"use client";

import { useState, useTransition } from "react";
import { setProspectMonitoredAction } from "@/modules/prospector/actions/prospects";

export function MonitorToggle({ prospectId, initial }: { prospectId: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm text-neutral-700">
      <input
        type="checkbox"
        checked={on}
        disabled={pending}
        onChange={(e) => {
          const v = e.target.checked;
          setOn(v);
          start(async () => {
            await setProspectMonitoredAction({ prospectId, monitored: v });
          });
        }}
        className="size-4"
      />
      Monitora questo sito (audit settimanale + alert sui cali)
    </label>
  );
}
