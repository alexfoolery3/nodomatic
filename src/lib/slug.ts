import { randomBytes } from "crypto";

/**
 * Genera uno slug univoco e non indovinabile per le landing /p/[slug].
 * ~12 caratteri base36 da byte casuali (≈62 bit di entropia).
 */
export function generateSlug(length = 12): string {
  let out = "";
  // 1 byte → ~1.54 char base36: prendiamo byte abbondanti e tronchiamo.
  const bytes = randomBytes(length);
  for (let i = 0; i < bytes.length && out.length < length; i++) {
    out += (bytes[i] % 36).toString(36);
  }
  return out.slice(0, length);
}
