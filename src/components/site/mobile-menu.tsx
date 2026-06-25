"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { NAV_LINKS, PRIMARY_CTA } from "@/content/site";
import { SiteButton } from "./site-button";

/**
 * Menu di navigazione per mobile: hamburger + drawer a tutto schermo. Visibile solo < md.
 * Il drawer è portato su document.body: la navbar usa `backdrop-blur` (backdrop-filter),
 * che crea un containing block per i discendenti `fixed` e schiaccerebbe `inset-0` all'altezza
 * della navbar. Col portale fuori da quel contesto, `fixed inset-0` copre l'intero viewport.
 * Il wrapper `.site` ripristina i token di tema e il font fuori dal route group.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  // Il portale richiede document.body: monta solo lato client.
  useEffect(() => setMounted(true), []);

  // Chiudi al cambio rotta.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Blocca lo scroll del body quando aperto + chiusura su Esc.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const drawer = (
    <div className="site font-sans md:hidden">
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Menu di navigazione"
        className="fixed inset-0 z-[60] flex flex-col bg-site-canvas"
      >
        <div className="flex items-center justify-between border-b border-site-line px-6 py-4">
          <span className="text-[20px] font-semibold tracking-tight text-site-text">
            Nodomatic
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Chiudi menu"
            className="inline-flex size-10 items-center justify-center rounded-[10px] text-site-body transition-colors hover:text-site-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-metal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-site-canvas"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-6 py-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-site-line py-4 text-2xl font-medium tracking-tight text-site-body transition-colors hover:text-site-text"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-8">
            <SiteButton href={PRIMARY_CTA.href} variant="primary" size="lg">
              {PRIMARY_CTA.label}
            </SiteButton>
          </div>
        </nav>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex size-10 items-center justify-center rounded-[10px] text-site-body transition-colors hover:text-site-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-metal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-site-canvas"
      >
        <Menu className="size-6" aria-hidden="true" />
      </button>

      {mounted && open ? createPortal(drawer, document.body) : null}
    </div>
  );
}
