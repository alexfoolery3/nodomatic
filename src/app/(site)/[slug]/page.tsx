import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Section } from "@/components/site/section";
import { Eyebrow } from "@/components/site/eyebrow";
import { ServiceCard } from "@/components/site/service-card";
import { ProcessStep } from "@/components/site/process-step";
import { CtaBand } from "@/components/site/cta-band";
import { SiteButton } from "@/components/site/site-button";
import { PROCESS, PRIMARY_CTA } from "@/content/site";
import { allSolutions, getSolution } from "@/content/solutions";

/** Solo le combinazioni servizio×settore generate esistono; le altre → 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return allSolutions().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sol = getSolution(slug);
  if (!sol) return {};
  const title = `${sol.service.name} per ${sol.sector.name}`;
  return {
    title,
    description: `${sol.service.name} su misura per ${sol.sector.name.toLowerCase()}. ${sol.service.lead}`,
    openGraph: {
      title: `${title} · Nodomatic`,
      description: sol.service.lead,
      url: `/${slug}`,
      type: "website",
      locale: "it_IT",
    },
  };
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sol = getSolution(slug);
  if (!sol) notFound();

  const { service, sector, challenges } = sol;
  const sectorLower = sector.name.toLowerCase();

  return (
    <>
      <Section>
        <div className="flex flex-col items-start gap-6 py-20 md:py-28">
          <Eyebrow>{service.name}</Eyebrow>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-site-text sm:text-5xl md:text-[56px]">
            {service.name} per {sectorLower}
          </h1>
          <p className="max-w-2xl text-lg text-site-muted">{service.lead}</p>
          <SiteButton href={PRIMARY_CTA.href} variant="primary">
            {PRIMARY_CTA.label}
          </SiteButton>
        </div>
      </Section>

      {challenges.length ? (
        <Section
          surface="surface"
          className="border-y border-site-line"
          containerClassName="py-16 md:py-20"
        >
          <Eyebrow>Le sfide</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-site-text md:text-4xl">
            Cosa rallenta il lavoro ogni giorno
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {challenges.map((c) => (
              <li
                key={c}
                className="rounded-[14px] border border-site-line bg-site-canvas p-5 text-[15px] leading-relaxed text-site-body"
              >
                {c}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section containerClassName="py-16 md:py-24">
        <Eyebrow>Cosa automatizziamo</Eyebrow>
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

      <Section containerClassName="py-16 md:py-20">
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
          subtitle="Prenota una call: vediamo insieme quali automazioni hanno più senso per te."
          cta={PRIMARY_CTA}
        />
      </Section>
    </>
  );
}
