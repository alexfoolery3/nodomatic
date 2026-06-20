/**
 * Apify — Google Maps Scraper actor (PRD §3 [2], Fase 1).
 * Input: categoria + città → lista attività.
 *
 * build-green: `APIFY_TOKEN` viene letto a runtime con `requireEnv` dentro la
 * funzione, mai a import-time.
 */
import { requireEnv } from "@/lib/env";

export type ScrapedBusiness = {
  businessName: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  category: string | null;
  gmapsRating: number | null;
  gmapsReviews: number | null;
};

export type ScrapeParams = {
  category: string;
  city: string;
  limit?: number;
};

/** Actor "Google Maps Scraper" di Apify (compass/crawler-google-places). */
const ACTOR = "compass~crawler-google-places";

type ApifyPlace = {
  title?: string;
  website?: string | null;
  phone?: string | null;
  phoneUnformatted?: string | null;
  address?: string | null;
  street?: string | null;
  categoryName?: string | null;
  totalScore?: number | null;
  reviewsCount?: number | null;
};

function mapPlace(p: ApifyPlace): ScrapedBusiness {
  return {
    businessName: p.title?.trim() ?? "",
    website: p.website ?? null,
    phone: p.phone ?? p.phoneUnformatted ?? null,
    address: p.address ?? p.street ?? null,
    category: p.categoryName ?? null,
    gmapsRating: typeof p.totalScore === "number" ? p.totalScore : null,
    gmapsReviews: typeof p.reviewsCount === "number" ? p.reviewsCount : null,
  };
}

export async function scrapeGoogleMaps(params: ScrapeParams): Promise<ScrapedBusiness[]> {
  const token = requireEnv("APIFY_TOKEN");
  const limit = params.limit ?? 50;

  const input = {
    searchStringsArray: [`${params.category} ${params.city}`],
    maxCrawledPlacesPerSearch: limit,
    language: "it",
    countryCode: "it",
  };

  const res = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );

  if (!res.ok) {
    throw new Error(`Apify scrape fallito (${res.status}): ${await res.text()}`);
  }

  const items = (await res.json()) as ApifyPlace[];
  return items.filter((p) => p.title).map(mapPlace);
}
