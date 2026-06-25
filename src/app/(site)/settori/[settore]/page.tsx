import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Section } from "@/components/site/section";
import { Eyebrow } from "@/components/site/eyebrow";
import { ServiceCard } from "@/components/site/service-card";
import { ProcessStep } from "@/components/site/process-step";
import { CtaBand } from "@/components/site/cta-band";
import { SiteButton } from "@/components/site/site-button";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { SECTORS, PROCESS, PRIMARY_CTA } from "@/content/site";
import {
  getSector,
  solutionsForSector,
  SECTOR_CHALLENGES,
} from "@/content/solutions";

/** Solo i settori definiti hanno una pagina; gli altri → 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return SECTORS.map((s) => ({ settore: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ settore: string }>;
}): Promise<Metadata> {
  const { settore } = await params;
  const sector = getSector(settore);
  if (!sector) return {};
  return {
    title: sector.name,
    description: `Automazione, marketing e siti su misura per ${sector.name.toLowerCase()}. Soluzioni costruite sul modo in cui lavori.`,
    openGraph: {
      title: `${sector.name} · Nodomatic`,
      description: `Soluzioni su misura per ${sector.name.toLowerCase()}.`,
      url: `/settori/${settore}`,
      type: "website",
      locale: "it_IT",
    },
  };
}

export default async function SettoreHubPage({
  params,
}: {
  params: Promise<{ settore: string }>;
}) {
  const { settore } = await params;
  const sector = getSector(settore);
  if (!sector) notFound();

  const sectorLower = sector.name.toLowerCase();
  const challenges = SECTOR_CHALLENGES[sector.slug] ?? [];
  const solutions = solutionsForSector(sector.slug);

  return (
    <>
      <Section containerClassName="pt-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Settori", href: "/settori" },
            { label: sector.name },
          ]}
        />
      </Section>

      <Section>
        <div className="flex flex-col items-start gap-6 py-16 md:py-24">
          <Eyebrow>Settore</Eyebrow>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-site-text sm:text-5xl md:text-[56px]">
            Soluzioni per {sectorLower}
          </h1>
          <p className="max-w-2xl text-lg text-site-muted">
            Automazione, marketing e siti su misura per il modo in cui lavori.
          </p>
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
        <Eyebrow>I nostri servizi</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-site-text md:text-4xl">
          Tutto quello che possiamo fare per te
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((sol) => (
            <Link key={sol.slug} href={`/${sol.slug}`} className="block">
              <ServiceCard
                icon={sol.service.icon}
                title={sol.service.name}
                description={sol.service.tagline}
              />
            </Link>
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
