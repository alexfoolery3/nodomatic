import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Config di drizzle-kit (CLI migrazioni). Usata solo da `pnpm db:*`, mai a runtime.
 * Richiede DATABASE_URL in `.env.local`. Le migrazioni generate finiscono in
 * `src/lib/db/migrations` (gitignorato il solo output runtime, le migrazioni sono versionate).
 */
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});
