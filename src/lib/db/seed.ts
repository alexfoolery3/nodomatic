/**
 * Seed: crea il primo utente admin (PRD §2, Fase 1).
 *
 * Da eseguire UNA TANTUM dopo aver configurato il database:
 *   SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... pnpm db:seed
 *
 * Usa un'istanza BetterAuth locale (senza il plugin nextCookies) per poter girare
 * fuori dal contesto di richiesta Next. Import relativi → compatibile con tsx.
 */
import "dotenv/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { db } from "./index";
import * as schema from "./schema";

const seedAuth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "seed-only-secret",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "sales", input: false },
    },
  },
});

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL mancante: configura .env.local prima del seed.");
  }
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";
  if (!email || !password) {
    throw new Error("Imposta SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD in .env.local.");
  }

  const existing = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, email))
    .limit(1);

  if (existing[0]) {
    await db.update(schema.user).set({ role: "admin" }).where(eq(schema.user.email, email));
    console.log(`Utente ${email} già esistente → promosso ad admin.`);
    return;
  }

  await seedAuth.api.signUpEmail({ body: { email, password, name } });
  await db.update(schema.user).set({ role: "admin" }).where(eq(schema.user.email, email));
  console.log(`Admin creato e promosso: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
