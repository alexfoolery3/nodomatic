/**
 * Accesso centralizzato alle variabili d'ambiente.
 *
 * IMPORTANTE (build-green): questo modulo NON lancia mai a import/build-time.
 * Durante `next build` su Vercel i segreti possono non essere presenti: le
 * funzioni che richiedono una chiave devono validarla al momento dell'uso
 * (runtime) tramite `requireEnv`, non all'import.
 */

function optional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

/** Ritorna la variabile o lancia — da chiamare SOLO a runtime, dentro le funzioni. */
export function requireEnv(name: string): string {
  const v = optional(name);
  if (!v) {
    throw new Error(
      `Variabile d'ambiente mancante: ${name}. Aggiungila a .env.local (vedi .env.example).`,
    );
  }
  return v;
}

export const env = {
  appUrl: optional("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  databaseUrl: optional("DATABASE_URL"),
  betterAuthSecret: optional("BETTER_AUTH_SECRET"),
  betterAuthUrl:
    optional("BETTER_AUTH_URL") ?? optional("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
};

/** True quando l'app è configurata con un database reale (non il placeholder di build). */
export const isDbConfigured = Boolean(env.databaseUrl);
