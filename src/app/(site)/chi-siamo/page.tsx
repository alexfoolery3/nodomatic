import type { Metadata } from "next";
import { Section } from "@/components/site/section";
import { Eyebrow } from "@/components/site/eyebrow";
import { ProcessStep } from "@/components/site/process-step";
import { CtaBand } from "@/components/site/cta-band";
import { MANIFESTO, PROCESS, PRIMARY_CTA } from "@/content/site";

export const metadata: Metadata = {
  title: "Chi siamo",
  description:
    "Nodomatic: automazione, marketing e AI per far crescere piccole e medie imprese, con metodo.",
};

export default function ChiSiamoPage() {
  return (
    <>
      <Section>
        <div className="flex flex-col items-start gap-6 py-20 md:py-28">
          <Eyebrow>Chi siamo</Eyebrow>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-site-text sm:text-5xl md:text-[56px]">
            {MANIFESTO}
          </h1>
          <p className="max-w-2xl text-lg text-site-muted">
            Nodomatic è l&apos;agency di RT Studio. Uniamo tecnologia, automazione e
            marketing per dare anche alle realtà più piccole strumenti che di solito
            restano alle grandi aziende. Niente promesse facili: solo lavoro fatto con metodo.
          </p>
        </div>
      </Section>

      <Section
        surface="surface"
        className="border-y border-site-line"
        containerClassName="py-16 md:py-20"
      >
        <Eyebrow>Come lavoriamo</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-site-text md:text-4xl">
          Un metodo, non improvvisazione
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p) => (
            <ProcessStep key={p.number} {...p} />
          ))}
        </div>
      </Section>

      <Section containerClassName="py-16 md:py-24">
        <CtaBand
          title="Parliamo della tua attività."
          subtitle="Una call, zero impegno: capiamo se possiamo aiutarti davvero."
          cta={PRIMARY_CTA}
        />
      </Section>
    </>
  );
}
