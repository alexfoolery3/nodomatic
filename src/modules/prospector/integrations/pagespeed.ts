/**
 * PageSpeed Insights API — audit performance/SEO/accessibility (PRD §3 [3], Fase 1). STUB.
 */
import type { TechStack } from "@/lib/db/schema";
import { NotImplementedError } from "./index";

export type AuditResult = {
  performanceScore: number; // 0-100
  seoScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  mobileFriendly: boolean;
  hasHttps: boolean;
  techStack: TechStack;
  loadTimeMs: number;
};

export async function auditWebsite(_url: string): Promise<AuditResult> {
  void _url;
  throw new NotImplementedError("PageSpeed Insights", "Fase 1");
}
