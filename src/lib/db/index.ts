/**
 * Client Drizzle su Neon (HTTP driver, ottimale per serverless/Vercel).
 *
 * build-green: se DATABASE_URL non è presente (es. durante `next build`),
 * si usa una stringa placeholder valida come URL. Nessuna connessione viene
 * aperta finché non si esegue una query effettiva (runtime).
 */
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require";

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });

export { schema };
