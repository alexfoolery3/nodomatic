/**
 * Client Inngest condiviso. Tutta la logica pesante (scraping, audit, AI, email)
 * gira in Inngest functions, mai in request handler sincroni (PRD §4.3).
 */
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "nodomatic" });
