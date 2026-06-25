import { Eyebrow } from "./eyebrow";
import { SiteButton } from "./site-button";
import type { NavLink } from "@/content/site";

export function Hero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryCta?: NavLink;
  secondaryCta?: NavLink;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center md:py-32">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-site-text sm:text-5xl md:text-6xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="max-w-2xl text-pretty text-lg text-site-muted">{subtitle}</p>
      ) : null}
      {primaryCta || secondaryCta ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {primaryCta ? (
            <SiteButton href={primaryCta.href} variant="primary">
              {primaryCta.label}
            </SiteButton>
          ) : null}
          {secondaryCta ? (
            <SiteButton href={secondaryCta.href} variant="secondary">
              {secondaryCta.label}
            </SiteButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
