/**
 * Meta Marketing API — insights campagne via System User token (Fase 2). STUB.
 * externalId = ad account id (es. "act_1234567890").
 */
import { NotImplementedError, type DailyMetric, type FetchRange } from "./index";

export async function fetchMetaAdsMetrics(
  _adAccountId: string,
  _range: FetchRange,
): Promise<DailyMetric[]> {
  void _adAccountId;
  void _range;
  throw new NotImplementedError("Meta Ads", "Fase 2");
}
