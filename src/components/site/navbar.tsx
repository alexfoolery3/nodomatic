import Link from "next/link";
import { Logo } from "./logo";
import { SiteButton } from "./site-button";
import { MobileMenu } from "./mobile-menu";
import { NAV_LINKS, PRIMARY_CTA } from "@/content/site";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-site-line bg-site-canvas/80 backdrop-blur supports-[backdrop-filter]:bg-site-canvas/70">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4 md:px-14">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-[15px] font-medium text-site-body transition-colors hover:text-site-text"
            >
              {l.label}
            </Link>
          ))}
          <SiteButton href={PRIMARY_CTA.href} size="sm">
            {PRIMARY_CTA.label}
          </SiteButton>
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}
