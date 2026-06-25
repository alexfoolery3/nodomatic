import type { Metadata } from "next";
import { Section } from "@/components/site/section";
import { Eyebrow } from "@/components/site/eyebrow";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = {
  title: "Contatti",
  description:
    "Prenota una call con Nodomatic: automazione, marketing e AI per la tua attività.",
};

export default function ContattiPage() {
  return (
    <Section containerClassName="py-20 md:py-28">
      <div className="mx-auto max-w-xl">
        <Eyebrow>Contatti</Eyebrow>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-site-text md:text-5xl">
          Prenota una call
        </h1>
        <p className="mt-4 text-lg text-site-muted">
          Raccontaci la tua attività: ti rispondiamo con una proposta concreta, senza impegno.
        </p>
        <div className="mt-10">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
