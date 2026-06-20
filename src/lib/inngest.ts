/**
 * Client Inngest condiviso (app "nodomatic"). Fondamenta cross-modulo (PRD §16):
 * tutti i moduli registrano le loro function su questo unico client, servite da
 * /api/inngest. La logica pesante gira qui, mai in request handler sincroni.
 */
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "nodomatic" });
