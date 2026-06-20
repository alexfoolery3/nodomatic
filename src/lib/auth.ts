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

export const auth = betterAuth({
  baseURL: env.betterAuthUrl,
  secret: env.betterAuthSecret ?? "build-time-placeholder-secret-change-in-production",
  database: drizzleAdapter(db, {
    provider: "pg",
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
        type: "string",
        required: false,
        defaultValue: "sales",
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
