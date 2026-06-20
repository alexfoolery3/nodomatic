/**
 * Tracking visite landing (PRD §8). Endpoint pubblico: input validato con Zod,
 * IP hashato (privacy/GDPR). Riceve un beacon JSON dalla landing.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isDbConfigured } from "@/lib/env";
import { hashIp } from "@/lib/hash";
import { getProspectBySlug } from "@/modules/prospector/data/prospects";
import { recordLandingVisit } from "@/modules/prospector/data/visits";

const schema = z.object({
  slug: z.string().min(1).max(64),
  durationSec: z.number().int().nonnegative().max(86400).optional(),
});

export async function POST(req: NextRequest) {
  if (!isDbConfigured) return NextResponse.json({ ok: false }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const prospect = await getProspectBySlug(parsed.data.slug);
  if (!prospect) return NextResponse.json({ ok: false }, { status: 404 });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  await recordLandingVisit({
    prospectId: prospect.id,
    ipHash: hashIp(ip),
    userAgent: req.headers.get("user-agent"),
    referrer: req.headers.get("referer"),
    durationSec: parsed.data.durationSec ?? null,
  });

  return NextResponse.json({ ok: true });
}
