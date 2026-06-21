/**
 * Narrativa AI del report (Claude Haiku). Sintesi in italiano dei risultati del periodo.
 */
import Anthropic from "@anthropic-ai/sdk";
import { requireEnv } from "@/lib/env";
import type { ReportData } from "../report-service";

export async function generateReportNarrative(input: {
  clientName: string;
  data: ReportData;
}): Promise<string> {
  const client = new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });

  const summary = input.data.providers
    .map((p) => `${p.provider} (${p.displayName}): ${JSON.stringify(p.totals)}`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 800,
    system:
      "Sei un analista marketing di RT Studio. Scrivi una sintesi in italiano, chiara e " +
      "professionale, dei risultati del periodo per il cliente. Tono positivo ma onesto, niente " +
      "gergo tecnico eccessivo. 2-3 paragrafi brevi. Nessun preambolo.",
    messages: [
      {
        role: "user",
        content:
          `Cliente: ${input.clientName}\n` +
          `Periodo: ${input.data.periodStart} → ${input.data.periodEnd}\n` +
          `Dati aggregati per sorgente:\n${summary}\n\nScrivi la sintesi.`,
      },
    ],
  });

  const block = message.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "";
}
