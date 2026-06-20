/**
 * Logica di scoring dei prospect (PRD §6).
 *
 * Il `prospect_score` (1-10) determina la priorità di outreach: più il sito è
 * messo male, più è un buon target. I prospect con score >= SCORE_THRESHOLD
 * entrano nel flusso di generazione AI + outreach.
 */

export const SCORE_THRESHOLD = 6;
export const MAX_SCORE = 10;
/** Score assegnato quando l'attività non ha alcun sito: target ottimo. */
export const NO_WEBSITE_SCORE = 8;

export type ScoringInput = {
  /** Ha un sito web? Se false, gli altri campi vengono ignorati. */
  hasWebsite: boolean;
  performanceScore?: number | null; // 0-100 (PageSpeed)
  mobileFriendly?: boolean | null;
  hasHttps?: boolean | null;
  /** true se lo stack è obsoleto (WP < 5, jQuery 1.x, Flash, table layout, ...). */
  outdatedTech?: boolean | null;
  loadTimeMs?: number | null;
};

/**
 * Calcola il prospect_score 1-10 secondo la pseudo-formula del PRD §6.
 *
 * - performance < 50 → +3, < 70 → +2
 * - non mobile-friendly → +2
 * - no HTTPS → +2
 * - stack obsoleto → +2
 * - load time > 5000ms → +1
 * - nessun sito → score fisso 8
 * - cap a 10
 */
export function computeProspectScore(input: ScoringInput): number {
  if (!input.hasWebsite) {
    return NO_WEBSITE_SCORE;
  }

  let score = 0;

  const perf = input.performanceScore;
  if (typeof perf === "number") {
    if (perf < 50) score += 3;
    else if (perf < 70) score += 2;
  }

  // I valori null/undefined sono trattati come "dato non disponibile" → nessun punto.
  if (input.mobileFriendly === false) score += 2;
  if (input.hasHttps === false) score += 2;
  if (input.outdatedTech === true) score += 2;
  if (typeof input.loadTimeMs === "number" && input.loadTimeMs > 5000) score += 1;

  return Math.min(score, MAX_SCORE);
}

/** True se il prospect è qualificato per il flusso AI + outreach automatico. */
export function isQualified(score: number): boolean {
  return score >= SCORE_THRESHOLD;
}
