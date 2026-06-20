import { createHash } from "crypto";

/**
 * Hash dell'IP dei visitatori delle landing prima del salvataggio (privacy/GDPR, PRD §12).
 * Usa IP_HASH_SALT se presente; fallback non vuoto per non rompere il runtime senza config.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "nodomatic-default-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
