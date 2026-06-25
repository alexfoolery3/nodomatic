import { SiteButton } from "./site-button";
import type { NavLink } from "@/content/site";

export function CtaBand({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle?: string;
  cta: NavLink;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[18px] border border-metal-700 bg-site-surface px-6 py-10 text-center sm:gap-5 sm:px-8 sm:py-14 md:px-12">
      <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-site-text sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-xl text-lg text-site-muted">{subtitle}</p>
      ) : null}
      <SiteButton href={cta.href} variant="primary" size="lg">
        {cta.label}
      </SiteButton>
    </div>
  );
}
