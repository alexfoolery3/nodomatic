import type { Stat } from "@/content/site";

export function StatBand({ items }: { items: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="flex flex-col gap-1.5">
          <span className="text-3xl font-semibold tracking-tight text-site-text sm:text-[40px] md:text-5xl">
            {s.value}
          </span>
          <span className="text-[13px] text-site-muted">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
