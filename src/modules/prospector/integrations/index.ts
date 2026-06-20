/**
 * Stub delle integrazioni esterne del modulo prospector.
 *
 * In questa fase (fondamenta deploy-ready) le integrazioni NON sono implementate:
 * espongono firme tipizzate stabili e lanciano `NotImplementedError` se invocate
 * senza le rispettive chiavi. Verranno implementate nelle fasi successive del PRD,
 * sempre dentro Inngest functions (mai in request handler sincroni — PRD §4.3).
 */

export class NotImplementedError extends Error {
  constructor(integration: string, phase: string) {
    super(
      `Integrazione "${integration}" non ancora implementata (prevista in ${phase}). ` +
        `Vedi PRD e CLAUDE.md.`,
    );
    this.name = "NotImplementedError";
  }
}

export * from "./apify";
export * from "./pagespeed";
export * from "./screenshot";
export * from "./ai";
export * from "./resend";
export * from "./r2";
