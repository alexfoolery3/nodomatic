/**
 * Generazione contenuti AI via Claude API (PRD §7, Fase 2). STUB.
 *
 * Output JSON strutturato: analisi problemi + copy landing + email subject/body,
 * personalizzati per prospect. Modello di partenza: Claude Haiku.
 */
import type { LandingCopy } from "@/lib/db/schema";
import type { AuditResult } from "./pagespeed";
import { NotImplementedError } from "./index";

export type GeneratedContent = {
  analysisText: string;
  landingCopy: LandingCopy;
  emailSubject: string;
  emailBody: string;
};

export type GenerateContentInput = {
  businessName: string;
  city: string;
  category: string | null;
  audit: AuditResult;
};

export async function generateProspectContent(
  _input: GenerateContentInput,
): Promise<GeneratedContent> {
  void _input;
  throw new NotImplementedError("Claude API content generation", "Fase 2");
}
