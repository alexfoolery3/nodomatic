/**
 * Istanza BetterAuth (server-side).
 *
 * Auth multi-utente con ruoli (PRD §2). Email + password per la Fase 1.
 *
 * build-green: l'istanza viene creata anche senza segreti/DB reali (usa
 * placeholder). Non apre connessioni all'import; la prima query avviene a runtime
 * quando un utente effettua login/registrazione.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { env } from "@/lib/env";

const baseOptions = {
  baseURL: env.betterAuthUrl,
  secret: env.betterAuthSecret ?? "build-time-placeholder-secret-change-in-production",
  // Origini ammesse per il login (PRD §2). Oltre al baseURL, accetta esplicitamente
  // apex e www di produzione: l'apex fa 308 → www, ma teniamo entrambi per robustezza
  // contro mismatch di Origin ("Invalid origin").
  trustedOrigins: [
    "https://www.nodomatic.com",
    "https://nodomatic.com",
    "http://localhost:3000",
  ],
  database: drizzleAdapter(db, {
    provider: "pg" as const,
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      // Ruolo applicativo. Non impostabile dall'utente in fase di signup.
      role: {
        type: "string" as const,
        required: false,
        defaultValue: "sales",
        input: false,
      },
    },
  },
};

export const auth = betterAuth({ ...baseOptions, plugins: [nextCookies()] });

/**
 * Istanza per operazioni amministrative server-side (es. creazione utenti da invito).
 * SENZA il plugin nextCookies: creare un utente NON deve impostare la sessione
 * nel browser dell'admin che esegue l'azione.
 */
export const authAdmin = betterAuth(baseOptions);

export type Session = typeof auth.$Infer.Session;
