# CLAUDE.md — guida per le sessioni di sviluppo

Leggi questo file e [`docs/PRD.md`](docs/PRD.md) all'inizio di ogni sessione. Il PRD è la
fonte di verità; questo file riassume le regole operative.

## Cos'è il progetto

Nodomatic = ecosistema di automazioni **interne** di RT Studio. Primo modulo: **Prospector**
(funnel: trova → analizza → personalizza con AI → contatta → follow-up → CRM). Vedi PRD §3.

## Vincoli vincolanti (PRD §1.5, §15, §16) — NON violare

- **Uso interno, NON SaaS.** Niente multi-tenancy, billing, onboarding self-service, inviti esterni.
- **Basso volume (50-100/giorno).** Soluzioni semplici e dirette. Niente code esterne oltre Inngest,
  cache distribuite, microservizi, sharding.
- **Budget ~€10-25/mese.** Preferire free tier e scale-to-zero.
- **Modular monolith definitivo**, non tappa verso microservizi. Un progetto, un deploy.
- **Anti-over-engineering.** NON costruire (senza decisione esplicita): multi-tenancy, billing,
  cold-outreach multi-inbox, feature flag elaborati, event sourcing, gateway pubblici, astrazioni
  premature. Generalizza solo quando un secondo modulo reale lo richiede.

## Regole di sviluppo (PRD §0)

- Costruire **per fasi** (PRD §10), in ordine. Non saltare avanti. Ogni fase testata prima della successiva.
- Ogni feature nuova → branch dedicato → PR → review → merge.
- **Mai segreti versionati.** Solo `.env.local` (gitignored) e `.env.example` (placeholder).
- Aggiornare la sezione "Stato avanzamento" (PRD §11) a fine sessione.
- Validare input con **Zod** su tutte le mutation. Logica pesante solo in **Inngest functions**.
- IP visitatori landing **hashati** prima del salvataggio (privacy/GDPR).

## Architettura

- **Modular monolith**: fondamenta condivise in `src/lib` e `src/components`; dominio in
  `src/modules/<modulo>`. Un modulo non dipende dal dominio di un altro: comunicano via eventi Inngest.
- **Server Actions** per le mutation, **Route Handlers** per i webhook esterni.
- Nuovo modulo Nodomatic = nuova cartella `src/modules/<modulo>` che riusa le fondamenta.

## Convenzioni "build-green" (importante)

L'app **deve compilare e deployare senza segreti** (preview Vercel). Quindi:

- Nessun `throw` a import/build-time per variabili mancanti. Usa `requireEnv(name)` (in `src/lib/env.ts`)
  **dentro le funzioni**, a runtime.
- `src/lib/db/index.ts` e `src/lib/auth.ts` usano fallback placeholder: nessuna connessione all'import.
- Le integrazioni esterne (`src/modules/prospector/integrations/*`) sono **stub** che lanciano
  `NotImplementedError` se chiamate. Implementale nella fase indicata, mai a import-time.
- La dashboard mostra un avviso di setup se `isDbConfigured` è false, invece di andare in errore.

Verifica sempre prima di committare: `pnpm typecheck && pnpm lint && pnpm build` (devono passare
**senza** `.env.local`).

## Dove sta cosa

- Schema DB: `src/lib/db/schema.ts` (auth `text` id, dominio `uuid`). Client: `src/lib/db/index.ts`.
- Auth: `src/lib/auth.ts` (server), `src/lib/auth-client.ts` (browser), route `app/api/auth/[...all]`.
- Scoring (PRD §6): `src/modules/prospector/scoring.ts` — pura, testabile.
- Funnel jobs: `src/modules/prospector/inngest/functions.ts`, serviti da `app/api/inngest`.
- Landing prospect: `app/p/[slug]/page.tsx`. Landing pubblica: `app/page.tsx`. Dashboard: `app/(dashboard)`.

## Decisioni prese

- Dominio: **nodomatic.com**. Sottodomini per moduli/funzioni in seguito.
- Next.js **15** (pinned), pnpm, Node 22.

## Decisioni aperte (PRD §13)

Dominio email outreach (sottodominio vs separato), provider screenshot (Browserless vs Cloudflare),
Plausible vs Umami, sorgenti scraping extra, categoria/città primo test, modello AI default (Haiku vs Sonnet).
