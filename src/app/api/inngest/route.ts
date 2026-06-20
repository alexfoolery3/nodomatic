/**
 * Endpoint Inngest — serve le functions di tutti i moduli sul client condiviso.
 */
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { functions as prospectorFunctions } from "@/modules/prospector/inngest/functions";
import { functions as reportingFunctions } from "@/modules/reporting/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [...prospectorFunctions, ...reportingFunctions],
});
