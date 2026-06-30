# HISTORY — cronologia di sviluppo

Archivio narrativo dettagliato di cosa è stato fatto, file/aree toccati e decisioni prese.
**Si legge su richiesta**, non viene caricato in ogni sessione (per quello c'è `CLAUDE.md`).
Per il piano e lo stato sintetico vedi [`ROADMAP.md`](ROADMAP.md); per la spec di prodotto
vedi [`PRD.md`](PRD.md).

Convenzione: voce più recente **in cima**, sotto `## Cosa è stato fatto`, come blocco
`### Sessione AAAA-MM-GG — Titolo`.

## Cosa è stato fatto

### Sessione 2026-06-30 — Fix login prod + Inngest + Prospector dashboard Fase 1
- **Fix login "Invalid origin"** (PR #10): in prod `BETTER_AUTH_URL`/`BETTER_AUTH_SECRET` erano **vuote** → il
  `baseURL` di better-auth non combaciava con l'`Origin` di `www.nodomatic.com`. Risolto impostando le env prod
  (URL = `https://www.nodomatic.com`, **SECRET** rigenerato come *sensitive*) + aggiunti `trustedOrigins` espliciti
  (apex+www+localhost) in [`src/lib/auth.ts`](../src/lib/auth.ts). Verifica via endpoint: origin valido → 401
  credenziali, origin finto → 403; login admin reale → **200**. Login prod live.
- **Campagne senza crash** + **Inngest operativo**: l'avvio campagna lanciava un'eccezione full-page perché
  `inngest.send` in prod richiede `INNGEST_EVENT_KEY` (mancante). Aggiunto try/catch in
  [`actions/campaigns.ts`](../src/modules/prospector/actions/campaigns.ts) (campagna creata ma riportata a `draft`
  con messaggio, niente crash). L'utente ha poi inserito **INNGEST_EVENT_KEY/SIGNING_KEY** (sensitive) + deploy →
  scraping operativo. Apify già configurato.
- **Prospector dashboard — Fase 1** (piano approvato in `~/.claude/plans/`):
  - **1A Limite scrape configurabile**: nuova colonna `campaigns.scrapeLimit` (default 50, migrazione
    `0003_uneven_mad_thinker.sql`); form `<select>` 25/50/100; Zod `min10/max150`; `scrapeCampaign` passa il limite a
    `scrapeGoogleMaps` (prima fisso a 50).
  - **1B Menu laterale**: navbar → **sidebar** verticale (`layout.tsx` + nuovo client `sidebar-nav.tsx` con
    `usePathname` per lo stato attivo, icone lucide).
  - **1C Archivia/elimina campagne**: `deleteCampaign` (cascade) + archive/unarchive (riusa stato `archived` già in
    enum); action con guardia admin; UI `campaign-actions.tsx` (confirm a due passi per delete) in lista+dettaglio;
    toggle "Mostra archiviate".
  - **1D Suggerimenti**: `<datalist>` nativo su Categoria (riusa `SECTORS`) e Città (nuovo `src/content/cities.ts`);
    testo libero ammesso.
  - **1E Chiarezza**: stato attivo nav, empty-state lista campagne, testo guida sul form + caveat `countryCode="it"`.
  - **Fase 2 (roadmap, non costruita)**: visione **radar multi-canale** (sito/ads/social/GBP/processi → servizio da
    vendere); 15 funzioni per uso giornaliero (vista "Oggi", scorecard, score multi-canale, pitch AI per-servizio,
    Meta Ad Library, scoperta social dal sito, ecc.). Ricerca su 13+ tool competitor. Dettaglio nel file di piano.
- **Post-merge — scraping non partiva**: campagne ferme in `scraping` con 0 prospect. Causa: **app Inngest mai
  sincronizzata** (gli eventi venivano accettati ma nessuna funzione girava). Risolto con `PUT /api/inngest`
  (`{"modified":true}`). Aggiunto il gotcha in CLAUDE.md + raccomandata l'integrazione Inngest↔Vercel per l'auto-sync.
  Aggiunto **indicatore di lavorazione + auto-refresh** sulla pagina campagna (`campaign-progress.tsx`): mentre lo stato
  è `scraping`/`auditing` ricarica ogni 4s così i prospect/score compaiono man mano (tetto 3 min anti-loop).
- **Pulsante "Riavvia scraping"** (`restart-scrape-button.tsx` + `restartScrapeAction`): ri-invia l'evento Inngest per
  una campagna bloccata. Mostrato solo a **0 prospect** (lo scraping non deduplica → niente duplicati). Risolve i casi
  come le campagne ferme pre-sync senza doverle ricreare.

### Sessione 2026-06-29 — Go-live dominio nodomatic.com + setup email/SEO
- **Dominio LIVE**: `nodomatic.com` puntato su **Vercel** (nameserver Vercel, DNS gestito da Vercel; apex→www 308,
  HTTPS con certificato auto). La **vetrina è pubblica e online**. Diagnosi via `dig` (il dominio era ancora sui
  nameserver di parcheggio Hostinger `dns-parking.com`, poi propagato a `ns1/ns2.vercel-dns.com`). Chiarita la
  differenza tra **transfer del registrar** (lento, ciò che l'utente ha pagato) e **far puntare il sito** (cambio NS).
- **SEO/metadata** (PR #7): `metadataBase` → `https://www.nodomatic.com`, `title` home in `{ absolute }` (niente
  doppione "· Nodomatic"), `sitemap.ts` base → dominio live. **Google Search Console**: aggiunto record TXT
  `google-site-verification` sull'apex via **Vercel CLI** (`vercel dns add`), per la proprietà **Dominio** `nodomatic.com`
  (non www); propagato e verificato su NS Vercel + resolver pubblici.
- **Env Vercel prod**: `NEXT_PUBLIC_APP_URL=https://www.nodomatic.com`, `PAGESPEED_API_KEY` (sensitive); Anthropic+Apify già.
- **Resend**: piano **Pro** acquistato, account connesso. Dominio mittente outreach **`mail.nodomatic.com`** in setup
  (i record DNS unici di Resend, DKIM inclusa, vanno aggiunti sul DNS Vercel: l'utente li genera con "Add Domain", poi
  si inseriscono via `vercel dns add`). **Decisione**: un solo team **RT Studio** su Pro + **un dominio per progetto**
  (i team aggiuntivi costano ~$20/mese; reputazione isolata dai domini distinti).
- **Nota git**: `overview.md` (commit locale dell'utente, mai pushato) è confluito nello squash della PR #7; contenuto
  integro su `main` (`153bd08`). Il `main` locale resta da risincronizzare (`git fetch && git reset --hard origin/main`).

### Sessione 2026-06-25 — Mega menu + sitemap (SEO) nel sito, brand book Figma, pittogramma N
- **Decisione brand**: il pittogramma scelto è la **N a nodi** (concept A). Aggiornati su Figma i loghi
  ed emblema/favicon del brand book con la N reale (stesso path SVG di `logo-mark.tsx`, via
  `createNodeFromSvg`). In codice il logo era già la N.
- **Figma** (file *Nodomatic — Brand System*, pagina "Pages"): creati **mega menu** Servizi (`42:2`) e
  Settori (`42:48`), **footer aggiornato** con tutti i 12 settori (`33:2`), pagina **Sitemap** (`35:2`),
  e nuovo **Brand Book** in 11 sezioni (pagina `36:2`: logo, emblema&favicon, regole, palette, accessibilità,
  tipografia, layout/griglia, iconografia, fotografia, tone of voice, componenti UI). I mega menu sono stati
  **ricostruiti senza icone prima del testo** e con la N reale (fix del problema sul layer `mega-panel`).
- **Code — Mega menu nel sito**: nuovo `src/components/site/mega-menu.tsx` (client): la navbar desktop ha i
  dropdown **Servizi** e **Settori** (pannello full-width sotto la navbar, **niente icone prima del testo**;
  hover + click + Esc + click-esterno + chiusura al cambio rotta). Il pannello è `absolute inset-x-0 top-full`:
  la navbar ha `backdrop-blur` che fa da containing block, quindi copre tutta la larghezza. `navbar.tsx`
  (server) passa i dati (`serviceCards()`, `SECTORS`) al MegaMenu; il MobileMenu resta invariato.
- **Code — Sitemap (SEO)**: nuova pagina HTML **`/sitemap`** (`src/app/(site)/sitemap/page.tsx`): pagine
  principali, 4 servizi, 12 settori, e le **48 soluzioni** raggruppate per servizio (link reali). Nuovo
  **`src/app/sitemap.ts`** → genera **`/sitemap.xml`** (70 URL: pagine + hub + 48 soluzioni; base da
  `NEXT_PUBLIC_APP_URL` con fallback). Aggiunto link "Mappa del sito" nel footer (`FOOTER_COLUMNS`).
- **Code — Soluzioni SEO-only**: le 48 pagine servizio×settore restano **indicizzabili** e ora sono in
  `sitemap.xml` + sitemap HTML, ma fuori dalla navigazione (il mega menu mostra gli hub, non le 48). I link
  contestuali hub→soluzione restano (internal linking SEO-positivo).
- **Mega menu anche su mobile + archivio Figma**: il drawer mobile (`mobile-menu.tsx`) ora ha **Servizi** e
  **Settori** come **sezioni espandibili** (accordion, single-open, lista scrollabile) con le sotto-voci
  (4 servizi / 12 settori + "Tutti…"); Chi siamo/Contatti restano link. `navbar.tsx` passa i dati anche al
  MobileMenu. La vecchia pagina Figma *Brand Board* è stata **archiviata** (rinominata + spostata in fondo),
  superata dal nuovo Brand Book.
- **Verifica**: `typecheck + lint + build` verdi senza segreti (Node 22+) → **78/78** pagine (`/sitemap` +
  `/sitemap.xml`). Preview live: mega menu Servizi/Settori, `/sitemap` (48 link verificati nel DOM),
  `/sitemap.xml` (200, application/xml, 70 URL). Zero errori console.

### Sessione 2026-06-25 — Sito vetrina: hub Servizio/Settore, matrice 4×12, rifinitura mobile (Figma + ultracode)
- **Figma (Fase A)**: disegnati nel file *Nodomatic — Brand System* (pagina "Pages", accanto al mockup Home)
  i due template mancanti **Hub Servizio** (`22:2`) e **Hub Settore** (`24:2`), desktop tema dark, riusando i
  token brand (scala Metal, neutri dark, Geist) come reference visiva prima del codice. Costruiti via Figma MCP
  (`use_figma`, auto-layout); nel file non ci sono componenti pubblicati (frame flat) → stili ricreati a mano.
- **Data layer (B1)**: `src/content/solutions.ts` — `ServiceDetail` esteso con `icon`/`tagline`/`solutionsEyebrow`;
  `SERVICES_DETAIL` popolato con i **4 servizi** (`automazioni`, `ads`, `siti`, `social`), copy IT sobrio senza
  em-dash; nuovi helper `allServices/getService/getSector/solutionsForService/solutionsForSector/serviceCards`
  e `allSolutions()` che ora itera tutti i servizi → **48 soluzioni** (4×12). `src/content/site.ts`: rimossi
  `SERVICES` e type `Service` (fonte unica = `SERVICES_DETAIL`), `NAV_LINKS`/`FOOTER_COLUMNS` ripuntati a
  `/servizi` e `/settori`.
- **Route + mesh IA (B2/B3)**: nuove `src/app/(site)/servizi/[servizio]/page.tsx` (Hub Servizio, SSG 4) e
  `settori/[settore]/page.tsx` (Hub Settore, SSG 12), più gli indici `servizi/page.tsx` e `settori/page.tsx`;
  componente `breadcrumb.tsx`. `[slug]/page.tsx` generalizzato (eyebrow da `service.solutionsEyebrow`, CTA non
  più "automazioni"-specifica) + breadcrumb + cross-link ai due hub. Home: card servizi → `/servizi/[slug]`,
  chip settori → `/settori/[slug]`. Matrice ora **48 pagine** soluzione.
- **Mobile (B4)**: nuovo `mobile-menu.tsx` (hamburger + drawer full-screen, a11y: `aria-expanded/controls`,
  Esc, blocco scroll body, chiusura su cambio rotta) montato in `navbar.tsx`; polish responsive su `stat-band`,
  `service-card`, `cta-band`, `process-step`, `hero` (+ hero `[slug]` e manifesto Home). **Bug trovato e risolto
  in verifica**: il drawer `fixed inset-0` era schiacciato a 72px perché la navbar usa `backdrop-blur`
  (`backdrop-filter` crea un containing block per i discendenti `fixed`) → contenuto della pagina visibile sotto
  il menu. Fix: **drawer portato su `document.body`** con `createPortal`, avvolto in `.site font-sans md:hidden`
  (ripristina token tema/font fuori dal route group). Verificato in preview live a 375px.
- **Esecuzione**: Fase B costruita con **workflow multi-agente (ultracode)** — foundation (data layer +
  breadcrumb) → build-out parallelo con regola "un file = un agent" → verify build-green. 9 agent.
- **Brand copy**: bonificati gli em-dash residui nei metadata (`page.tsx`, root `app/layout.tsx`) → separatore
  `·`. Regola "niente em-dash nel copy" aggiunta a CLAUDE.md (+ memoria sessione).
- **Decisioni**: tema chiaro **rinviato** (l'utente non lo vuole ora) → niente refactor token semantici/toggle;
  slug servizi brevi (`ads/siti/social`); IA a mesh completo (Home→indice→hub→soluzione).
- **Verifica**: `typecheck + lint + build` verdi **senza segreti** (Node 22+; su Node 20 la build è flaky per la
  cache `.next`, usato `/usr/local/bin/node` v25 + `.env.local` spostato e ripristinato) → **76/76** pagine
  statiche. Preview live ok: hub servizio/settore, indici, soluzione nuova `/ads-per-ristoranti-food`, menu mobile.

### Sessione 2026-06-25 — Go-live (DB+admin live), brand system Figma, sito vetrina (Home)
- **Go-live / DB**: DB **Neon** provisionato via **integrazione Vercel** e collegato al progetto Vercel
  `rt-studio/nodomatic` (env `DATABASE_URL` su tutti gli ambienti). Migrazioni `0000`–`0002` **applicate**
  con migrator HTTP `drizzle-orm/neon-http` (aggira il driver websocket di Neon che su Node 20 non gira) e
  **admin seedato** (`alessandropiazza00@gmail.com`). Impostate su Vercel prod `BETTER_AUTH_SECRET/URL`,
  `NEXT_PUBLIC_APP_URL`, `IP_HASH_SALT` + redeploy → **login admin live** su `nodomatic.vercel.app`.
  Progetto Vercel creato e repo GitHub collegato (push = deploy). `.vercelignore` aggiunto (no segreti nel deploy).
- **Brand identity (Figma)**: creato file *Nodomatic — Brand System* (team RT Studio). Direzione
  **metallica** (grigio/nero/bianco/acciaio, font **Geist**), logo **monogramma "N" a nodi** (concept A).
  Brand Board (palette Metal, tipografia, token, regole) + logo come componenti + Home mockup.
- **Decisione architetturale**: `nodomatic.com` = **sito vetrina agency** (automazione/marketing/ads);
  l'app interna (Prospector) → **`app.nodomatic.com`** (sottodominio), nascosta al pubblico.
- **IA sito**: struttura **servizi × mercati** (4 servizi, 12 settori, matrice; template ricorrenti:
  Home, Servizio, Settore, Soluzione servizio×settore, Chi siamo, Contatti).
- **Sito vetrina — Home (codice)**: implementata Home + `/contatti` in Next.js. Route group pubblico
  `src/app/(site)/` con layout (Navbar+Footer) e tema **`.site` scoped** (variabili metalliche in
  `globals.css`, non tocca la dashboard). Font **Geist** via package `geist`. Componenti riusabili
  `src/components/site/*`, contenuti `src/content/site.ts`, server action form `src/lib/actions/contact.ts`
  (Resend-se-configurato / fallback graceful). Rimossa la vecchia landing Prospector (`src/app/page.tsx`).
  H1 sobrio "Tecnologia e marketing, progettati con metodo.", stat band neutre, manifesto "Marketing
  professionale, non solo per le grandi aziende.". Build verde senza segreti; verifica visiva locale ok.
- **Sito vetrina — template soluzione + Chi siamo (codice)**: aggiunto il template ricorrente
  **`/{servizio}-per-{settore}`** (route dinamica `src/app/(site)/[slug]`, `dynamicParams = false` +
  `generateStaticParams` dalla matrice) — prima ondata **Automazioni × 12 settori** = 12 pagine SSG, con
  hero, sfide del settore, soluzioni, processo, "perché", CTA (modellato sulle vecchie `automazioni-per-*`,
  nuovo stile sobrio). Aggiunta pagina **`/chi-siamo`**. Chip settori della Home ora linkati alle pagine
  soluzione; nav/footer ripuliti (Contatti al posto di Risorse, nessun link morto). Contenuti
  `src/content/solutions.ts` (sfide per settore + soluzioni Automazioni). Build verde: 22 pagine static.

### Sessione 2026-06-24 — Template `.env` a due livelli + guida setup locale (A2)
- **Task A2** (handoff → sessione locale, lato Claude): preparato il setup env per far girare l'app
  in locale senza segreti versionati.
- **`.env.example`** ristrutturato in **due livelli** espliciti: LIVELLO 1 = solo login+dashboard
  (`NEXT_PUBLIC_APP_URL`, `DATABASE_URL` `[B1]`, `BETTER_AUTH_*` + `IP_HASH_SALT` `[B2]`,
  `SEED_ADMIN_*` `[B3]`); LIVELLO 2 = funnel completo + reporting (Inngest, Apify, PageSpeed,
  Anthropic, Browserless, Resend, R2, Apollo, chiavi reporting), ogni chiave annotata con quando
  serve. Nessuna variabile rimossa: solo riordino + commenti + riferimenti incrociati `[B1]…[B4]`
  alla ROADMAP. `.env.example` resta l'unico template versionato (`.env.local` gitignored).
- **Nuovo `docs/SETUP-LOCAL.md`**: guida operativa numerata "cosa incollare dove". Passi 1–9 per il
  LIVELLO 1 (`openssl rand -base64 32`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev`), passi 10–19
  per il LIVELLO 2 (con nota che Inngest in locale gira senza chiavi via `npx inngest-cli dev`), più
  promemoria build-green (`typecheck && lint && build` verdi senza segreti).
- **Verifiche**: confermato che gli script `db:migrate`/`db:seed`/`dev`/`build` esistono in
  `package.json` e che le migrazioni `0000`–`0002` sono presenti in `drizzle/`. Modifiche solo a
  docs + `.env.example`: nessun codice sorgente toccato, build verde per costruzione.

### Sessione 2026-06-23 — Backlog evoluzione prodotto + chiarimento n8n
- **Verifica n8n**: confermato che Nodomatic **non usa n8n** (nessuna dipendenza; occorrenza nel
  lock file = falso positivo in un hash). Orchestrazione già in casa con Inngest. n8n nel PRD è solo
  un VPS esterno preesistente di RT Studio (ipotesi hosting Plausible/Umami). Nessun bisogno di introdurlo.
- **ROADMAP**: aggiunta sezione "Evoluzione futura — backlog idee (da valutare ❓)" con 15 aree
  (acquisizione/prospect, gestione clienti/digital marketing, trasversali) + nota n8n. Nuovo stato
  legenda `❓ da valutare / decidere`. Tutte le voci restano da decidere esplicitamente e costruire per fasi.

### Sessione 2026-06-21 — Rituale di sviluppo + preparazione go-live
- **Rituale di sviluppo** introdotto: trittico di memoria `CLAUDE.md` (sempre caricato, snello),
  `docs/ROADMAP.md` (piano + storico sintetico), `docs/HISTORY.md` (questo archivio). Aggiunti
  lo skill `/pre-merge` (`.claude/skills/pre-merge/SKILL.md`) e gli hook (`.claude/settings.json`
  + `.claude/hooks/pre-merge-reminder.sh`): promemoria a SessionStart e su `git push`.
- Adattamento allo stack reale: migrazioni **Drizzle versionate** (non Supabase), applicate con
  `pnpm db:migrate` sul DB Neon live → tracciate in CLAUDE.md "Azioni manuali in sospeso".
- `PRD.md §11` ridotto a puntatore verso `ROADMAP.md` per evitare doppia fonte di verità sullo stato.
- **Prep go-live**: pin `engines.node = 22.x` in `package.json` (commit `7eca253`); build verde
  senza segreti verificata. Deploy Vercel avviato ma in sospeso (il tool MCP `deploy_to_vercel`
  richiede approvazione del permesso; in alternativa collegare il repo a Vercel manualmente).
- **Fix "branch orfano"**: tutto lo sviluppo era accumulato su `claude/nodomatic-project-setup-ztqnw7`
  mentre `main` era fermo all'Initial commit (`e83e13f`) → le nuove sessioni web, nascendo da `main`,
  ripartivano vuote. Risolto allineando `main` con fast-forward a `985d9f4`. Aggiunto al rituale il
  passo "atterraggio su `main`": **principio generico** nello skill `/pre-merge` (il meccanismo
  dipende dal progetto, non assumere "sempre merge su main") + **meccanismo specifico** in CLAUDE.md
  (PR → `main` con OK utente, solo incrementi spedibili, perché `main` = deploy prod su Vercel).

### Sessione 2026-06-20 — Modulo Reporting (Fasi 0-4)
Nuovo modulo `src/modules/reporting`: analisi campagne/canali per cliente, esportabile e
condivisibile. Commit `4227b68` → `a6dae82`.
- **Fase 0** (`4227b68`): entità condivisa `clients` + `repConnections` (provider `ga4`,
  `meta_ads`, `google_ads`, `meta_organic`), `repMetricsDaily`, `repReports` in
  `src/lib/db/schema.ts` (migration `0002`). Client Inngest promosso a fondamenta condivise
  (`src/lib/inngest.ts`, id `nodomatic`) per registrare le function di entrambi i moduli su
  un solo `serve()`.
- **Fase 1 GA4** (`90122f5`): `integrations/ga4.ts` (BetaAnalyticsDataClient, service account
  base64), pull reale + dashboard cliente.
- **Fase 2 Meta Ads** (`687f9a6`): `integrations/meta-ads.ts` (Graph insights, system user token).
- **Fase 3 Google Ads + organico** (`36cd7e7`): `integrations/google-ads.ts` (REST searchStream +
  OAuth refresh, niente dep pesante) e `meta-organic.ts` (page insights).
- **Fase 4 report** (`a6dae82`): `report-service.ts` (aggrega metriche → `ReportData`), narrativa
  AI (`claude-haiku-4-5`, best-effort), pagina pubblica white-label `app/r/[slug]` (recharts,
  robots noindex), export PDF (`@react-pdf/renderer`, server `renderToBuffer`) e CSV.

### Sessione 2026-06-20 — Estensioni Prospector
Migliorie sopra l'MVP. Commit `33f30b2` → `404a9ff`.
- **Inserimento manuale** (`33f30b2`): prospect/clienti non da scraping.
- **Tech detection** (`207e3cf`): scoring più preciso (PRD §6).
- **Apollo** (`0056039`): arricchimento email opzionale.
- **Monitoring continuo** (`c154dc1`): snapshot periodici dei siti + alert (retention clienti).
- **Migliorie leggere** (`404a9ff`): KPI globali, conteggi campagne, notifiche team.

### Sessione 2026-06-20 — Prospector MVP (Fasi 1-4)
Funnel completo trova → analizza → personalizza → contatta → follow-up → CRM. Commit
`4a11efa` → `d11da61`.
- **Fase 1** (`4a11efa`): auth (BetterAuth, ruoli), campagne, scraping (Apify Google Maps),
  audit (PageSpeed), scoring collegato, CRM base. Migrazioni `0000`/`0001`.
- **Fase 2** (`a19ce92`): AI content (Claude) + landing personalizzate `app/p/[slug]`, screenshot
  via PageSpeed → R2, tracking visite (IP hashati).
- **Fase 3** (`c4a0ae8`): outreach Resend, sequenza follow-up condizionale, webhook Resend,
  throttle/warmup.
- **Fase 4** (`d11da61`): scheda prospect, interazioni manuali, gestione team multi-utente,
  analytics per campagna.

### Sessione 2026-06-20 — Fondamenta (Fase 0)
- **Scaffold deploy-ready** (`50a1abb`): Next.js 15 (pinned), Drizzle + Neon, BetterAuth, client
  Inngest, scoring puro/testabile, pattern build-green (`requireEnv` runtime, fallback placeholder,
  stub `NotImplementedError`, `isDbConfigured`), `.env.example`.
- **Initial commit** (`e83e13f`).
