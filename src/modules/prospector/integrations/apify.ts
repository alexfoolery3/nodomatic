/**
 * Apify — Google Maps Scraper actor (PRD §3 [2], Fase 1).
 * Input: categoria + città → lista attività. STUB.
 */
import { NotImplementedError } from "./index";

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

export async function scrapeGoogleMaps(_params: ScrapeParams): Promise<ScrapedBusiness[]> {
  void _params;
  throw new NotImplementedError("Apify Google Maps Scraper", "Fase 1");
}
