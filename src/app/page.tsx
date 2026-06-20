import Link from "next/link";
import { ArrowRight, Search, Gauge, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Search, title: "Trova", text: "Attività locali da Google Maps per categoria e città." },
  { icon: Gauge, title: "Analizza", text: "Audit automatico: performance, mobile, SEO, stack." },
  { icon: Sparkles, title: "Personalizza", text: "Report e landing su misura generati con l'AI." },
  { icon: Send, title: "Contatta", text: "Outreach tracciato e follow-up automatici." },
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(120,119,198,0.18),transparent)]" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">Nodomatic</span>
        <Button asChild variant="secondary" size="sm">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-5 inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-xs text-neutral-400">
          un prodotto RT Studio
        </span>
        <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Prospecting automatizzato,
          <br />
          dal lead al cliente.
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg text-neutral-400">
          Nodomatic trova attività locali, ne analizza il sito, genera una proposta
          personalizzata e gestisce l&apos;outreach — tutto in un unico flusso.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Apri la dashboard
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-20 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 text-left"
            >
              <Icon className="size-5 text-neutral-300" />
              <h3 className="mt-3 font-medium">{title}</h3>
              <p className="mt-1 text-sm text-neutral-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 py-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Nodomatic · RT Studio
      </footer>
    </main>
  );
}
