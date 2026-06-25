import type { LucideIcon } from "lucide-react";
import { Workflow, Target, LayoutTemplate, MessageSquare } from "lucide-react";

/** Contenuti statici del sito vetrina. Fonte unica riusata da Home e template futuri. */

export type NavLink = { label: string; href: string };

export const NAV_LINKS: NavLink[] = [
  { label: "Servizi", href: "/#servizi" },
  { label: "Settori", href: "/#settori" },
  { label: "Chi siamo", href: "/chi-siamo" },
  { label: "Risorse", href: "/risorse" },
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

export const SECTORS: string[] = [
  "Agenzie immobiliari",
  "Studi commercialisti",
  "Studi legali",
  "Agenzie di viaggio",
  "Palestre & fitness",
  "Studi dentistici & medici",
  "Ristoranti & food",
  "E-commerce & negozi locali",
  "Automotive & concessionari",
  "Estetica & beauty",
  "Edilizia & ristrutturazioni",
  "Wedding & eventi",
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
      { label: "Immobiliari", href: "/#settori" },
      { label: "Commercialisti", href: "/#settori" },
      { label: "Legali", href: "/#settori" },
      { label: "E-commerce", href: "/#settori" },
    ],
  },
  {
    title: "Azienda",
    links: [
      { label: "Chi siamo", href: "/chi-siamo" },
      { label: "Risorse", href: "/risorse" },
      { label: "Contatti", href: "/contatti" },
    ],
  },
];
