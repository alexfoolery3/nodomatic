"use client";

/**
 * Navigazione della dashboard come sidebar verticale (Fase 1 — 1B).
 * Client component: usa usePathname per evidenziare la pagina corrente.
 * Il layout (server) resta responsabile dell'auth gate e passa il ruolo.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Megaphone, Users, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campagne", icon: Megaphone },
  { href: "/clients", label: "Clienti", icon: Users },
  { href: "/team", label: "Team", icon: UserCog, adminOnly: true },
];

export function SidebarNav({ role }: { role?: string }) {
  const pathname = usePathname();
  const items = ITEMS.filter((i) => !i.adminOnly || role === "admin");

  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
