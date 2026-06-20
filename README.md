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

# crea il primo utente admin (imposta SEED_ADMIN_EMAIL/PASSWORD in .env.local):
pnpm db:seed
```

Poi vai su `/login`, accedi e crea una campagna da `/campaigns` (categoria + città):
Inngest esegue scraping (Apify) e audit (PageSpeed), e i prospect compaiono ordinati per score.

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

**Fasi 1-3 implementate.** Fase 1: login + ruoli, campagne, scraping Apify, audit PageSpeed,
scoring, lista prospect. Fase 2: contenuti AI (Claude Haiku), report, screenshot → R2, landing
`/p/[slug]`, tracking visite. Fase 3: outreach Resend + sequenza follow-up condizionale (Inngest),
webhook tracking (firma Svix), warmup. In attesa di **verifica live** con le chiavi reali.
Dettaglio in [`docs/PRD.md`](docs/PRD.md) §10-11.

> Webhook Resend: configurare su Resend l'endpoint `…/api/webhooks/resend` e mettere il secret
> in `RESEND_WEBHOOK_SECRET`. Il dominio email outreach va verificato (SPF/DKIM/DMARC) lato Resend.
