/**
 * Resend — invio email di outreach + tracking (PRD §3 [7][8], Fase 3).
 *
 * Usare un dominio/sottodominio dedicato con SPF/DKIM/DMARC (PRD §4.2): la
 * configurazione DNS è manuale lato Resend. build-green: chiavi a runtime.
 */
import { Resend } from "resend";
import { requireEnv } from "@/lib/env";

export type SendOutreachInput = {
  to: string;
  subject: string;
  body: string;
  /** URL della landing personale del prospect (/p/[slug]). */
  landingUrl: string;
};

export type SendOutreachResult = { resendId: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(body: string, landingUrl: string): string {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#171717;line-height:1.5;max-width:520px">
    ${paragraphs}
    <p style="margin:24px 0">
      <a href="${landingUrl}" style="background:#171717;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block">Guarda l'analisi del tuo sito</a>
    </p>
    <p style="margin:0;color:#737373;font-size:13px">Nodomatic · RT Studio</p>
  </div>`;
}

export const isResendConfigured = Boolean(
  process.env.RESEND_API_KEY && process.env.OUTREACH_FROM_EMAIL,
);

/**
 * Email interna al team (es. alert di monitoraggio). No-op se Resend o
 * TEAM_NOTIFY_EMAIL non sono configurati.
 */
export async function sendInternalEmail(subject: string, body: string): Promise<void> {
  const to = process.env.TEAM_NOTIFY_EMAIL;
  if (!to || !isResendConfigured) return;
  const resend = new Resend(requireEnv("RESEND_API_KEY"));
  await resend.emails.send({
    from: requireEnv("OUTREACH_FROM_EMAIL"),
    to,
    subject,
    text: body,
  });
}

export async function sendOutreachEmail(input: SendOutreachInput): Promise<SendOutreachResult> {
  const resend = new Resend(requireEnv("RESEND_API_KEY"));
  const from = requireEnv("OUTREACH_FROM_EMAIL");
  // Le risposte all'outreach vanno a una casella che leggiamo davvero (OUTREACH_REPLY_TO),
  // visto che il dominio mittente serve solo per inviare e non riceve. Opzionale.
  const replyTo = process.env.OUTREACH_REPLY_TO;

  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: renderHtml(input.body, input.landingUrl),
    text: `${input.body}\n\n${input.landingUrl}\n\nNodomatic · RT Studio`,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error || !data) {
    throw new Error(`Invio Resend fallito: ${error?.message ?? "nessun id"}`);
  }
  return { resendId: data.id };
}
