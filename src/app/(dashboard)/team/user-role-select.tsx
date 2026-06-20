"use client";

import { useTransition } from "react";
import { setUserRoleAction } from "@/modules/prospector/actions/users";

const ROLES = ["admin", "sales", "viewer"] as const;

export function UserRoleSelect({ userId, value }: { userId: string; value: string }) {
  const [pending, start] = useTransition();

  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) => {
        const role = e.target.value;
        start(async () => {
          await setUserRoleAction({ userId, role });
        });
      }}
      className="h-8 rounded-md border bg-white px-2 text-sm disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
