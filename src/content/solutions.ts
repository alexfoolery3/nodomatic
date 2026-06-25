import type { LucideIcon } from "lucide-react";
import { Zap, Repeat, Database, BellRing } from "lucide-react";
import { SECTORS, type Sector } from "@/content/site";

/**
 * Contenuti delle pagine "soluzione servizio×settore"
 * (es. /automazioni-per-agenzie-immobiliari). Prima ondata: Automazioni × 12 settori.
 */

export type ServiceDetail = {
  slug: string;
  name: string;
  lead: string;
  solutions: { title: string; description: string; icon: LucideIcon }[];
  benefits: string[];
};

export const SERVICES_DETAIL: Record<string, ServiceDetail> = {
  automazioni: {
    slug: "automazioni",
    name: "Automazioni & AI",
    lead: "Flussi automatici e AI che gestiscono lead, follow-up e operatività al posto tuo.",
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
      "Strumenti professionali, anche per realtà piccole.",
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
    "Stagionalità difficile da gestire",
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
    "Clienti da far tornare con regolarità",
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

/** Combinazioni disponibili: Automazioni × tutti i settori. */
export function allSolutions(): Solution[] {
  const service = SERVICES_DETAIL.automazioni;
  return SECTORS.map((sector) => ({
    slug: `${service.slug}-per-${sector.slug}`,
    service,
    sector,
    challenges: SECTOR_CHALLENGES[sector.slug] ?? [],
  }));
}

export function getSolution(slug: string): Solution | undefined {
  return allSolutions().find((s) => s.slug === slug);
}
