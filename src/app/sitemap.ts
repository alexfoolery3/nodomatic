import type { MetadataRoute } from "next";
import { SECTORS } from "@/content/site";
import { allServices, allSolutions } from "@/content/solutions";

/**
 * Sitemap XML del sito vetrina (/sitemap.xml). Include le pagine pubbliche, gli hub
 * servizio/settore e le 48 soluzioni servizio×settore (pagine SEO indicizzabili, non
 * presenti nella navigazione). Esclude la dashboard interna.
 */
const BASE = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://www.nodomatic.com"
).replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const main: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/servizi`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/settori`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/chi-siamo`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/contatti`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE}/sitemap`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const serviceHubs: MetadataRoute.Sitemap = allServices().map((s) => ({
    url: `${BASE}/servizi/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const sectorHubs: MetadataRoute.Sitemap = SECTORS.map((s) => ({
    url: `${BASE}/settori/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const solutions: MetadataRoute.Sitemap = allSolutions().map((s) => ({
    url: `${BASE}/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...main, ...serviceHubs, ...sectorHubs, ...solutions];
}
