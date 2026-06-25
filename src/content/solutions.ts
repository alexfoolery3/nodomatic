import type { LucideIcon } from "lucide-react";
import {
  Zap,
  Repeat,
  Database,
  BellRing,
  Workflow,
  Target,
  Users,
  MousePointerClick,
  BarChart3,
  LayoutTemplate,
  Gauge,
  Palette,
  Search,
  MessageSquare,
  CalendarDays,
  Images,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { SECTORS, type Sector } from "@/content/site";

/**
 * Contenuti delle pagine "soluzione servizio×settore"
 * (es. /servizi/automazioni). Quattro servizi × dodici settori.
 */

export type ServiceDetail = {
  slug: string;
  name: string;
  icon: LucideIcon;
  tagline: string;
  lead: string;
  solutionsEyebrow: string;
  solutions: { title: string; description: string; icon: LucideIcon }[];
  benefits: string[];
};

export const SERVICES_DETAIL: Record<string, ServiceDetail> = {
  automazioni: {
    slug: "automazioni",
    name: "Automazioni & AI",
    icon: Workflow,
    tagline: "Flussi, agenti e CRM che lavorano al posto tuo, ogni giorno.",
    lead: "Flussi automatici e AI che gestiscono lead, follow-up e operativita al posto tuo.",
    solutionsEyebrow: "Cosa automatizziamo",
    solutions: [
      {
        title: "Risposta immediata ai lead",
        description: "Ogni richiesta riceve una risposta in pochi secondi, a qualsiasi ora.",
        icon: Zap,
      },
      {
        title: "Follow-up automatici",
        description: "Sequenze che ricontattano i contatti al momento giusto, senza dimenticanze.",
        icon: Repeat,
      },
      {
        title: "CRM sempre aggiornato",
        description: "Contatti, note e stato della trattativa aggiornati senza inserimenti manuali.",
        icon: Database,
      },
      {
        title: "Promemoria e richiami",
        description: "Appuntamenti, scadenze e rinnovi gestiti dal sistema, non dalla memoria.",
        icon: BellRing,
      },
    ],
    benefits: [
      "Costruito sul tuo settore, non un template generico.",
      "Un referente dedicato che conosce il tuo lavoro.",
      "Strumenti professionali, anche per realta piccole.",
    ],
  },
  ads: {
    slug: "ads",
    name: "Performance Marketing",
    icon: Target,
    tagline: "Meta e Google Ads orientati a lead e clienti reali.",
    lead: "Campagne Meta e Google Ads costruite per portarti contatti e clienti reali, con il budget sotto controllo.",
    solutionsEyebrow: "Cosa gestiamo",
    solutions: [
      {
        title: "Campagne che portano contatti",
        description: "Annunci Meta e Google pensati per generare richieste reali, non solo visite.",
        icon: Target,
      },
      {
        title: "Targeting sul cliente giusto",
        description: "Raggiungiamo le persone davvero interessate al tuo servizio, nella tua zona.",
        icon: Users,
      },
      {
        title: "Landing che convertono",
        description: "Ogni campagna ha una pagina dedicata, costruita per trasformare i click in contatti.",
        icon: MousePointerClick,
      },
      {
        title: "Budget sotto controllo",
        description: "Spesa monitorata e ottimizzata, con report chiari su cosa funziona.",
        icon: BarChart3,
      },
    ],
    benefits: [
      "Campagne costruite sul tuo settore, non modelli generici.",
      "Un referente dedicato che segue i numeri con te.",
      "Budget gestito con criterio, anche se piccolo.",
    ],
  },
  siti: {
    slug: "siti",
    name: "Siti & Landing",
    icon: LayoutTemplate,
    tagline: "Siti veloci e landing che convertono, su misura.",
    lead: "Siti e landing veloci, curati e pensati per trasformare i visitatori in contatti.",
    solutionsEyebrow: "Cosa costruiamo",
    solutions: [
      {
        title: "Siti veloci e curati",
        description: "Pagine che caricano in fretta e funzionano bene su ogni dispositivo.",
        icon: Gauge,
      },
      {
        title: "Landing che convertono",
        description: "Pagine dedicate alle campagne, pensate per generare contatti.",
        icon: MousePointerClick,
      },
      {
        title: "Design su misura",
        description: "Un sito che parla la lingua del tuo brand, non un template riciclato.",
        icon: Palette,
      },
      {
        title: "Basi SEO solide",
        description: "Struttura tecnica e contenuti pensati per farti trovare su Google.",
        icon: Search,
      },
    ],
    benefits: [
      "Costruito sul tuo settore, non un template generico.",
      "Un referente dedicato che cura ogni dettaglio.",
      "Siti professionali, anche per realta piccole.",
    ],
  },
  social: {
    slug: "social",
    name: "Social & Contenuti",
    icon: MessageSquare,
    tagline: "Contenuti e piani editoriali che costruiscono autorevolezza.",
    lead: "Contenuti e piani editoriali costanti che costruiscono presenza e autorevolezza nel tempo.",
    solutionsEyebrow: "Cosa pubblichiamo",
    solutions: [
      {
        title: "Piano editoriale costante",
        description: "Contenuti programmati con regolarita, senza corse last minute.",
        icon: CalendarDays,
      },
      {
        title: "Contenuti su misura",
        description: "Post e formati pensati per il tuo pubblico e il tuo settore.",
        icon: Images,
      },
      {
        title: "Gestione e community",
        description: "Pubblicazione e risposta ai messaggi, per non lasciare nessuno indietro.",
        icon: MessagesSquare,
      },
      {
        title: "Contenuti per le campagne",
        description: "Creativita pronte a sostenere anche le attivita di advertising.",
        icon: Sparkles,
      },
    ],
    benefits: [
      "Contenuti costruiti sul tuo settore, non generici.",
      "Un referente dedicato che conosce il tuo tono di voce.",
      "Presenza professionale, anche per realta piccole.",
    ],
  },
};

/** Sfide tipiche per settore (concrete, senza promesse). */
export const SECTOR_CHALLENGES: Record<string, string[]> = {
  "agenzie-immobiliari": [
    "Lead dai portali che si raffreddano in fretta",
    "Appuntamenti e visite da coordinare a mano",
    "Database contatti disordinato e poco sfruttato",
  ],
  "studi-commercialisti": [
    "Scadenze e adempimenti da ricordare ai clienti",
    "Documenti raccolti via email in modo caotico",
    "Poco tempo per acquisire nuovi clienti",
  ],
  "studi-legali": [
    "Prime richieste da qualificare velocemente",
    "Pratiche e scadenze da non perdere di vista",
    "Comunicazioni con i clienti dispersive",
  ],
  "agenzie-di-viaggio": [
    "Preventivi richiesti a ogni ora del giorno",
    "Follow-up sui preventivi spesso dimenticati",
    "Stagionalita difficile da gestire",
  ],
  "palestre-fitness": [
    "Prove gratuite che non diventano iscrizioni",
    "Rinnovi e abbonamenti da seguire a mano",
    "Comunicazione con i soci frammentata",
  ],
  "studi-dentistici-medici": [
    "Richieste di appuntamento fuori orario",
    "Promemoria e richiami da gestire manualmente",
    "Recensioni e reputazione da curare",
  ],
  "ristoranti-food": [
    "Prenotazioni sparse tra telefono e social",
    "Clienti abituali poco fidelizzati",
    "Recensioni online da presidiare",
  ],
  "ecommerce-negozi-locali": [
    "Carrelli abbandonati senza recupero",
    "Assistenza clienti ripetitiva",
    "Promozioni inviate senza criterio",
  ],
  "automotive-concessionari": [
    "Richieste sui veicoli da smistare in fretta",
    "Lead dai portali da ricontattare subito",
    "Tagliandi e scadenze da ricordare",
  ],
  "estetica-beauty": [
    "Appuntamenti e disdette da gestire",
    "Promemoria trattamenti e richiami",
    "Clienti da far tornare con regolarita",
  ],
  "edilizia-ristrutturazioni": [
    "Richieste di preventivo da qualificare",
    "Cantieri e follow-up da coordinare",
    "Referenze e reputazione da valorizzare",
  ],
  "wedding-eventi": [
    "Tante richieste, poche davvero in target",
    "Preventivi e sopralluoghi da organizzare",
    "Relazione con i clienti lunga nel tempo",
  ],
};

export type Solution = {
  slug: string;
  service: ServiceDetail;
  sector: Sector;
  challenges: string[];
};

/** Tutti i servizi come array. */
export function allServices(): ServiceDetail[] {
  return Object.values(SERVICES_DETAIL);
}

/** Singolo servizio per slug. */
export function getService(slug: string): ServiceDetail | undefined {
  return SERVICES_DETAIL[slug];
}

/** Singolo settore per slug. */
export function getSector(slug: string): Sector | undefined {
  return SECTORS.find((sector) => sector.slug === slug);
}

/** Tutte le combinazioni: ogni servizio × ogni settore (4 × 12 = 48). */
export function allSolutions(): Solution[] {
  return allServices().flatMap((service) =>
    SECTORS.map((sector) => ({
      slug: `${service.slug}-per-${sector.slug}`,
      service,
      sector,
      challenges: SECTOR_CHALLENGES[sector.slug] ?? [],
    })),
  );
}

/** Le soluzioni di un servizio per tutti i settori. */
export function solutionsForService(slug: string): Solution[] {
  return allSolutions().filter((solution) => solution.service.slug === slug);
}

/** Le soluzioni di un settore per tutti i servizi. */
export function solutionsForSector(slug: string): Solution[] {
  return allSolutions().filter((solution) => solution.sector.slug === slug);
}

export function getSolution(slug: string): Solution | undefined {
  return allSolutions().find((solution) => solution.slug === slug);
}

/** Card di sintesi dei servizi per griglie/indici. */
export function serviceCards(): {
  slug: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  href: string;
}[] {
  return allServices().map((service) => ({
    slug: service.slug,
    name: service.name,
    tagline: service.tagline,
    icon: service.icon,
    href: `/servizi/${service.slug}`,
  }));
}
