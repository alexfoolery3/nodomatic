/**
 * Screenshot del sito prospect (Browserless o Cloudflare Browser Rendering)
 * (PRD §3 [3], decisione aperta §13.3). STUB.
 */
import { NotImplementedError } from "./index";

export type Screenshots = {
  desktopUrl: string; // R2 URL
  mobileUrl: string; // R2 URL
};

export async function captureScreenshots(_url: string): Promise<Screenshots> {
  void _url;
  throw new NotImplementedError("Screenshot provider", "Fase 2");
}
