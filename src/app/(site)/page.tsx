import type { Metadata } from "next";
import { Section } from "@/components/site/section";
import { Hero } from "@/components/site/hero";
import { Eyebrow } from "@/components/site/eyebrow";
import { ServiceCard } from "@/components/site/service-card";
import { SectorChip } from "@/components/site/sector-chip";
import { ProcessStep } from "@/components/site/process-step";
import { StatBand } from "@/components/site/stat-band";
import { CtaBand } from "@/components/site/cta-band";
import {
  HERO,
  MANIFESTO,
  SERVICES,
  SECTORS,
  PROCESS,
  STATS,
  PRIMARY_CTA,
} from "@/content/site";

export const metadata: Metadata = {
  title: "Nodomatic — Agency di automazione, marketing e AI",
  description: HERO.subtitle,
  openGraph: {
    title: "Nodomatic — Agency di automazione, marketing e AI",
    description: HERO.subtitle,
    url: "/",
    siteName: "Nodomatic",
    locale: "it_IT",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <Section>
        <Hero
          eyebrow={HERO.eyebrow}
          title={HERO.title}
          subtitle={HERO.subtitle}
          primaryCta={PRIMARY_CTA}
          secondaryCta={{ label: "Scopri i servizi", href: "/#servizi" }}
        />
      </Section>

      <Section surface="surface" className="border-y border-site-line">
        <p className="mx-auto max-w-3xl py-16 text-center text-2xl font-medium tracking-tight text-site-text md:text-3xl">
          {MANIFESTO}
        </p>
      </Section>

      <Section id="servizi" containerClassName="py-20 md:py-24">
        <Eyebrow>Cosa facciamo</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-site-text md:text-4xl">
          I nostri servizi
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <ServiceCard key={s.title} {...s} />
          ))}
        </div>
      </Section>

      <Section id="settori" surface="surface" containerClassName="py-20 md:py-24">
        <Eyebrow>Per chi lavoriamo</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-site-text md:text-4xl">
          Soluzioni per il tuo settore
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-site-muted">
          Strategie e automazioni costruite sul linguaggio e i processi del tuo mercato.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {SECTORS.map((s) => (
            <SectorChip
              key={s.slug}
              label={s.name}
              href={`/automazioni-per-${s.slug}`}
            />
          ))}
        </div>
      </Section>

      <Section containerClassName="py-20 md:py-24">
        <Eyebrow>Come lavoriamo</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-site-text md:text-4xl">
          Il nostro metodo
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p) => (
            <ProcessStep key={p.number} {...p} />
          ))}
        </div>
      </Section>

      <Section
        surface="surface"
        className="border-y border-site-line"
        containerClassName="py-14"
      >
        <StatBand items={STATS} />
      </Section>

      <Section containerClassName="py-20 md:py-24">
        <CtaBand
          title="Parliamo della tua crescita."
          subtitle="Prenota una call: capiamo insieme dove automazione e marketing possono aiutarti davvero."
          cta={PRIMARY_CTA}
        />
      </Section>
    </>
  );
}
