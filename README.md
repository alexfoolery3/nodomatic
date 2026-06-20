# Nodomatic

Ecosistema di automazioni di **RT Studio**. Il primo modulo è **Prospector**: prospecting
automatizzato, audit siti web, generazione contenuti AI, outreach e CRM — in un unico flusso.

> Uso interno (non SaaS), volume 50-100 richieste/giorno. Fonte di verità: [`docs/PRD.md`](docs/PRD.md).
> Leggi il PRD e [`CLAUDE.md`](CLAUDE.md) prima di sviluppare.

## Stack

Next.js 15 (App Router, TS) · Tailwind CSS v4 + shadcn/ui · Drizzle ORM + Neon (Postgres) ·
BetterAuth · Inngest · Apify · PageSpeed · Claude API · Resend · Cloudflare R2 · Vercel.

## Struttura (modular monolith)

```
src/
  app/                      # route Next.js
    page.tsx                # landing pubblica (nodomatic.com)
    (dashboard)/            # dashboard interna con auth gate
    p/[slug]/               # landing dinamica per prospect (PRD §8)
    api/auth/[...all]/      # BetterAuth
    api/inngest/            # Inngest serve
  lib/                      # fondamenta condivise
    db/{schema,index}.ts    # Drizzle: schema completo + client Neon
    auth.ts, auth-client.ts # BetterAuth
    env.ts                  # accesso env (lazy, build-safe)
    utils.ts                # cn() shadcn
  components/ui/            # primitives shadcn (button, card, ...)
  modules/prospector/       # dominio del modulo
    scoring.ts              # logica prospect_score (PRD §6)
    integrations/           # Apify, PageSpeed, screenshot, AI, Resend, R2 (stub)
    inngest/                # client + functions del funnel
docs/PRD.md                 # Product Requirements Document (v1.1)
```

## Setup locale

Requisiti: Node 22, pnpm 10.

```bash
pnpm install
cp .env.example .env.local   # poi riempi i valori (vedi sotto)
pnpm dev                     # http://localhost:3000
```

Senza segreti l'app builda e la dashboard mostra un avviso di configurazione. Per renderla
operativa servono almeno `DATABASE_URL` (Neon) e i segreti di BetterAuth.

### Database (Drizzle + Neon)

```bash
# imposta DATABASE_URL in .env.local, poi:
pnpm db:push        # sincronizza lo schema sul DB (dev)
pnpm db:generate    # genera le migrazioni (per produzione)
pnpm db:migrate     # applica le migrazioni
pnpm db:studio      # GUI Drizzle Studio
```

### Variabili d'ambiente

Tutte in [`.env.example`](.env.example). Genera il secret auth con `openssl rand -base64 32`.
Mai committare segreti: `.env.local` è gitignorato.

## Script

| Comando | Azione |
|---|---|
| `pnpm dev` | server di sviluppo |
| `pnpm build` | build di produzione (verde anche senza segreti) |
| `pnpm start` | avvia il build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:*` | migrazioni Drizzle |

## Deploy (Vercel)

Il progetto è deploy-ready su Vercel. Build verde senza segreti, quindi la prima preview
funziona subito. Per renderlo operativo:

1. Collega il repo GitHub al progetto Vercel (team RT Studio).
2. Aggiungi le variabili d'ambiente di [`.env.example`](.env.example) in Vercel
   (Production + Preview). Imposta `NEXT_PUBLIC_APP_URL` e `BETTER_AUTH_URL` su `https://nodomatic.com`.
3. Collega il dominio **nodomatic.com** dal pannello Vercel. I sottodomini per moduli/funzioni
   si aggiungono in seguito.
4. Configura l'endpoint Inngest (`/api/inngest`) e i webhook (Resend) quando attivi quelle fasi.

## Stato

**Fase 0 (fondamenta deploy-ready) completata.** Prossima: Fase 1 (Neon + login + scraping Apify
+ audit PageSpeed + scoring reale). Dettaglio in [`docs/PRD.md`](docs/PRD.md) §10-11.
