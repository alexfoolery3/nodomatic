import type { LucideIcon } from "lucide-react";
import { Workflow, Target, LayoutTemplate, MessageSquare } from "lucide-react";

/** Contenuti statici del sito vetrina. Fonte unica riusata da Home e template. */

export type NavLink = { label: string; href: string };

export const NAV_LINKS: NavLink[] = [
  { label: "Servizi", href: "/#servizi" },
  { label: "Settori", href: "/#settori" },
  { label: "Chi siamo", href: "/chi-siamo" },
  { label: "Contatti", href: "/contatti" },
];

export const PRIMARY_CTA: NavLink = { label: "Prenota una call", href: "/contatti" };

export const HERO = {
  eyebrow: "Agency di automazione, marketing e AI",
  title: "Tecnologia e marketing, progettati con metodo.",
  subtitle:
    "Automazione, performance marketing e siti, progettati su misura per il tuo settore.",
};

/** Posizionamento: niente promesse, tono diretto. */
export const MANIFESTO = "Marketing professionale, non solo per le grandi aziende.";

export type Service = { title: string; description: string; icon: LucideIcon };

export const SERVICES: Service[] = [
  {
    title: "Automazioni & AI",
    description: "Flussi, agenti e CRM che lavorano al posto tuo, ogni giorno.",
    icon: Workflow,
  },
  {
    title: "Performance Marketing",
    description: "Meta e Google Ads orientati a lead e clienti reali.",
    icon: Target,
  },
  {
    title: "Siti & Landing",
    description: "Siti veloci e landing che convertono, su misura.",
    icon: LayoutTemplate,
  },
  {
    title: "Social & Contenuti",
    description: "Contenuti e piani editoriali che costruiscono autorevolezza.",
    icon: MessageSquare,
  },
];

export type Sector = { name: string; slug: string };

export const SECTORS: Sector[] = [
  { name: "Agenzie immobiliari", slug: "agenzie-immobiliari" },
  { name: "Studi commercialisti", slug: "studi-commercialisti" },
  { name: "Studi legali", slug: "studi-legali" },
  { name: "Agenzie di viaggio", slug: "agenzie-di-viaggio" },
  { name: "Palestre & fitness", slug: "palestre-fitness" },
  { name: "Studi dentistici & medici", slug: "studi-dentistici-medici" },
  { name: "Ristoranti & food", slug: "ristoranti-food" },
  { name: "E-commerce & negozi locali", slug: "ecommerce-negozi-locali" },
  { name: "Automotive & concessionari", slug: "automotive-concessionari" },
  { name: "Estetica & beauty", slug: "estetica-beauty" },
  { name: "Edilizia & ristrutturazioni", slug: "edilizia-ristrutturazioni" },
  { name: "Wedding & eventi", slug: "wedding-eventi" },
];

export type ProcessStep = { number: string; title: string; description: string };

export const PROCESS: ProcessStep[] = [
  { number: "01", title: "Analisi", description: "Capiamo attività, mercato e obiettivi." },
  { number: "02", title: "Strategia", description: "Disegniamo il sistema: canali, automazioni, contenuti." },
  { number: "03", title: "Implementazione", description: "Costruiamo siti, campagne e flussi automatici." },
  { number: "04", title: "Ottimizzazione", description: "Misuriamo e miglioriamo in continuo." },
];

export type Stat = { value: string; label: string };

export const STATS: Stat[] = [
  { value: "4", label: "servizi integrati" },
  { value: "12", label: "settori serviti" },
  { value: "1", label: "referente dedicato" },
  { value: "AI-first", label: "approccio" },
];

export type FooterColumn = { title: string; links: NavLink[] };

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Servizi",
    links: [
      { label: "Automazioni & AI", href: "/#servizi" },
      { label: "Performance Marketing", href: "/#servizi" },
      { label: "Siti & Landing", href: "/#servizi" },
      { label: "Social & Contenuti", href: "/#servizi" },
    ],
  },
  {
    title: "Settori",
    links: [
      { label: "Immobiliari", href: "/automazioni-per-agenzie-immobiliari" },
      { label: "Commercialisti", href: "/automazioni-per-studi-commercialisti" },
      { label: "Legali", href: "/automazioni-per-studi-legali" },
      { label: "E-commerce", href: "/automazioni-per-ecommerce-negozi-locali" },
    ],
  },
  {
    title: "Azienda",
    links: [
      { label: "Chi siamo", href: "/chi-siamo" },
      { label: "Contatti", href: "/contatti" },
    ],
  },
];
