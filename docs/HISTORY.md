# HISTORY — cronologia di sviluppo

Archivio narrativo dettagliato di cosa è stato fatto, file/aree toccati e decisioni prese.
**Si legge su richiesta**, non viene caricato in ogni sessione (per quello c'è `CLAUDE.md`).
Per il piano e lo stato sintetico vedi [`ROADMAP.md`](ROADMAP.md); per la spec di prodotto
vedi [`PRD.md`](PRD.md).

Convenzione: voce più recente **in cima**, sotto `## Cosa è stato fatto`, come blocco
`### Sessione AAAA-MM-GG — Titolo`.

## Cosa è stato fatto

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
