"use server";

/**
 * Server action del form contatti del sito vetrina.
 * build-green: nessuna env obbligatoria. Se Resend è configurato invia l'email,
 * altrimenti accetta comunque il messaggio (lead da collegare in seguito).
 */

export type ContactState = { ok: boolean; message: string } | null;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { ok: false, message: "Compila nome, email e messaggio." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Inserisci un'email valida." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.OUTREACH_FROM_EMAIL;
  const to = process.env.TEAM_NOTIFY_EMAIL || from;

  if (apiKey && from && to) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          reply_to: email,
          subject: `Nuovo contatto dal sito: ${name}`,
          text: `${name} <${email}>\n\n${message}`,
        }),
      });
      if (!res.ok) {
        return { ok: false, message: "Invio non riuscito, riprova tra poco." };
      }
    } catch {
      return { ok: false, message: "Invio non riuscito, riprova tra poco." };
    }
  }

  return { ok: true, message: "Grazie! Ti ricontattiamo a breve." };
}
