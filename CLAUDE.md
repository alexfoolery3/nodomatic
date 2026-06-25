# CLAUDE.md — guida per le sessioni di sviluppo

Leggi questo file e [`docs/ROADMAP.md`](docs/ROADMAP.md) all'inizio di ogni sessione.

**Trittico di memoria** (ruoli distinti, niente doppioni):
- **CLAUDE.md** (questo) = memoria *sempre caricata*, snella: regole, promemoria critici, comandi.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) = *fonte unica del piano* operativo + storico sintetico (stato ✅/🔜/⏸️).
- [`docs/HISTORY.md`](docs/HISTORY.md) = archivio narrativo dettagliato (si legge su richiesta).
- [`docs/PRD.md`](docs/PRD.md) = spec di prodotto (cosa/perché).

## Cos'è il progetto

Nodomatic = ecosistema di automazioni **interne** di RT Studio. Primo modulo: **Prospector**
(funnel: trova → analizza → personalizza con AI → contatta → follow-up → CRM). Vedi PRD §3.

## Promemoria critici

**Stato live** *(2026-06-25)*: DB **Neon** collegato via integrazione Vercel; migrazioni `0000`–`0002`
**applicate**; **admin seedato**; env auth su Vercel prod → **login admin live** su `nodomatic.vercel.app`.
Progetto Vercel `rt-studio/nodomatic` creato, repo GitHub collegato (**push = deploy**, `main` = prod).
*Nota Node 20*: `pnpm db:migrate` (drizzle-kit) usa il driver **websocket** che su Node 20 fallisce →
applicare le migrazioni col **migrator HTTP** (`drizzle-orm/neon-http/migrator`) o usare Node 22.

**Azioni manuali ancora in sospeso:**
- Chiavi funnel su Vercel (Apify, PageSpeed, Anthropic, Resend+webhook, R2, Inngest sync) — le inserisce l'utente.
- Dominio `nodomatic.com` (vetrina) + sottodominio `app.nodomatic.com` (app interna).

**Checklist go-live `.com`** (dettaglio in `docs/ROADMAP.md` → area H): DB Neon → env var su Vercel
(`DATABASE_URL`, `BETTER_AUTH_SECRET/URL`, `NEXT_PUBLIC_APP_URL`, `IP_HASH_SALT`, poi le chiavi in
`.env.example`) → `pnpm db:migrate` → `pnpm db:seed` (primo admin) → Inngest sync su `/api/inngest`
→ Resend webhook su `/api/webhooks/resend` → dominio `nodomatic.com`.

**Gotcha DB/build**: l'app deve buildare **senza segreti** (vedi "Convenzioni build-green"); le pagine
che leggono il DB usano `export const dynamic = "force-dynamic"` + guardia `isDbConfigured`.

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
- A fine sessione / prima di pushare: esegui il **Rituale pre-merge** (skill `/pre-merge`) →
  aggiorna `docs/ROADMAP.md` (stato) e `docs/HISTORY.md` (narrativa).
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
- Landing prospect: `app/p/[slug]/page.tsx`. **Sito vetrina (pubblico): `src/app/(site)/`** (route group,
  tema `.site` scoped in `globals.css`; componenti `src/components/site/`, contenuti `src/content/site.ts`,
  action form `src/lib/actions/contact.ts`). Dashboard: `app/(dashboard)`.

## Decisioni prese

- **nodomatic.com = sito vetrina agency** (automazione/marketing/ads); l'app interna (Prospector) →
  **app.nodomatic.com** (sottodominio, nascosta al pubblico).
- Brand: tema **metallico** (grigio/nero/bianco/acciaio), font **Geist**, logo monogramma "N" a nodi.
  Sistema di brand in Figma: file *Nodomatic — Brand System* (team RT Studio).
- Dominio: **nodomatic.com**. Sottodomini per moduli/funzioni in seguito.
- Next.js **15** (pinned), pnpm, Node 22.

## Decisioni aperte (PRD §13)

Dominio email outreach (sottodominio vs separato), provider screenshot (Browserless vs Cloudflare),
Plausible vs Umami, sorgenti scraping extra, categoria/città primo test, modello AI default (Haiku vs Sonnet).

## Rituale pre-merge (skill `/pre-merge`)

Prima di pushare il branch di sessione o aprire/mergiare una PR (un hook lo ricorda su `git push`):
1. `docs/HISTORY.md` → blocco `### Sessione AAAA-MM-GG — Titolo` in cima.
2. `docs/ROADMAP.md` → riga in "Storico" + stato area (✅/🔜/⏸️) aggiornato.
3. `CLAUDE.md` → solo se cambiano regole/gotcha/stato o "Azioni manuali in sospeso".
4. Migration Drizzle → se schema cambiato: `pnpm db:generate`, committa l'SQL, annota `db:migrate`
   in "Azioni manuali in sospeso".
5. `pnpm typecheck && pnpm lint && pnpm build` verdi → commit **Conventional Commits** → push →
   PR → merge **solo con OK** utente.
6. **Atterraggio su `main`** (così nuove sessioni e Vercel partono dal codice reale, non da un branch
   orfano): PR del branch di sessione → `main`, mergiata **con OK** tuo e **solo se l'incremento è
   completo e spedibile**. ⚠️ `main` = deploy in **produzione** su Vercel: non promuovere build verdi
   ma incomplete. FF-merge diretto su `main` solo per recuperi una-tantum.

## Comandi

- Dev/qualità: `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`.
- DB (Drizzle/Neon): `pnpm db:generate` (migration), `pnpm db:migrate` (applica), `pnpm db:push`,
  `pnpm db:studio`, `pnpm db:seed` (primo admin via `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`).
- Push: `git push -u origin <branch-di-sessione>` (retry con backoff in caso di errori di rete).
