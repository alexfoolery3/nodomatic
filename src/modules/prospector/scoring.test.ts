import { describe, it, expect } from "vitest";
import {
  computeProspectScore,
  isQualified,
  MAX_SCORE,
  NO_WEBSITE_SCORE,
  SCORE_THRESHOLD,
  type ScoringInput,
} from "./scoring";

/** Input "sano": un sito senza problemi → score 0. */
const healthy: ScoringInput = {
  hasWebsite: true,
  performanceScore: 95,
  mobileFriendly: true,
  hasHttps: true,
  outdatedTech: false,
  loadTimeMs: 1200,
};

describe("computeProspectScore", () => {
  it("assegna 8 quando non c'è alcun sito (ignorando gli altri campi)", () => {
    expect(computeProspectScore({ hasWebsite: false })).toBe(NO_WEBSITE_SCORE);
    expect(
      computeProspectScore({ hasWebsite: false, performanceScore: 10, hasHttps: false }),
    ).toBe(8);
  });

  it("dà 0 a un sito sano", () => {
    expect(computeProspectScore(healthy)).toBe(0);
  });

  it("performance < 50 → +3, tra 50 e 69 → +2, >= 70 → 0", () => {
    expect(computeProspectScore({ ...healthy, performanceScore: 49 })).toBe(3);
    expect(computeProspectScore({ ...healthy, performanceScore: 50 })).toBe(2);
    expect(computeProspectScore({ ...healthy, performanceScore: 69 })).toBe(2);
    expect(computeProspectScore({ ...healthy, performanceScore: 70 })).toBe(0);
  });

  it("somma i fattori: mobile, https, tech, load time", () => {
    expect(computeProspectScore({ ...healthy, mobileFriendly: false })).toBe(2);
    expect(computeProspectScore({ ...healthy, hasHttps: false })).toBe(2);
    expect(computeProspectScore({ ...healthy, outdatedTech: true })).toBe(2);
    expect(computeProspectScore({ ...healthy, loadTimeMs: 5001 })).toBe(1);
    expect(computeProspectScore({ ...healthy, loadTimeMs: 5000 })).toBe(0);
  });

  it("tratta null/undefined come dato non disponibile (nessun punto)", () => {
    expect(
      computeProspectScore({
        hasWebsite: true,
        performanceScore: null,
        mobileFriendly: null,
        hasHttps: null,
        outdatedTech: null,
        loadTimeMs: null,
      }),
    ).toBe(0);
    expect(computeProspectScore({ hasWebsite: true })).toBe(0);
  });

  it("applica il cap a 10 nel caso peggiore", () => {
    const worst: ScoringInput = {
      hasWebsite: true,
      performanceScore: 10, // +3
      mobileFriendly: false, // +2
      hasHttps: false, // +2
      outdatedTech: true, // +2
      loadTimeMs: 9000, // +1
    };
    // 3+2+2+2+1 = 10
    expect(computeProspectScore(worst)).toBe(MAX_SCORE);
    expect(computeProspectScore(worst)).toBeLessThanOrEqual(MAX_SCORE);
  });
});

describe("isQualified", () => {
  it("qualifica score >= soglia", () => {
    expect(isQualified(SCORE_THRESHOLD)).toBe(true);
    expect(isQualified(SCORE_THRESHOLD - 1)).toBe(false);
    expect(isQualified(10)).toBe(true);
  });
});
