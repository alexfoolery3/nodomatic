/**
 * Resend — invio email di outreach + tracking (PRD §3 [7][8], Fase 3). STUB.
 * Usare un dominio/sottodominio dedicato con SPF/DKIM/DMARC (PRD §4.2).
 */
import { NotImplementedError } from "./index";

export type SendOutreachInput = {
  to: string;
  subject: string;
  body: string;
  prospectId: string;
  campaignId: string;
};

export type SendOutreachResult = {
  resendId: string;
};

export async function sendOutreachEmail(
  _input: SendOutreachInput,
): Promise<SendOutreachResult> {
  void _input;
  throw new NotImplementedError("Resend outreach", "Fase 3");
}
