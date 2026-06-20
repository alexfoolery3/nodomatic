/**
 * Google Analytics 4 — Data API via service account (Fase 1). STUB.
 * externalId = GA4 property id (es. "properties/123456789" o "123456789").
 */
import { NotImplementedError, type DailyMetric, type FetchRange } from "./index";

export async function fetchGa4Metrics(
  _propertyId: string,
  _range: FetchRange,
): Promise<DailyMetric[]> {
  void _propertyId;
  void _range;
  throw new NotImplementedError("GA4", "Fase 1");
}
