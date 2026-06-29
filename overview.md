# overview.md — mappa del codice Nodomatic

> Documento di **orientamento all'architettura del codice** per chi (umano o agente AI)
> apre il progetto. Complementare a `CLAUDE.md` (regole/gotcha/stato), `docs/PRD.md`
> (spec di prodotto) e `docs/ROADMAP.md` (piano). Qui si descrive **com'è fatto il codice**.

---

## 1. Cos'è il progetto

Nodomatic è l'ecosistema di automazioni **interne** dell'agency RT Studio: un **modular monolith** Next.js che ospita un sito vetrina pubblico + un'app interna con due moduli di dominio — **Prospector** (funnel lead: trova → analizza → personalizza con AI → contatta → follow-up → CRM) e **Reporting** (analytics marketing dei clienti GA4/Meta/Google Ads → report condivisibili).

---

## 2. Stack tecnologico

Versioni **reali** (da `package.json` + `pnpm-lock.yaml`):

| Tecnologia | Versione | Note |
|---|---|---|
| **Next.js** | **15.5.19** (App Router) | range `^15.5.0` pinnato a 15; `next.config.ts` minimale (solo `images.remotePatterns`) |
| **React / React DOM** | **19.2.7** | range `^19.0.0`; Server Components di default |
| **TypeScript** | 5.9.3 | `strict: true`, `moduleResolution: bundler`, alias `@/* → src/*` |
| **Tailwind CSS** | **4.3.1** | range `^4`; **niente `tailwind.config`** — config in CSS via `@theme inline` in `globals.css`; plugin PostCSS `@tailwindcss/postcss` |
| **Drizzle ORM** | 0.45.2 | schema in `src/lib/db/schema.ts`; driver **Neon HTTP** (`drizzle-orm/neon-http`) |
| **drizzle-kit** | 0.31.10 | CLI migrazioni (`pnpm db:*`), config `drizzle.config.ts` |
| **Neon serverless** | 1.1.0 | Postgres serverless (`@neondatabase/serverless`) |
| **BetterAuth** | 1.6.20 | auth email+password con ruoli; adapter Drizzle; plugin `nextCookies` |
| **Inngest** | 4.7.0 | background jobs / cron durevoli; client `id: "nodomatic"`, servito da `/api/inngest` |
| **Zod** | 4.4.3 | validazione di **tutte** le mutation (server actions + webhook) |
| **@anthropic-ai/sdk** | 0.105.0 | generazione contenuti AI (copy landing, email, narrativa report) |
| **Resend** | 6.14.0 | email outreach; webhook firmato via **svix** 1.96.0 |
| **@react-pdf/renderer** | 4.5.1 | PDF dei report (`/r/[slug]/pdf`) |
| **recharts** | 3.8.1 | grafici metriche (`metrics-chart.tsx`) |
| **@aws-sdk/client-s3** | 3.x | upload screenshot/PDF su **Cloudflare R2** (S3-compatible) |
| **@google-analytics/data** | 6.1.0 | GA4 Data API (modulo reporting) |
| **lucide-react** | 1.21.0 | icone (sito vetrina) |
| **geist** | 1.7.2 | font brand (Geist Sans) |
| **UI** | shadcn/ui "new-york" + CVA + `tailwind-merge`/`clsx` | componenti in `src/components/ui`, util `cn()` in `src/lib/utils` |
| **Test** | Vitest 4.1.9 | `vitest.config.ts`; test co-locati (`scoring.test.ts`) |
| **Runtime** | Node **22.x** (`engines`) | pnpm; deploy su Vercel (`main` = produzione) |

> ### ⚠️ Gotcha importanti
> - **Build-green obbligatorio**: l'app **deve compilare e deployare senza segreti**. Nessun `throw` a import/build-time per env mancanti. Regole:
>   - usa `requireEnv(name)` (`src/lib/env.ts`) **dentro le funzioni**, mai all'import;
>   - `src/lib/db/index.ts` e `src/lib/auth.ts` usano **placeholder** → nessuna connessione all'import;
>   - le integrazioni esterne (`src/modules/*/integrations/*`) sono **stub** che lanciano `NotImplementedError`/`requireEnv` solo se chiamate (sempre dentro Inngest, mai in request handler sincroni);
>   - pagine che leggono il DB → `export const dynamic = "force-dynamic"` + guardia `isDbConfigured` (mostrano un avviso di setup invece di andare in errore).
>   - Verifica sempre: `pnpm typecheck && pnpm lint && pnpm build` verdi **senza** `.env.local`.
> - **Tailwind 4**: configurazione **in CSS** (`@import "tailwindcss"` + `@theme inline`), non in JS. Non cercare `tailwind.config.{js,ts}`: non esiste. I colori sono variabili CSS in OKLCH.
> - **Tema vetrina scoped**: il tema metallico dark del sito è **scoped sotto la classe `.site`** in `globals.css` (utility `bg-site-*`, `text-metal-*`…). Non tocca la dashboard (neutral/light). Tema chiaro del sito: rinviato.
> - **Neon + Node 20**: `pnpm db:migrate` (drizzle-kit) usa il driver **websocket**, che su Node 20 fallisce. Applicare le migrazioni con il **migrator HTTP** o usare **Node 22**. A runtime l'app usa già il driver **HTTP** (nessun problema).
> - **Vincoli di prodotto (PRD §1.5)**: uso **interno, NON SaaS** → niente multi-tenancy/billing/onboarding. Basso volume (50-100/giorno), budget ~€10-25/mese, anti-over-engineering. Non introdurre code/cache/microservizi oltre Inngest.
> - **Copy sito vetrina**: niente em-dash ("—") in testo/metadata (usare virgole/punti; `·` ammesso).

---

## 3. Struttura della codebase

160 file tracciati. Albero commentato (saltati `node_modules`/`.next`):

```
Nodomatic/
├── CLAUDE.md                    # memoria sempre caricata: regole, stato, gotcha (LEGGERE per primo)
├── docs/
│   ├── PRD.md                   # spec di prodotto (cosa/perché) — fonte di verità feature
│   ├── ROADMAP.md               # piano operativo + storico sintetico (stato ✅/🔜/⏸️)
│   ├── HISTORY.md               # archivio narrativo dettagliato sessione-per-sessione
│   └── SETUP-LOCAL.md           # setup locale passo-passo (env, DB, seed)
├── .env.example                 # tutte le env var (2 livelli: login/dashboard vs funnel completo)
├── drizzle.config.ts            # config CLI migrazioni (solo pnpm db:*)
├── next.config.ts               # config Next (images.remotePatterns per R2)
├── components.json              # shadcn/ui (style new-york, alias)
├── postcss.config.mjs           # plugin Tailwind 4
├── vitest.config.ts             # config test
│
└── src/
    ├── app/                     # === ROUTING (App Router) ===
    │   ├── layout.tsx           #   root layout: <html lang="it">, font Geist, metadata base
    │   ├── globals.css          #   Tailwind 4 + token OKLCH (dashboard) + tema .site (vetrina)
    │   ├── sitemap.ts           #   /sitemap.xml (pubbliche + hub + 48 soluzioni)
    │   ├── login/page.tsx       #   pagina login (BetterAuth)
    │   │
    │   ├── (site)/              #   --- SITO VETRINA pubblico (tema .site) ---
    │   │   ├── layout.tsx       #     Navbar + Footer, classe .site
    │   │   ├── page.tsx         #     Home
    │   │   ├── chi-siamo/ contatti/
    │   │   ├── servizi/[servizio]/   # hub servizio (4)
    │   │   ├── settori/[settore]/    # hub settore (12)
    │   │   ├── [slug]/page.tsx       # soluzione servizio×settore (48 pagine SSG, SEO-only)
    │   │   └── sitemap/page.tsx      # sitemap HTML navigabile
    │   │
    │   ├── (dashboard)/         #   --- APP INTERNA (auth gate, tema neutral) ---
    │   │   ├── layout.tsx       #     shell + auth gate (redirect /login o avviso setup)
    │   │   ├── dashboard/       #     KPI/overview
    │   │   ├── campaigns/       #     lista + [id] (prospect, export CSV, outreach, form manuale)
    │   │   ├── clients/         #     lista + [id] (connessioni analytics, genera report, refresh)
    │   │   ├── prospects/[id]/  #     dettaglio prospect (interazioni, toggle monitoraggio)
    │   │   └── team/            #     gestione utenti/ruoli (solo admin)
    │   │
    │   ├── p/[slug]/            #   --- LANDING PROSPECT pubblica (outreach) + tracker visite ---
    │   ├── r/[slug]/            #   --- REPORT CLIENTE condivisibile (view + /csv + /pdf, react-pdf) ---
    │   │
    │   └── api/                 #   === ROUTE HANDLERS (webhook/endpoint, non server actions) ===
    │       ├── auth/[...all]/   #     BetterAuth (tutti gli endpoint /api/auth/*)
    │       ├── inngest/         #     serve le functions di tutti i moduli
    │       ├── track/visit/     #     beacon visite landing (IP hashato, Zod)
    │       └── webhooks/resend/ #     eventi email Resend (firma svix) → email_events
    │
    ├── components/
    │   ├── ui/                  #   primitivi shadcn (button, card, table, badge, input, label)
    │   ├── site/                #   componenti vetrina (navbar, mega-menu, mobile-menu, hero, footer…)
    │   ├── metrics-chart.tsx    #   grafico recharts (report)
    │   ├── status-select.tsx    #   select stato prospect (CRM)
    │   └── logout-button.tsx
    │
    ├── content/                 # === CONTENUTI STATICI sito vetrina ===
    │   ├── site.ts              #   nav, hero, settori (12), process, footer…
    │   └── solutions.ts         #   4 servizi × 12 settori → allSolutions() (48 pagine)
    │
    ├── lib/                     # === FONDAMENTA CONDIVISE (cross-modulo) ===
    │   ├── env.ts               #   accesso env + requireEnv() + isDbConfigured (build-green)
    │   ├── db/
    │   │   ├── index.ts         #   client Drizzle su Neon HTTP (placeholder se no DATABASE_URL)
    │   │   ├── schema.ts        #   schema completo (auth + prospector + reporting + clients)
    │   │   ├── seed.ts          #   seed primo admin (pnpm db:seed)
    │   │   └── migrations/      #   SQL versionate 0000–0002 + meta/ (snapshot drizzle)
    │   ├── auth.ts              #   istanze BetterAuth (auth + authAdmin), ruolo applicativo
    │   ├── auth-client.ts       #   client BetterAuth (browser): signIn/signOut/useSession
    │   ├── auth-guards.ts       #   getCurrentUser / requireUser (server, redirect /login)
    │   ├── inngest.ts           #   client Inngest condiviso (id "nodomatic")
    │   ├── hash.ts              #   hashIp() per privacy/GDPR landing
    │   ├── slug.ts              #   generazione slug (client-safe)
    │   ├── utils.ts             #   cn() (clsx + tailwind-merge)
    │   └── actions/contact.ts   #   server action form contatti (sito vetrina)
    │
    └── modules/                 # === DOMINIO (un modulo = una cartella) ===
        ├── prospector/          #   --- Modulo 1: funnel lead ---
        │   ├── scoring.ts       #     scoring 1-10 PURO e testabile (+ scoring.test.ts)
        │   ├── actions/         #     server actions: campaigns, prospects, interactions, outreach, users
        │   ├── data/            #     query Drizzle: prospects, campaigns, reports, emailEvents,
        │   │                     #       followups, interactions, monitoring, visits, analytics, users
        │   ├── inngest/         #     client.ts + functions.ts (scrape→audit→AI→outreach→follow-up→monitor)
        │   └── integrations/    #     apify, apollo, pagespeed, screenshot, techdetect, ai, resend, r2
        │                         #       (stub deploy-ready; index.ts = NotImplementedError)
        │
        └── reporting/           #   --- Modulo 2: analytics clienti ---
            ├── report-service.ts#     aggrega metriche + narrativa AI → rep_reports (riuso action+cron)
            ├── actions/         #     clients, connections, refresh, reports
            ├── data/            #     clients, connections, metrics, reports
            ├── inngest/         #     refreshConnection, dailyRefresh, generateReport, monthlyReports
            └── integrations/    #     ga4, meta-ads, google-ads, meta-organic, ai (+ index = tipi DailyMetric)
```

---

## 4. Cosa fa ogni file chiave

**Bootstrap & config**
- `src/app/layout.tsx` — root layout: `<html lang="it">`, font **Geist Sans** (`GeistSans.variable`), metadata base (`metadataBase`, title template `%s · Nodomatic`).
- `src/app/globals.css` — Tailwind 4: `@import "tailwindcss"`, token OKLCH (`:root`/`.dark`) per la dashboard, blocco `.site` con la palette **metallica** del sito vetrina, `@theme inline` che espone tutte le variabili come utility colore.
- `next.config.ts` — solo `images.remotePatterns` (da popolare con l'host pubblico R2 quando configurato).
- `drizzle.config.ts` — schema/out/dialect per la CLI migrazioni; legge `DATABASE_URL` da `.env`.

**Fondamenta condivise (`src/lib`)**
- `env.ts` — `optional()`/`requireEnv()` (runtime-only) + `isDbConfigured`. Cuore della strategia **build-green**.
- `db/index.ts` — client Drizzle su **Neon HTTP**; usa una connection string **placeholder** se `DATABASE_URL` manca → nessuna connessione all'import.
- `db/schema.ts` — **schema unico** del monolite: enum (role, campaign/prospect status, email event, ecc.), tabelle auth BetterAuth (id `text`), tabelle dominio (id `uuid`), entità condivisa `clients`, tabelle `rep_*` del reporting. Esporta i tipi inferiti.
- `auth.ts` — `auth` (con `nextCookies`, usata da route/guard) e `authAdmin` (senza cookies, per creare utenti da invito senza loggare l'admin). Campo `role` (admin|sales|viewer) non impostabile in signup.
- `auth-guards.ts` — `getCurrentUser()` / `requireUser()` (server), usate da layout dashboard e server actions.
- `inngest.ts` — il **client Inngest condiviso**; tutti i moduli registrano le function qui.
- `hash.ts` — `hashIp()` (SHA-256 + `IP_HASH_SALT`) per le visite landing (GDPR).

**Routing / wiring API**
- `app/api/auth/[...all]/route.ts` — `toNextJsHandler(auth)` → tutti gli endpoint auth.
- `app/api/inngest/route.ts` — `serve()` con `[...prospectorFunctions, ...reportingFunctions]`: **un solo endpoint** per tutti i job.
- `app/api/webhooks/resend/route.ts` — verifica firma **svix**, mappa l'evento Resend → `email_events`, fa avanzare lo stato del prospect (`opened`/`clicked`), correla via `resendId`.
- `app/api/track/visit/route.ts` — beacon JSON dalla landing: Zod, IP hashato, `landing_visits`.
- `app/sitemap.ts` — genera `/sitemap.xml` includendo le 48 soluzioni (SEO-only).

**Moduli di dominio**
- `modules/prospector/scoring.ts` — funzione **pura** `computeProspectScore()` (1-10), `isQualified()`, `NO_WEBSITE_SCORE`. Unico file con unit test.
- `modules/prospector/inngest/functions.ts` — l'orchestrazione del funnel (vedi §5).
- `modules/prospector/actions/*.ts` — server actions (`"use server"`): validano con Zod, controllano il ruolo, scrivono via `data/`, emettono eventi Inngest, `revalidatePath`.
- `modules/prospector/data/*.ts` — query Drizzle isolate (un file per aggregato), runtime-only.
- `modules/prospector/integrations/*.ts` — adattatori verso i servizi esterni; stub deploy-ready.
- `modules/reporting/report-service.ts` — `buildReportData()` + `compileAndStoreReport()`: aggrega metriche per provider in un periodo, genera narrativa AI, scrive `rep_reports`.
- `modules/reporting/inngest/functions.ts` — pull metriche (on-demand + cron giornaliero) e generazione report (on-demand + cron mensile).

---

## 5. Come funziona il tutto

### Rendering / dati
- **Next.js App Router** con **3 route group**: `(site)` (vetrina pubblica), `(dashboard)` (app interna), più le rotte pubbliche `p/[slug]` (landing) e `r/[slug]` (report).
- **Server Components di default.** Le pagine che leggono il DB sono `force-dynamic` + guardia `isDbConfigured`. Le 48 soluzioni vetrina sono invece **SSG** (`generateStaticParams` + `dynamicParams = false` → combinazioni non generate ⇒ 404).
- **Mutation = Server Actions** (`"use server"` in `modules/*/actions` e `lib/actions`): Zod su ogni input, check ruolo, scrittura via `data/`, eventuale `inngest.send(...)`, `revalidatePath`.
- **Integrazioni esterne / lavoro pesante = Inngest functions** (mai in request handler sincroni). I **webhook** esterni (Resend) e i beacon (track/visit) sono invece **Route Handlers** in `app/api`.

### Auth
- **BetterAuth** email+password, sessioni su tabelle Drizzle. Browser: `auth-client.ts` (`signIn`/`useSession`). Server: `auth-guards.ts` (`requireUser`).
- **Ruoli** `admin | sales | viewer` (campo `role` su `user`, default `sales`, non impostabile in signup). Es.: solo `admin` lancia campagne (`createCampaignAction`) e vede il link **Team**.
- Il **layout dashboard** fa da gate: senza DB → avviso di setup; senza sessione → redirect `/login`.
- `authAdmin` (senza `nextCookies`) serve a creare utenti da invito **senza** sovrascrivere la sessione dell'admin.

### Styling / font
- **Tailwind 4** configurato in CSS (`globals.css`). Due "mondi" visivi nello stesso file: **dashboard** (token neutral/light in OKLCH) e **sito vetrina** (palette **metallica dark** scoped sotto `.site`, utility `bg-site-*`/`text-metal-*`). Font brand **Geist Sans** via variabile CSS.
- Primitivi **shadcn/ui** (style "new-york") in `components/ui`; `cn()` per comporre le classi.

### Integrazioni esterne (per modulo)
- **Prospector**: **Apify** (scraping Google Maps), **Apollo** (arricchimento email, opzionale/throttle), **PageSpeed Insights** (audit performance/SEO), **screenshot** (Browserless/Cloudflare), **techdetect** (stack + flag obsoleto), **Anthropic Claude** (copy landing + email), **Resend** (invio + webhook svix), **Cloudflare R2** (screenshot, via S3 SDK).
- **Reporting**: **GA4 Data API**, **Meta Marketing API** (ads), **Google Ads** (MCC + OAuth refresh), **Meta organico** (IG/FB insights), **Claude** (narrativa report), **R2** (PDF). Metriche normalizzate in `DailyMetric` → `rep_metrics_daily`.
- Tutte sono **stub** finché non si aggiungono le chiavi (build-green); l'app builda e si naviga senza.

### Job / cron (Inngest)
**Funnel Prospector** (event-driven, durevole, idempotente):
```
campaign.scrape.requested
   → scrapeCampaign  (Apify → insert prospects → enqueue audit [+ enrich se Apollo])
prospect.audit.requested
   → auditProspect   (no sito = score fisso; altrimenti PageSpeed + techdetect + screenshot→R2 + scoring)
   → se qualificato: prospect.content.requested
prospect.content.requested
   → generateContent (Claude → report: analisi, copy landing, subject+body email)
prospect.outreach.requested
   → outreachSequence (T+0 email iniziale → T+3/+5/+7 follow-up CONDIZIONALI su open/click
                        → "cold" se nessuna risposta; throttle warmup 50/giorno)
cron lun 07:00 Rome → monitorSites (ri-audit dei siti monitored; alert su calo perf ≥15 → nota + email interna)
```
Stato prospect avanzato dal webhook Resend (`opened`/`clicked`) e dalla sequenza. Stati di chiusura (`replied`/`meeting`/`won`/`lost`) **fermano** la sequenza.

**Reporting**:
```
connection.refresh.requested → refreshConnection (pull 30gg dal provider giusto → rep_metrics_daily)
cron 06:00 Rome              → dailyRefresh    (enqueue refresh di tutte le connessioni attive)
report.generate.requested    → generateReport  (compileAndStoreReport → rep_reports + slug pubblico /r/[slug])
cron 1° del mese 07:00 Rome  → monthlyReports  (report del mese precedente per ogni cliente con connessioni)
```

---

## 6. Come è connesso (mappa ASCII)

```
                         Browser
        ┌───────────────────┼───────────────────────────┐
        │ pubblico          │ interno (auth)             │ pubblico (link diretti)
        ▼                   ▼                            ▼
   (site)/*  ──SSG/SSR   (dashboard)/*  ──gate──►   p/[slug]      r/[slug] (+ /csv /pdf)
   content/site.ts        auth-guards ◄── lib/auth   landing-tracker   report-view / report-pdf
   content/solutions.ts        │                         │                │
        │                      │ Server Actions          │ POST beacon    │
        │                      ▼                          ▼                │
        │            modules/<mod>/actions ──Zod──► data/ (Drizzle)        │
        │                      │  │                       │                │
        │                      │  └── inngest.send() ──► EVENTI            │
        │                      ▼                          │                │
        └──── lib/actions/contact          api/track/visit│                │
                                                          ▼                ▼
                                              lib/db (Neon HTTP) ◄──── data/ (reporting)
                                                          ▲
   EVENTI ──► /api/inngest ──► functions[]  ── prospector + reporting ──┘
   (cron + event)                  │  └── data/ (read/write)
                                   └── integrations/* (Apify, PageSpeed, Apollo, Claude,
                                       Resend, R2, GA4, Meta, Google Ads)
                                          ▲
   Resend (email) ──webhook svix──► /api/webhooks/resend ──► data/emailEvents + stato prospect
   BetterAuth ──────────────────► /api/auth/[...all]
```

Regola di confine (PRD §16): un modulo **non** importa il dominio di un altro; comunicano via **eventi Inngest** ed entità condivise (`clients`). Le fondamenta stanno in `src/lib` e `src/components`.

---

## 7. Comandi utili + come estendere

### Comandi (`package.json`)
```bash
pnpm dev            # dev server (Next)
pnpm build          # build di produzione (deve passare SENZA segreti)
pnpm typecheck      # tsc --noEmit
pnpm lint           # next lint (eslint 9)
pnpm test           # vitest run        (pnpm test:watch per il watch)

pnpm db:generate    # genera una migration dallo schema (drizzle-kit)
pnpm db:migrate     # applica le migration  (⚠️ usa websocket → Node 22, non 20)
pnpm db:push        # push diretto schema→DB (dev)
pnpm db:studio      # Drizzle Studio
pnpm db:seed        # crea il primo admin (SEED_ADMIN_EMAIL/PASSWORD/NAME)
```
Per Inngest in locale: `npx inngest-cli@latest dev` (nessuna chiave necessaria).

### Come estendere
- **Nuova pagina vetrina**: aggiungi una rotta in `src/app/(site)/`, attingi ai contenuti da `src/content/site.ts` / `solutions.ts`, usa i componenti `src/components/site/*`, aggiorna `src/app/sitemap.ts` se è indicizzabile. Niente em-dash nel copy.
- **Nuova pagina dashboard**: rotta in `src/app/(dashboard)/`; il layout fa già da auth gate. Per leggere il DB: `export const dynamic = "force-dynamic"` e leggi via `modules/<mod>/data`.
- **Nuova mutation**: server action in `modules/<mod>/actions` con **Zod** + check ruolo; scrivi via `data/`; per lavoro pesante **emetti un evento Inngest**, non eseguirlo inline; `revalidatePath`.
- **Nuovo job/cron**: aggiungi una `inngest.createFunction(...)` in `modules/<mod>/inngest/functions.ts` e includila nell'array `functions` (è già servita da `/api/inngest`).
- **Nuova integrazione esterna**: file in `modules/<mod>/integrations/` con firma tipizzata; leggi le chiavi con `requireEnv()` **a runtime**; chiama solo da Inngest. Niente lancio a import-time (build-green).
- **Modifica schema DB**: edita `src/lib/db/schema.ts` → `pnpm db:generate` → committa l'SQL in `src/lib/db/migrations/` → annota `db:migrate` tra le azioni manuali (single DB, vedi `CLAUDE.md`).
- **Nuovo modulo Nodomatic**: nuova cartella `src/modules/<modulo>` (actions/data/inngest/integrations) che riusa le fondamenta; tabelle nello schema unico con prefisso chiaro; comunicazione cross-modulo solo via eventi/entità condivise.

### Cosa leggere prima
`CLAUDE.md` (regole vincolanti, stato live, gotcha) → `docs/ROADMAP.md` (piano + stato) → `docs/PRD.md` (cosa/perché) → `docs/HISTORY.md` (dettaglio narrativo, su richiesta) → `docs/SETUP-LOCAL.md` (per far girare l'app in locale).

---

> I file sorgente contengono **commenti esplicativi** (specie `schema.ts`, le Inngest functions, le route API e `env.ts`): leggi i commenti nel codice per il dettaglio.
