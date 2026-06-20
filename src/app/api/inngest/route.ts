/**
 * Endpoint Inngest — serve le functions del modulo prospector.
 */
import { serve } from "inngest/next";
import { inngest } from "@/modules/prospector/inngest/client";
import { functions } from "@/modules/prospector/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
