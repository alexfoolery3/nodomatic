import Link from "next/link";
import { Logo } from "./logo";
import { FOOTER_COLUMNS } from "@/content/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-site-line bg-site-canvas">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-12 md:px-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo markSize={24} />
            <p className="mt-3 text-[15px] text-site-muted">
              Automazione, marketing e AI per la crescita.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-metal-300">
                  {col.title}
                </p>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-[15px] text-site-body transition-colors hover:text-site-text"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-10 text-[13px] text-site-muted">
          © {year} Nodomatic · RT Studio
        </p>
      </div>
    </footer>
  );
}
