import type { Metadata } from "next";
import { Section } from "@/components/site/section";
import { Eyebrow } from "@/components/site/eyebrow";
import { SectorChip } from "@/components/site/sector-chip";
import { CtaBand } from "@/components/site/cta-band";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { SECTORS, PRIMARY_CTA } from "@/content/site";

export const metadata: Metadata = {
  title: "Settori",
  description:
    "I settori che seguiamo: automazione, marketing e siti su misura per ogni tipo di attivita.",
};

export default function SettoriIndexPage() {
  return (
    <>
      <Section containerClassName="pt-8">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Settori" }]}
        />
      </Section>

      <Section>
        <div className="flex flex-col items-start gap-6 py-16 md:py-24">
          <Eyebrow>Settori</Eyebrow>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-site-text sm:text-5xl md:text-[56px]">
            Settori che seguiamo
          </h1>
          <p className="max-w-2xl text-lg text-site-muted">
            Costruiamo soluzioni su misura per il modo in cui lavori. Scegli il
            tuo settore e scopri da dove possiamo partire.
          </p>
        </div>
      </Section>

      <Section containerClassName="pb-16 md:pb-24">
        <div className="flex flex-wrap gap-3">
          {SECTORS.map((s) => (
            <SectorChip
              key={s.slug}
              label={s.name}
              href={`/settori/${s.slug}`}
            />
          ))}
        </div>
      </Section>

      <Section containerClassName="py-16 md:py-24">
        <CtaBand
          title="Soluzioni su misura per la tua attivita."
          subtitle="Prenota una call: vediamo insieme da dove partire."
          cta={PRIMARY_CTA}
        />
      </Section>
    </>
  );
}
