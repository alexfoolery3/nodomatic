import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isDbConfigured } from "@/lib/env";
import { LogoutButton } from "@/components/logout-button";
import { SidebarNav } from "./sidebar-nav";

/**
 * Shell della dashboard con auth gate (PRD §10 Fase 1).
 *
 * - Senza database configurato (es. preview senza segreti) mostra un avviso di setup,
 *   così la preview resta navigabile e il build resta verde.
 * - Con DB configurato: richiede una sessione valida, altrimenti redirect a /login.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isDbConfigured) {
    return <SetupNotice />;
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-white">
        <div className="border-b px-5 py-4">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            Nodomatic
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav role={(session.user as { role?: string }).role} />
        </div>
        <div className="border-t p-3">
          <div className="mb-2 truncate px-3 text-xs text-neutral-500">
            {session.user.email}
          </div>
          <LogoutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold">Configurazione richiesta</h1>
        <p className="mt-2 text-sm text-neutral-600">
          La dashboard richiede un database. Imposta <code>DATABASE_URL</code> e le
          variabili in <code>.env.local</code> (vedi <code>.env.example</code>), poi
          esegui <code>pnpm db:push</code> e <code>pnpm db:seed</code>.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-neutral-900 underline underline-offset-4"
        >
          ← Torna alla home
        </Link>
      </div>
    </div>
  );
}
