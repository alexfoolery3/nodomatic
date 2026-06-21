"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type ChartLine = { key: string; label: string; color: string };

export function MetricsChart({
  data,
  lines,
}: {
  data: Record<string, number | string>[];
  lines: ChartLine[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(d: string) => String(d).slice(5)}
        />
        <YAxis tick={{ fontSize: 11 }} width={40} />
        <Tooltip />
        {lines.map((l) => (
          <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} dot={false} name={l.label} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
