/**
 * Apollo.io — arricchimento contatti (trova email per i prospect senza email).
 * Opzionale: attivo solo se APOLLO_API_KEY è configurata. build-green: chiave a runtime.
 */
import { requireEnv } from "@/lib/env";

export const isApolloConfigured = Boolean(process.env.APOLLO_API_KEY);

/** Estrae il dominio "nudo" da una URL (senza www). */
export function domainFromUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

type ApolloPerson = { email?: string | null };

/**
 * Cerca un'email professionale per un dominio aziendale via Apollo people search.
 * Ritorna la prima email "sbloccata" trovata, o null.
 */
export async function findEmailForDomain(domain: string): Promise<string | null> {
  const key = requireEnv("APOLLO_API_KEY");

  const res = await fetch("https://api.apollo.io/api/v1/mixed_people/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "X-Api-Key": key,
    },
    body: JSON.stringify({ q_organization_domains: domain, page: 1, per_page: 5 }),
  });

  if (!res.ok) {
    throw new Error(`Apollo enrichment fallito (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as { people?: ApolloPerson[] };
  for (const p of data.people ?? []) {
    if (p.email && !/email_not_unlocked/i.test(p.email)) return p.email;
  }
  return null;
}
