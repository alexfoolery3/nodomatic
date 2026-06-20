/**
 * Meta Graph API — insights organici pagina FB / profilo IG (Fase 3). STUB.
 * externalId = page id / ig user id.
 */
import { NotImplementedError, type DailyMetric, type FetchRange } from "./index";

export async function fetchMetaOrganicMetrics(
  _pageId: string,
  _range: FetchRange,
): Promise<DailyMetric[]> {
  void _pageId;
  void _range;
  throw new NotImplementedError("Meta organic", "Fase 3");
}
