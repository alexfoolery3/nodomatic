"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { SiteButton } from "./site-button";
import type { NavLink } from "@/content/site";

type Item = { name: string; href: string };
type SectionKey = "servizi" | "settori";

const triggerCls =
  "inline-flex size-10 items-center justify-center rounded-[10px] text-site-body transition-colors hover:text-site-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-metal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-site-canvas";

/**
 * Menu mobile: hamburger + drawer a tutto schermo (portato su document.body per evitare
 * il containing block creato dal `backdrop-blur` della navbar). Servizi e Settori sono
 * sezioni espandibili (accordion) con le sotto-voci; Chi siamo/Contatti restano link.
 */
export function MobileMenu({
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
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [section, setSection] = useState<SectionKey | null>(null);
  const pathname = usePathname();
  const panelId = useId();

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) setSection(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = () => setOpen(false);

  const renderSection = (
    key: SectionKey,
    label: string,
    allHref: string,
    allLabel: string,
    items: Item[],
  ) => {
    const expanded = section === key;
    return (
      <div className="border-b border-site-line">
        <button
          type="button"
          onClick={() => setSection(expanded ? null : key)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between py-4 text-2xl font-medium tracking-tight text-site-body transition-colors hover:text-site-text"
        >
          {label}
          <ChevronDown
            className={`size-5 text-site-muted transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
        {expanded ? (
          <ul className="flex flex-col gap-0.5 pb-4">
            <li>
              <Link
                href={allHref}
                onClick={close}
                className="block py-2 text-[15px] font-medium text-site-text"
              >
                {allLabel}
              </Link>
            </li>
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={close}
                  className="block py-2 text-[15px] text-site-muted transition-colors hover:text-site-text"
                >
                  {it.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  };

  const drawer = (
    <div className="site font-sans md:hidden">
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Menu di navigazione"
        className="fixed inset-0 z-[60] flex flex-col bg-site-canvas"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-site-line px-6 py-4">
          <span className="text-[20px] font-semibold tracking-tight text-site-text">
            Nodomatic
          </span>
          <button type="button" onClick={close} aria-label="Chiudi menu" className={triggerCls}>
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
          {renderSection("servizi", "Servizi", "/servizi", "Tutti i servizi", services)}
          {renderSection("settori", "Settori", "/settori", "Tutti i settori", sectors)}
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={close}
              className="border-b border-site-line py-4 text-2xl font-medium tracking-tight text-site-body transition-colors hover:text-site-text"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-8">
            <SiteButton href={cta.href} variant="primary" size="lg">
              {cta.label}
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
        className={triggerCls}
      >
        <Menu className="size-6" aria-hidden="true" />
      </button>

      {mounted && open ? createPortal(drawer, document.body) : null}
    </div>
  );
}
