import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/site/section";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { Eyebrow } from "@/components/site/eyebrow";
import { ServiceCard } from "@/components/site/service-card";
import { CtaBand } from "@/components/site/cta-band";
import { PRIMARY_CTA } from "@/content/site";
import { serviceCards } from "@/content/solutions";

export const metadata: Metadata = {
  title: "Servizi",
  description:
    "Automazione, performance marketing, siti e contenuti: quattro servizi integrati, costruiti sul tuo settore.",
};

export default function ServiziPage() {
  const cards = serviceCards();

  return (
    <>
      <Section containerClassName="pt-8">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Servizi" }]}
        />
      </Section>

      <Section>
        <div className="flex flex-col items-start gap-6 py-16 md:py-24">
          <Eyebrow>Servizi</Eyebrow>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-site-text sm:text-5xl md:text-[56px]">
            I nostri servizi
          </h1>
          <p className="max-w-2xl text-lg text-site-muted">
            Quattro servizi integrati, costruiti sul linguaggio e i processi del tuo
            settore.
          </p>
        </div>
      </Section>

      <Section containerClassName="py-16 md:py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.slug}
              href={card.href}
              className="block rounded-[14px] transition-colors"
            >
              <ServiceCard
                icon={card.icon}
                title={card.name}
                description={card.tagline}
              />
            </Link>
          ))}
        </div>
      </Section>

      <Section containerClassName="py-16 md:py-24">
        <CtaBand
          title="Parliamo della tua attività."
          subtitle="Prenota una call: vediamo insieme quale servizio ha più senso per la tua attività."
          cta={PRIMARY_CTA}
        />
      </Section>
    </>
  );
}
