"use client";

import { useEffect } from "react";

/**
 * Registra la visita alla landing e il tempo sulla pagina via beacon JS (PRD §8).
 * Invia una sola volta, all'uscita/nascondimento della pagina.
 */
export function LandingTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const start = Date.now();
    let sent = false;

    const send = () => {
      if (sent) return;
      sent = true;
      const durationSec = Math.round((Date.now() - start) / 1000);
      const payload = JSON.stringify({ slug, durationSec });
      navigator.sendBeacon?.(
        "/api/track/visit",
        new Blob([payload], { type: "application/json" }),
      );
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") send();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", send);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", send);
      send();
    };
  }, [slug]);

  return null;
}
