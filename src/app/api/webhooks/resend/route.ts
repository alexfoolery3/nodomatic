/**
 * Webhook Resend → email_events (PRD §3 [8], §12).
 * La firma viene verificata con Svix (Resend usa Svix) prima di fidarsi del payload.
 */
import { NextResponse, type NextRequest } from "next/server";
import { Webhook } from "svix";
import { isDbConfigured } from "@/lib/env";
import {
  findEventByResendId,
  insertEmailEvent,
  type EmailEventType,
} from "@/modules/prospector/data/emailEvents";
import { getProspect, setProspectStatus } from "@/modules/prospector/data/prospects";

type ResendWebhookEvent = {
  type: string;
  data?: { email_id?: string };
};

/** Mappa il tipo evento Resend → enum email_event_type del nostro schema. */
const TYPE_MAP: Record<string, EmailEventType> = {
  "email.delivered": "delivered",
  "email.opened": "open",
  "email.clicked": "click",
  "email.bounced": "bounce",
  "email.complained": "complaint",
};

export async function POST(req: NextRequest) {
  if (!isDbConfigured || !process.env.RESEND_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const payload = await req.text();
  let event: ResendWebhookEvent;
  try {
    const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET);
    event = wh.verify(payload, {
      "svix-id": req.headers.get("svix-id") ?? "",
      "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
      "svix-signature": req.headers.get("svix-signature") ?? "",
    }) as ResendWebhookEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "firma non valida" }, { status: 400 });
  }

  const eventType = TYPE_MAP[event.type];
  const resendId = event.data?.email_id;
  if (!eventType || !resendId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Correla l'id messaggio Resend al prospect (via evento 'sent' iniziale).
  const origin = await findEventByResendId(resendId);
  if (!origin) {
    return NextResponse.json({ ok: true, unmatched: true });
  }

  await insertEmailEvent({
    prospectId: origin.prospectId,
    campaignId: origin.campaignId,
    eventType,
    resendId,
  });

  // Aggiorna lo stato del prospect solo in avanti (un open dopo un click non retrocede).
  if (eventType === "open" || eventType === "click") {
    const prospect = await getProspect(origin.prospectId);
    if (prospect) {
      if (eventType === "open" && prospect.status === "contacted") {
        await setProspectStatus(origin.prospectId, "opened");
      } else if (
        eventType === "click" &&
        (prospect.status === "contacted" || prospect.status === "opened")
      ) {
        await setProspectStatus(origin.prospectId, "clicked");
      }
    }
  }

  return NextResponse.json({ ok: true });
}
