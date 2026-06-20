"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type MetricPoint = { date: string; sessions: number; users: number };

export function MetricsChart({ data }: { data: MetricPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
        <YAxis tick={{ fontSize: 11 }} width={40} />
        <Tooltip />
        <Line type="monotone" dataKey="sessions" stroke="#6366f1" dot={false} name="Sessioni" />
        <Line type="monotone" dataKey="users" stroke="#10b981" dot={false} name="Utenti" />
      </LineChart>
    </ResponsiveContainer>
  );
}
