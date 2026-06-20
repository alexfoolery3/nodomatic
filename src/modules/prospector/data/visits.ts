/**
 * Data layer — visite alle landing (Drizzle). Runtime-only.
 */
import { db } from "@/lib/db";
import { landingVisits } from "@/lib/db/schema";

export async function recordLandingVisit(input: {
  prospectId: string;
  ipHash: string;
  userAgent: string | null;
  referrer: string | null;
  durationSec: number | null;
}) {
  await db.insert(landingVisits).values({
    prospectId: input.prospectId,
    ipHash: input.ipHash,
    userAgent: input.userAgent,
    referrer: input.referrer,
    durationSec: input.durationSec,
  });
}
