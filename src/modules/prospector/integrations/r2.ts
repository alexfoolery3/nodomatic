/**
 * Cloudflare R2 — storage screenshot (PRD §4.1, Fase 2). STUB.
 */
import { NotImplementedError } from "./index";

export async function uploadToR2(
  _key: string,
  _data: ArrayBuffer | Uint8Array,
  _contentType: string,
): Promise<string> {
  void _key;
  void _data;
  void _contentType;
  throw new NotImplementedError("Cloudflare R2 upload", "Fase 2");
}
