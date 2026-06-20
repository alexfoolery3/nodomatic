import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isDbConfigured } from "@/lib/env";

/**
 * Shell della dashboard con auth gate (PRD §10 Fase 1).
 *
 * - Se il database non è configurato (es. preview deploy senza segreti), mostra
 *   un avviso di setup invece di tentare una query → la preview resta navigabile.
 * - Con DB configurato: richiede una sessione valida, altrimenti redirect alla home.
 *   La pagina di login completa arriva in Fase 1.
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
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            Nodomatic
          </Link>
          <span className="text-sm text-neutral-500">{session.user.email}</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
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
          esegui <code>pnpm db:push</code>.
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
