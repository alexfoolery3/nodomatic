import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Section } from "@/components/site/section";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { Eyebrow } from "@/components/site/eyebrow";
import { ServiceCard } from "@/components/site/service-card";
import { SectorChip } from "@/components/site/sector-chip";
import { ProcessStep } from "@/components/site/process-step";
import { CtaBand } from "@/components/site/cta-band";
import { SiteButton } from "@/components/site/site-button";
import { PROCESS, PRIMARY_CTA } from "@/content/site";
import { allServices, getService, solutionsForService } from "@/content/solutions";

/** Solo i quattro servizi generati esistono; gli altri slug → 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return allServices().map((s) => ({ servizio: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ servizio: string }>;
}): Promise<Metadata> {
  const { servizio } = await params;
  const service = getService(servizio);
  if (!service) return {};
  return {
    title: service.name,
    description: service.lead,
    openGraph: {
      title: `${service.name} · Nodomatic`,
      description: service.lead,
      url: `/servizi/${servizio}`,
      type: "website",
      locale: "it_IT",
    },
  };
}

export default async function ServizioPage({
  params,
}: {
  params: Promise<{ servizio: string }>;
}) {
  const { servizio } = await params;
  const service = getService(servizio);
  if (!service) notFound();

  const solutions = solutionsForService(service.slug);

  return (
    <>
      <Section containerClassName="pt-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Servizi", href: "/servizi" },
            { label: service.name },
          ]}
        />
      </Section>

      <Section>
        <div className="flex flex-col items-start gap-6 py-16 md:py-24">
          <Eyebrow>Servizio</Eyebrow>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-site-text sm:text-5xl md:text-[56px]">
            {service.name}
          </h1>
          <p className="max-w-2xl text-lg text-site-muted">{service.lead}</p>
          <SiteButton href={PRIMARY_CTA.href} variant="primary">
            {PRIMARY_CTA.label}
          </SiteButton>
        </div>
      </Section>

      <Section containerClassName="py-16 md:py-24">
        <Eyebrow>{service.solutionsEyebrow}</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-site-text md:text-4xl">
          La nostra soluzione
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {service.solutions.map((s) => (
            <ServiceCard key={s.title} {...s} />
          ))}
        </div>
      </Section>

      <Section
        surface="surface"
        className="border-y border-site-line"
        containerClassName="py-16 md:py-20"
      >
        <Eyebrow>Per il tuo settore</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-site-text md:text-4xl">
          Costruito sul tuo mercato
        </h2>
        <div className="mt-8 flex flex-wrap gap-3">
          {solutions.map((sol) => (
            <SectorChip
              key={sol.slug}
              label={sol.sector.name}
              href={`/${sol.slug}`}
            />
          ))}
        </div>
      </Section>

      <Section containerClassName="py-16 md:py-24">
        <Eyebrow>Come lavoriamo</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-site-text md:text-4xl">
          Il percorso, passo per passo
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
        containerClassName="py-16 md:py-20"
      >
        <Eyebrow>Perché Nodomatic</Eyebrow>
        <ul className="mt-6 flex flex-col gap-3">
          {service.benefits.map((b) => (
            <li key={b} className="flex items-start gap-3 text-lg text-site-body">
              <Check className="mt-1 size-5 shrink-0 text-metal-300" />
              {b}
            </li>
          ))}
        </ul>
      </Section>

      <Section containerClassName="py-16 md:py-24">
        <CtaBand
          title="Parliamo della tua attività."
          subtitle="Prenota una call: vediamo insieme cosa ha più senso per la tua attività."
          cta={PRIMARY_CTA}
        />
      </Section>
    </>
  );
}
