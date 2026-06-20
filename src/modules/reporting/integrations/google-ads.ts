/**
 * Google Ads API — metriche campagne via developer token + MCC (Fase 3). STUB.
 * externalId = customer id (es. "1234567890").
 */
import { NotImplementedError, type DailyMetric, type FetchRange } from "./index";

export async function fetchGoogleAdsMetrics(
  _customerId: string,
  _range: FetchRange,
): Promise<DailyMetric[]> {
  void _customerId;
  void _range;
  throw new NotImplementedError("Google Ads", "Fase 3");
}
