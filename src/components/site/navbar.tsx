import { Logo } from "./logo";
import { MegaMenu } from "./mega-menu";
import { MobileMenu } from "./mobile-menu";
import { NAV_LINKS, PRIMARY_CTA, SECTORS } from "@/content/site";
import { serviceCards } from "@/content/solutions";

export function Navbar() {
  const services = serviceCards().map((s) => ({
    name: s.name,
    tagline: s.tagline,
    href: s.href,
  }));
  const sectors = SECTORS.map((s) => ({
    name: s.name,
    href: `/settori/${s.slug}`,
  }));
  // Servizi e Settori diventano dropdown del mega menu; restano link diretti gli altri.
  const links = NAV_LINKS.filter(
    (l) => l.href !== "/servizi" && l.href !== "/settori",
  );

  return (
    <header className="sticky top-0 z-50 border-b border-site-line bg-site-canvas/80 backdrop-blur supports-[backdrop-filter]:bg-site-canvas/70">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4 md:px-14">
        <Logo />
        <MegaMenu
          services={services}
          sectors={sectors}
          links={links}
          cta={PRIMARY_CTA}
        />
        <MobileMenu
          services={services}
          sectors={sectors}
          links={links}
          cta={PRIMARY_CTA}
        />
      </div>
    </header>
  );
}
