import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/site/section";
import { Eyebrow } from "@/components/site/eyebrow";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { CtaBand } from "@/components/site/cta-band";
import { PRIMARY_CTA, SECTORS } from "@/content/site";
import { allServices, solutionsForService } from "@/content/solutions";

export const metadata: Metadata = {
  title: "Mappa del sito",
  description:
    "Tutte le pagine di Nodomatic: servizi, settori e le soluzioni dedicate a ogni combinazione servizio per settore.",
};

const linkCls =
  "text-[15px] text-site-body transition-colors hover:text-site-text";

export default function SitemapPage() {
  const services = allServices();

  return (
    <>
      <Section containerClassName="pt-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Mappa del sito" }]} />
      </Section>

      <Section>
        <div className="flex flex-col items-start gap-6 py-12 sm:py-16 md:py-20">
          <Eyebrow>Sitemap</Eyebrow>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-site-text sm:text-5xl">
            Mappa del sito
          </h1>
          <p className="max-w-2xl text-lg text-site-muted">
            Tutte le pagine del sito: pagine principali, i 4 servizi, i 12 settori e le 48
            soluzioni dedicate a ogni combinazione servizio per settore.
          </p>
        </div>
      </Section>

      <Section containerClassName="pb-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div className="flex flex-col gap-3.5">
            <Eyebrow>Pagine</Eyebrow>
            <Link href="/" className={linkCls}>Home</Link>
            <Link href="/chi-siamo" className={linkCls}>Chi siamo</Link>
            <Link href="/contatti" className={linkCls}>Contatti</Link>
          </div>
          <div className="flex flex-col gap-3.5">
            <Eyebrow>Servizi</Eyebrow>
            <Link href="/servizi" className={linkCls}>Tutti i servizi</Link>
            {services.map((s) => (
              <Link key={s.slug} href={`/servizi/${s.slug}`} className={linkCls}>
                {s.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3.5">
            <Eyebrow>Settori</Eyebrow>
            <Link href="/settori" className={linkCls}>Tutti i settori</Link>
            <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
              {SECTORS.map((s) => (
                <Link key={s.slug} href={`/settori/${s.slug}`} className={linkCls}>
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section surface="surface" className="border-y border-site-line" containerClassName="py-16 md:py-20">
        <Eyebrow>48 soluzioni</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-site-text md:text-4xl">
          Soluzioni servizio per settore
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] text-site-muted">
          Ogni servizio declinato sui 12 settori, con una pagina dedicata.
        </p>
        <div className="mt-10 flex flex-col gap-10">
          {services.map((service) => (
            <div key={service.slug} className="flex flex-col gap-4">
              <h3 className="text-lg font-medium text-site-text">{service.name}</h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {solutionsForService(service.slug).map((sol) => (
                  <Link
                    key={sol.slug}
                    href={`/${sol.slug}`}
                    className="text-[14px] text-site-body transition-colors hover:text-site-text"
                  >
                    {sol.sector.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section containerClassName="py-16 md:py-24">
        <CtaBand
          title="Non trovi quello che cerchi?"
          subtitle="Prenota una call: ti indirizziamo noi verso la soluzione giusta per la tua attività."
          cta={PRIMARY_CTA}
        />
      </Section>
    </>
  );
}
