import type { LucideIcon } from "lucide-react";

export function ServiceCard({
  icon: Icon,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-site-line bg-site-surface p-6">
      {Icon ? <Icon className="size-7 text-metal-300" strokeWidth={1.6} /> : null}
      <h3 className="text-[22px] font-medium tracking-tight text-site-text">
        {title}
      </h3>
      <p className="text-[15px] leading-relaxed text-site-muted">{description}</p>
    </div>
  );
}
