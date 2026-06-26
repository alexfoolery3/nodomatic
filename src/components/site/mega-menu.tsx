"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SiteButton } from "./site-button";
import type { NavLink } from "@/content/site";

type Item = { name: string; href: string; tagline?: string };
type MenuKey = "servizi" | "settori";

/**
 * Navigazione desktop con mega menu a tendina per Servizi e Settori.
 * Nessuna icona prima del testo (solo il chevron di affordance dopo la label).
 * Il pannello è full-width: la navbar ha `backdrop-blur` (containing block per gli
 * elementi posizionati), quindi `absolute inset-x-0 top-full` copre l'intera larghezza.
 */
export function MegaMenu({
  services,
  sectors,
  links,
  cta,
}: {
  services: Item[];
  sectors: Item[];
  links: NavLink[];
  cta: NavLink;
}) {
  const [open, setOpen] = useState<MenuKey | null>(null);
  const pathname = usePathname();
  const baseId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Chiudi al cambio rotta.
  useEffect(() => setOpen(null), [pathname]);

  // Chiusura su Esc e su click esterno quando aperto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };
  const openMenu = (k: MenuKey) => {
    cancelClose();
    setOpen(k);
  };

  return (
    <div
      ref={wrapRef}
      className="hidden md:block"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <nav className="flex items-center gap-8">
        {(["servizi", "settori"] as MenuKey[]).map((k) => {
          const isOpen = open === k;
          return (
            <button
              key={k}
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="true"
              aria-controls={`${baseId}-${k}`}
              onMouseEnter={() => openMenu(k)}
              onFocus={() => openMenu(k)}
              onClick={() => setOpen(isOpen ? null : k)}
              className={`inline-flex items-center gap-1 text-[15px] font-medium transition-colors ${
                isOpen ? "text-site-text" : "text-site-body hover:text-site-text"
              }`}
            >
              {k === "servizi" ? "Servizi" : "Settori"}
              <ChevronDown
                className={`size-4 transition-transform ${isOpen ? "rotate-180 text-site-text" : "text-site-muted"}`}
                aria-hidden="true"
              />
            </button>
          );
        })}

        {links.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="text-[15px] font-medium text-site-body transition-colors hover:text-site-text"
          >
            {l.label}
          </Link>
        ))}

        <SiteButton href={cta.href} size="sm">
          {cta.label}
        </SiteButton>
      </nav>

      {open ? (
        <div
          id={`${baseId}-${open}`}
          role="region"
          aria-label={open === "servizi" ? "Servizi" : "Settori"}
          className="absolute inset-x-0 top-full z-40 border-b border-site-line bg-site-canvas"
        >
          <div className="mx-auto w-full max-w-[1200px] px-6 py-8 md:px-14">
            {open === "servizi" ? (
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                  <p className="mb-5 text-xs font-medium uppercase tracking-[0.14em] text-metal-300">
                    Servizi
                  </p>
                  <ul className="grid grid-cols-2 gap-1">
                    {services.map((s) => (
                      <li key={s.href}>
                        <Link
                          href={s.href}
                          className="block rounded-[10px] px-3.5 py-3 transition-colors hover:bg-site-surface"
                        >
                          <span className="block text-[16px] font-medium text-site-text">
                            {s.name}
                          </span>
                          {s.tagline ? (
                            <span className="mt-0.5 block text-[13px] leading-relaxed text-site-muted">
                              {s.tagline}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-l border-site-line pl-8">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-metal-300">
                    In evidenza
                  </p>
                  <p className="mt-3 text-[18px] font-medium text-site-text">
                    Non sai da dove partire?
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-site-muted">
                    Prenota una call: capiamo insieme cosa ha più senso per la tua attività.
                  </p>
                  <div className="mt-4">
                    <SiteButton href={cta.href} size="sm">
                      {cta.label}
                    </SiteButton>
                  </div>
                  <Link
                    href="/servizi"
                    className="mt-4 inline-block text-[14px] font-medium text-metal-300 transition-colors hover:text-site-text"
                  >
                    Vedi tutti i servizi →
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-5 text-xs font-medium uppercase tracking-[0.14em] text-metal-300">
                  Settori
                </p>
                <ul className="grid grid-cols-4 gap-x-6 gap-y-1">
                  {sectors.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className="block rounded-[10px] px-3 py-2.5 text-[15px] font-medium text-site-body transition-colors hover:bg-site-surface hover:text-site-text"
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center justify-between border-t border-site-line pt-4">
                  <span className="text-[13px] text-site-muted">
                    Ogni settore è coperto dai 4 servizi.
                  </span>
                  <Link
                    href="/settori"
                    className="text-[14px] font-medium text-metal-300 transition-colors hover:text-site-text"
                  >
                    Vedi tutti i settori →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
