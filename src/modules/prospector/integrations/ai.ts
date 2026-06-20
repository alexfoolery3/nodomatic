/**
 * Generazione contenuti AI via Claude API (PRD §7, Fase 2).
 *
 * Output JSON strutturato (structured outputs + Zod): analisi problemi + copy
 * landing + email subject/body, personalizzati per prospect, in italiano.
 *
 * Modello: Claude Haiku per costi (PRD §7). build-green: `ANTHROPIC_API_KEY`
 * letto a runtime con `requireEnv`.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { LandingCopy } from "@/lib/db/schema";
import { requireEnv } from "@/lib/env";
import type { AuditResult } from "./pagespeed";

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

const MODEL = "claude-haiku-4-5";

const contentSchema = z.object({
  analysis_text: z.string(),
  landing_copy: z.object({
    headline: z.string(),
    subheadline: z.string(),
    problems: z.array(z.string()),
    solutions: z.array(z.string()),
    cta: z.string(),
  }),
  email_subject: z.string(),
  email_body: z.string(),
});

const SYSTEM_PROMPT = `Sei un copywriter esperto di RT Studio, agenzia web italiana.
Generi contenuti per una proposta di redesign rivolta a un'attività locale.
Regole tassative:
- Scrivi SEMPRE in italiano, tono professionale e diretto, mai aggressivo.
- Personalizza usando nome attività, città e i problemi reali emersi dall'audit.
- Niente promesse esagerate o claim non verificabili.
- L'email deve essere breve (max 120 parole) con UN solo invito all'azione.
- 3 problemi e 3 soluzioni concrete, coerenti con i dati dell'audit.`;

export async function generateProspectContent(
  input: GenerateContentInput,
): Promise<GeneratedContent> {
  const client = new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });
  const { businessName, city, category, audit } = input;

  const userPrompt = [
    `Attività: ${businessName}`,
    category ? `Categoria: ${category}` : null,
    `Città: ${city}`,
    "",
    "Risultati audit del sito attuale:",
    `- Performance: ${audit.performanceScore}/100`,
    `- SEO: ${audit.seoScore}/100`,
    `- Accessibilità: ${audit.accessibilityScore}/100`,
    `- Best practices: ${audit.bestPracticesScore}/100`,
    `- Mobile friendly: ${audit.mobileFriendly ? "sì" : "no"}`,
    `- HTTPS: ${audit.hasHttps ? "sì" : "no"}`,
    `- Tempo di caricamento: ${(audit.loadTimeMs / 1000).toFixed(1)}s`,
    "",
    "Genera l'analisi, il copy della landing e l'email di outreach.",
  ]
    .filter(Boolean)
    .join("\n");

  const message = await client.messages.parse({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
    output_config: { format: zodOutputFormat(contentSchema) },
  });

  const parsed = message.parsed_output;
  if (!parsed) {
    throw new Error("Generazione AI non ha prodotto output valido");
  }

  return {
    analysisText: parsed.analysis_text,
    landingCopy: parsed.landing_copy,
    emailSubject: parsed.email_subject,
    emailBody: parsed.email_body,
  };
}
