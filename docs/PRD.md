# PRD — Nodomatic Prospector

> **Product Requirements Document**
> Piattaforma di prospecting automatizzato, audit siti web, outreach e CRM
> Brand: **Nodomatic** · Agenzia: RT Studio
> Versione 1.1 · Documento per sessione di sviluppo Claude Code

---

## 0. Come usare questo documento

Questo PRD è la fonte di verità del progetto. È pensato per essere letto da Claude Code all'inizio di ogni sessione.

**Regole per chi sviluppa (umano + Claude Code):**
- Costruire **per fasi**, nell'ordine indicato nella sezione 10. Non saltare avanti.
- Ogni fase deve essere funzionante e testata prima di passare alla successiva.
- Nessun segreto nei file versionati: solo `.env.local` (gitignored) e `.env.example` con placeholder.
- Ogni feature nuova → branch dedicato → PR → review → merge.
- Aggiornare la sezione "Stato avanzamento" (sezione 11) alla fine di ogni sessione.

---

## 1. Visione e contesto

### 1.1 Problema
RT Studio acquisisce clienti web/automazione tramite outreach manuale: trovare attività locali con siti datati, analizzarli a mano, scrivere email una per una. È lento, non scala, non è tracciato.

### 1.2 Soluzione
Una piattaforma che automatizza l'intero funnel di acquisizione:
**trova → analizza → genera report personalizzato → contatta → fa follow-up → traccia in CRM.**

### 1.3 Brand e posizionamento
Il prodotto vive sotto il brand **Nodomatic**, inteso come ecosistema-ombrello delle automazioni offerte da RT Studio. L'architettura deve essere progettata per **estendersi in futuro** ad altri moduli di automazione (non solo prospecting web), quindi:
- Multi-modulo by design (il prospector è il primo modulo, non l'unico)
- Dominio unico: `nodomatic.com` con sottosezioni/sottodomini per modulo
- Naming, struttura cartelle e schema DB devono prevedere l'estendibilità

### 1.4 Obiettivi misurabili (primo modulo)
- Ridurre il tempo per generare un prospect qualificato da ~20 min a <1 min
- Tracciare tasso apertura, click, risposta per ogni campagna
- Permettere a 3+ membri del team di lavorare in parallelo sugli stessi dati
- Costo infrastruttura iniziale contenuto (vedi sez. 1.5 e 15: target €5-15/mese a regime, €10-25 con margine)

### 1.5 Vincoli di scala (decisi e vincolanti)
> Sezione aggiunta in v1.1. Questi vincoli sovrastano qualsiasi tentazione di sovradimensionare.

- **Uso interno RT Studio, NON SaaS.** Niente multi-tenancy, niente billing, niente onboarding self-service, niente inviti a clienti esterni. Gli utenti sono i membri del team.
- **Volume basso: 50-100 richieste/giorno.** Le soluzioni devono essere semplici e dirette. Non servono code distribuite, cache complesse, sharding, microservizi.
- **Cosa NON costruire** (a meno di esplicita decisione futura): multi-tenancy, billing/abbonamenti, cold-outreach multi-inbox (Smartlead/Instantly), astrazioni premature, infrastruttura oltre quanto serve al funnel interno.
- **Cosa resta importante nonostante il basso volume:** sicurezza e gestione segreti (sez. 12), deliverability email (sez. 4.2), tracciamento affidabile, idempotenza dei follow-up, qualità dei contenuti AI, privacy (hash IP).

---

## 2. Utenti e ruoli

| Ruolo | Chi | Permessi |
|---|---|---|
| **admin** | Alessandro | Tutto: lancia campagne, gestisce utenti, vede tutto, configura |
| **sales** | Davide, Simone, Ettore | Vede prospect, gestisce interazioni, marca stati, NON lancia campagne né gestisce utenti |
| **viewer** | (opzionale) stakeholder interno in sola lettura | Sola lettura su dati assegnati |

Auth multi-utente obbligatoria fin dalla Fase 1 (anche solo admin all'inizio, ma con sistema ruoli già in piedi).

---

## 3. Dominio funzionale — il funnel completo

```
[1] INPUT          Admin sceglie: categoria + città (es. "fisioterapisti Bologna")
       │
[2] SCRAPING       Apify Google Maps actor → lista attività
       │           (nome, sito, telefono, indirizzo, rating, categoria)
       │
[3] AUDIT          Per ogni sito: PageSpeed API + screenshot + tech detect
       │           → performance, SEO, mobile, accessibility, stack obsoleto
       │
[4] SCORING        Algoritmo assegna prospect_score 1-10
       │           (sito lento + tech vecchio + no HTTPS = score alto = buon target)
       │
[5] AI CONTENT     Claude API genera: analisi problemi + copy landing +
       │           email subject/body, personalizzati per prospect
       │
[6] LANDING        Pagina dinamica /p/[slug] con: screenshot sito attuale +
       │           analisi + proposta redesign. URL univoco tracciabile.
       │
[7] OUTREACH       Email via Resend con link alla landing. Tracking pixel.
       │
[8] TRACKING       Webhook Resend (open/click/bounce) + visite landing → DB
       │
[9] FOLLOW-UP      Sequenza automatica condizionale basata sul comportamento
       │
[10] CRM           Dashboard team: lista filtrabile, schede prospect, analytics
```

---

## 4. Stack tecnico

### 4.1 Stack scelto (definitivo)

| Layer | Tecnologia | Note |
|---|---|---|
| Framework | **Next.js 15** (App Router, TypeScript) | Dashboard + landing + API nello stesso progetto |
| Hosting | **Vercel** | Deploy auto da GitHub, preview deployments |
| Database | **Neon** (Postgres serverless) | Scale-to-zero, branching |
| ORM | **Drizzle ORM** | Type-safe, migrations |
| Auth | **BetterAuth** | Open source, multi-utente, ruoli |
| Background jobs | **Inngest** | Retry, observability, free tier 50k step |
| Scraping | **Apify** (Google Maps Scraper actor) | ~$0.50/1000 record |
| Audit performance | **PageSpeed Insights API** | Gratuita, 25k query/giorno |
| Screenshot | **Browserless** o **Cloudflare Browser Rendering** | Valutare il più economico |
| AI content | **Claude API** (Haiku/Sonnet) | Generazione testi personalizzati |
| Email | **Resend** | Dominio dedicato outreach + DKIM/SPF/DMARC |
| Storage | **Cloudflare R2** | Screenshot, zero egress fee |
| Web analytics | **Plausible** o **Umami** self-hosted | Sul VPS n8n esistente, gratis |
| UI | **Tailwind CSS** + **shadcn/ui** | Componenti dashboard |

### 4.2 Domini email (CRITICO per deliverability)
- **NON** usare il dominio principale per il cold outreach.
- Registrare/usare un dominio o sottodominio dedicato (es. `mail.nodomatic.com` o dominio separato).
- Configurare SPF, DKIM, DMARC su Resend.
- Warmup graduale: 50 email/giorno settimana 1, poi scalare.

### 4.3 Principi architetturali
- **Modular monolith**: un solo progetto Next.js, ma organizzato in moduli (`/modules/prospector/...`) per supportare futuri moduli Nodomatic. È una **scelta definitiva**, non una tappa verso i microservizi (vedi sez. 16).
- **Server Actions** per le mutation, **Route Handlers** per webhook esterni.
- **RLS o middleware** per isolamento permessi.
- Tutta la logica pesante (scraping, audit, AI, email) gira in **Inngest functions**, mai in request handler sincroni.

---

## 5. Schema database

```typescript
// Drizzle schema — modulo prospector

users
  id            uuid pk
  email         text unique not null
  name          text
  role          enum('admin','sales','viewer') default 'sales'
  created_at    timestamptz default now()
  // campi BetterAuth gestiti dalla sua tabella sessioni/account

campaigns
  id            uuid pk
  name          text not null            // "Fisioterapisti Bologna - Gen 2026"
  city          text not null
  category      text not null
  status        enum('draft','scraping','auditing','ready','active','archived')
  created_by    uuid fk -> users.id
  created_at    timestamptz default now()

prospects
  id              uuid pk
  campaign_id     uuid fk -> campaigns.id
  business_name   text not null
  website         text
  phone           text
  email           text
  address         text
  gmaps_rating    numeric
  gmaps_reviews   int
  category        text
  status          enum('scraped','audited','contacted','opened','clicked',
                       'replied','meeting','won','lost','cold')
  prospect_score  int                    // 1-10
  slug            text unique            // hash per URL landing /p/[slug]
  scraped_at      timestamptz
  created_at      timestamptz default now()

audits
  id                  uuid pk
  prospect_id         uuid fk -> prospects.id
  performance_score   int                // 0-100
  seo_score           int
  accessibility_score int
  best_practices_score int
  mobile_friendly     boolean
  has_https           boolean
  tech_stack          jsonb              // { cms: 'WordPress 4.x', jquery: '1.x', ... }
  load_time_ms        int
  screenshot_desktop  text               // R2 URL
  screenshot_mobile   text               // R2 URL
  audited_at          timestamptz

reports
  id              uuid pk
  prospect_id     uuid fk -> prospects.id
  analysis_text   text                   // problemi del sito, generato AI
  landing_copy    jsonb                  // { headline, problems[], solutions[], cta }
  email_subject   text
  email_body      text
  generated_at    timestamptz

email_events
  id            uuid pk
  prospect_id   uuid fk -> prospects.id
  campaign_id   uuid fk -> campaigns.id
  event_type    enum('sent','delivered','open','click','bounce','complaint','reply')
  resend_id     text                     // id messaggio Resend
  metadata      jsonb
  occurred_at   timestamptz default now()

landing_visits
  id            uuid pk
  prospect_id   uuid fk -> prospects.id
  ip_hash       text                     // hashato per privacy
  user_agent    text
  referrer      text
  duration_sec  int
  visited_at    timestamptz default now()

interactions
  id            uuid pk
  prospect_id   uuid fk -> prospects.id
  user_id       uuid fk -> users.id
  type          enum('note','call','email_manual','meeting')
  content       text
  scheduled_at  timestamptz
  completed_at  timestamptz
  created_at    timestamptz default now()

followup_sequences
  id            uuid pk
  prospect_id   uuid fk -> prospects.id
  step          int                      // 1,2,3,4
  scheduled_at  timestamptz
  sent_at       timestamptz
  status        enum('scheduled','sent','skipped','cancelled')
```

> Implementazione: `src/lib/db/schema.ts`. Le tabelle auth (`user`, `session`, `account`,
> `verification`) usano id `text` (default BetterAuth); le tabelle di dominio usano `uuid`.

---

## 6. Logica di scoring

Il `prospect_score` (1-10) determina priorità di outreach. Più il sito è messo male, più è un buon target.

Pseudo-formula (da tarare):
```
score = 0
if performance_score < 50:  score += 3
elif performance_score < 70: score += 2
if not mobile_friendly:      score += 2
if not has_https:            score += 2
if tech_stack obsoleto:      score += 2   // WP < 5, jQuery 1.x, Flash, table layout
if load_time_ms > 5000:      score += 1
if no website at all:        score = 8    // ha attività ma niente sito = ottimo target
score = min(score, 10)
```

Prospect con `score >= 6` entrano nel flusso di generazione AI + outreach. Sotto, restano nel DB ma non contattati automaticamente.

> Implementazione: `src/modules/prospector/scoring.ts`.

---

## 7. Generazione AI — prompt e output

Per ogni prospect qualificato, una Inngest function chiama Claude API con i dati dell'audit e ottiene **output JSON strutturato**:

```json
{
  "analysis_text": "Analisi dei problemi del sito in italiano, tono professionale ma diretto",
  "landing_copy": {
    "headline": "...",
    "subheadline": "...",
    "problems": ["problema 1", "problema 2", "problema 3"],
    "solutions": ["soluzione 1", "soluzione 2", "soluzione 3"],
    "cta": "..."
  },
  "email_subject": "...",
  "email_body": "..."
}
```

**Requisiti prompt:**
- Output SOLO JSON, nessun preambolo (parsing affidabile).
- Tono: professionale, italiano, niente aggressività, focus sul valore.
- Personalizzazione reale: usare nome attività, città, problemi specifici dall'audit.
- Email breve (max 120 parole), un solo CTA (link alla landing).
- Niente promesse esagerate o claim non verificabili.

**Modello:** partire con Claude Haiku per costi, valutare Sonnet se la qualità non basta.

---

## 8. Landing fittizia personalizzata

Route dinamica `/p/[slug]` (Next.js dynamic route, SSR/ISR).

**Contenuto pagina:**
1. Hero con nome attività + headline personalizzata
2. "Il tuo sito oggi": screenshot reale + metriche audit (performance, mobile, ecc.) con visual rossi/verdi
3. "Cosa non va": lista problemi (da `landing_copy.problems`)
4. "Come lo risolviamo": proposta redesign (da `landing_copy.solutions`)
5. (Opzionale fase avanzata) mockup redesign generato
6. CTA: prenota call / rispondi / WhatsApp
7. Footer brand Nodomatic + RT Studio

**Tracking:** ogni visita registra `landing_visits`. Tempo sulla pagina via beacon JS.

**Design:** seguire la skill `landing-page-design` di RT Studio per evitare estetica generica. Deve impressionare.

---

## 9. Automazione follow-up

Sequenza condizionale gestita da Inngest (cron + eventi):

| Step | Trigger | Azione |
|---|---|---|
| 1 (T+0) | Prospect qualificato | Email iniziale con link landing |
| 2 (T+3gg) | Aperta MA non cliccata | Follow-up A: "hai visto l'analisi?" |
| 3 (T+5gg) | Cliccata landing MA no risposta | Follow-up B: offerta call concreta |
| 4 (T+7gg) | Non aperta affatto | Follow-up C: subject diverso, re-send |
| — | Dopo 4 step senza risposta | Stato → `cold`, stop sequenza |
| — | Risposta ricevuta (manuale) | Sales marca stato, stop automazione |

Tutto schedulato, idempotente, con guardie per non inviare doppioni.

---

## 10. Fasi di sviluppo (ordine vincolante)

### FASE 0 — Fondamenta deploy-ready ✅
- [x] Setup progetto Next.js 15 + TypeScript + Tailwind v4 + shadcn/ui
- [x] Struttura modular monolith (`src/modules/prospector/...`)
- [x] Schema Drizzle completo (tutte le tabelle PRD §5) + tabelle auth BetterAuth
- [x] BetterAuth + Inngest cablati (build-green senza segreti)
- [x] Logica scoring (PRD §6)
- [x] Stub integrazioni (Apify, PageSpeed, screenshot, Claude, Resend, R2)
- [x] `.gitignore`, `.env.example`, landing pubblica + shell dashboard con auth gate
- [x] Deploy Vercel funzionante

### FASE 1 — Fondamenta + Scraping + Audit (≈1 settimana)
**Obiettivo:** dashboard interna che produce una lista di prospect auditati con score.
- [x] Migrazioni Drizzle generate (`src/lib/db/migrations`) — *resta da eseguire `db:push` su Neon reale*
- [x] BetterAuth con login (`/login`) + ruoli + seed primo admin (`pnpm db:seed`)
- [x] Dashboard shell con auth gate (login UI)
- [x] Integrazione Apify: function "scrape campaign" (reale)
- [x] Integrazione PageSpeed API: function "audit prospect" (reale) — *screenshot rimandati a Fase 2 (provider §13.3)*
- [x] Logica scoring collegata all'audit reale
- [x] Vista lista prospect con score, filtri base (stato, score minimo)
- [ ] **Verifica live con dati reali** (richiede DATABASE_URL + APIFY_TOKEN + PAGESPEED_API_KEY)
- **Deliverable testabile:** lancio "fisioterapisti Bologna" → vedo 50+ prospect auditati e ordinati per score.

### FASE 2 — AI Content + Landing fittizie (≈1 settimana)
**Obiettivo:** ogni prospect qualificato ha una landing personalizzata visitabile.
- [x] Integrazione Claude API (Haiku) + output JSON strutturato (structured outputs + Zod)
- [x] Inngest function "generate content" (triggerata dall'audit per i prospect qualificati)
- [x] Schema reports + storage R2 per screenshot (screenshot catturato da PageSpeed → R2)
- [x] Route dinamica `/p/[slug]` con design curato (screenshot + metriche + analisi + proposta)
- [x] Tracking visite landing (beacon JS, IP hashato)
- [ ] **Verifica live con dati reali** (richiede ANTHROPIC_API_KEY + R2_* oltre a DB/Apify/PageSpeed)
- **Deliverable testabile:** apro `/p/xyz` e vedo una landing personalizzata convincente per un prospect reale.

### FASE 3 — Email + Tracking + Follow-up (≈1 settimana)
**Obiettivo:** outreach automatizzato e tracciato end-to-end.
- [x] Integrazione Resend (invio HTML + testo con link alla landing del prospect)
- [~] Dominio dedicato + DKIM/SPF/DMARC — **configurazione DNS manuale** lato Resend (non codice)
- [x] Inngest `outreach-sequence` (invio iniziale + email_event 'sent' + stato `contacted`)
- [x] Webhook Resend → email_events (firma verificata con Svix) + upgrade stato prospect
- [x] Sequenza follow-up condizionale (PRD §9: step 2/3/4 con guardie, `cold` a fine sequenza)
- [x] Warmup: throttle 50 invii/giorno (settimana 1; alzabile)
- [x] Azioni: "Avvia outreach" campagna (admin) + cambio stato manuale prospect (stop sequenza)
- [ ] **Verifica live** (richiede RESEND_API_KEY + dominio verificato + webhook configurato)
- **Deliverable testabile:** invio campagna a 10 prospect test → tracking aperture/click visibile, follow-up partono da soli.

### FASE 4 — CRM completo + Multi-utente + Analytics (≈1 settimana)
**Obiettivo:** il team lavora in parallelo con piena visibilità.
- [x] Scheda prospect dettagliata `/prospects/[id]` (audit + landing/report + storico email + interazioni)
- [x] Gestione interazioni manuali (note, call, email_manual, meeting) con autore
- [x] Inviti utenti interni `/team` (admin crea account + password iniziale) + cambio ruolo
- [x] Analytics aggregati per campagna (tasso apertura/click/risposta, contattati, vinti)
- [x] Filtri avanzati (stato + score) + ricerca per nome + export CSV
- [ ] **Verifica live con dati reali** (richiede DB + funnel popolato)
- **Deliverable testabile:** Davide logga, vede i prospect, marca una call, vede gli analytics di campagna.

### FASI FUTURE (post-MVP)
- Mockup redesign generato automaticamente nella landing
- Secondo modulo Nodomatic interno (es. automazione recensioni, automazione social) — vedi sez. 16
- (Escluso salvo nuova decisione) cold outreach multi-inbox e apertura SaaS a terzi: contrari ai vincoli di sez. 1.5

---

## 11. Stato avanzamento

> Aggiornare a fine di ogni sessione Claude Code.

- **Fase corrente:** FASE 4 — codice completo. MVP Prospector (Fasi 1-4) implementato, in
  attesa di verifica live con le chiavi.
- **Ultimo aggiornamento:** 2026-06-20
- **Note Fase 4:** Scheda prospect `/prospects/[id]` (audit + landing/report + storico email +
  interazioni), interazioni manuali con autore (note/call/email/meeting), pagina `/team` (admin:
  invito utenti via BetterAuth `authAdmin` senza cookie + cambio ruolo), analytics aggregati per
  campagna (apertura/click/risposta su contattati), ricerca per nome + export CSV. Schema
  invariato (riusa interactions, user). typecheck/lint/build/test verdi senza `.env`.
- **Note Fase 3:** Outreach con Resend (email HTML+testo con link alla landing personale del
  prospect), Inngest `outreach-sequence` durevole con i 4 step condizionali del PRD §9 (sleep +
  guardie su aperture/click/risposta, `cold` finale), warmup via throttle 50/giorno, webhook
  Resend `/api/webhooks/resend` con firma verificata (Svix) → email_events + upgrade stato,
  azione "Avvia outreach" (admin) e select di stato manuale per i prospect. Schema invariato
  (riusa email_events e followup_sequences). typecheck/lint/build/test verdi senza `.env`.
- **Per la verifica live Fase 3 servono:** RESEND_API_KEY, OUTREACH_FROM_EMAIL (dominio
  verificato con SPF/DKIM/DMARC), RESEND_WEBHOOK_SECRET + webhook configurato su Resend verso
  `https://nodomatic.com/api/webhooks/resend`, e l'app deployata/raggiungibile da Inngest.
- **Note sessione precedente:** (1) Scaffold Fase 0. (2) Fase 1: login + ruoli, seed admin,
  campagne (Server Action + Zod), Apify + PageSpeed reali, Inngest scrape→audit→scoring→DB,
  vista campagne/prospect, migrazioni, test scoring (7/7). (3) Fase 2: generazione AI con Claude
  Haiku (output JSON strutturato via Zod), Inngest "generate-content" triggerata dai prospect
  qualificati, report data layer, screenshot del sito catturato da PageSpeed → R2 (S3-compatibile),
  landing `/p/[slug]` curata (screenshot + metriche + analisi + proposta + CTA), tracking visite
  con beacon JS e IP hashato. `pnpm typecheck && lint && build && test` verdi senza `.env`.
- **Da verificare live (servono chiavi):** `.env.local` con DATABASE_URL (Neon), APIFY_TOKEN,
  PAGESPEED_API_KEY, ANTHROPIC_API_KEY, R2_* → `pnpm db:push` → `pnpm db:seed` → crea campagna →
  Inngest scrape+audit, i qualificati generano report → apri `/p/[slug]` e vedi la landing.
- **Decisione presa:** screenshot ricavato da PageSpeed Insights (niente provider dedicato →
  §13.3 risolta pragmaticamente, da confermare). Rimandato: tech-detect per `outdatedTech`.
- **Blocchi/decisioni aperte:** vedi sezione 13. Restano da fornire le chiavi sopra.

---

## 12. Sicurezza e best practice (non negoziabili)

- `.env.local` e `.env.production` SEMPRE in `.gitignore`. Mai segreti versionati.
- `.env.example` con placeholder per ogni variabile richiesta.
- Personal Access Token con scope minimo per ogni servizio.
- Service role / chiavi admin solo server-side, mai esposte al client.
- Variabili `NEXT_PUBLIC_*` solo per dati non sensibili.
- IP visitatori landing hashati prima del salvataggio (privacy/GDPR).
- Rate limiting su endpoint pubblici (landing, webhook).
- Validazione input con Zod su tutte le mutation.
- Secret scanning attivo su GitHub (gitleaks pre-commit + GitHub secret scanning).
- Webhook Resend: verificare firma per autenticità.

### Variabili d'ambiente attese (.env.example)
```
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Apify
APIFY_TOKEN=

# PageSpeed
PAGESPEED_API_KEY=

# Screenshot (Browserless o Cloudflare)
BROWSERLESS_TOKEN=

# Claude API
ANTHROPIC_API_KEY=

# Resend
RESEND_API_KEY=
RESEND_WEBHOOK_SECRET=
OUTREACH_FROM_EMAIL=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

---

## 13. Decisioni aperte (da risolvere con Alessandro)

1. ~~**TLD dominio Nodomatic**~~ → **RISOLTO: `nodomatic.com`**.
2. **Dominio email outreach**: sottodominio di Nodomatic o dominio separato dedicato? (separato = reputazione più sicura)
3. ~~**Screenshot provider**: Browserless vs Cloudflare~~ → **RISOLTO (da confermare)**: lo screenshot viene ricavato dal report PageSpeed Insights (Lighthouse `final-screenshot`) e archiviato su R2 — nessun provider screenshot dedicato. Se in futuro servisse maggiore qualità/desktop, valutare Browserless/Cloudflare.
4. **Plausible vs Umami**: quale per web analytics self-hosted sul VPS n8n.
5. **Source scraping oltre Google Maps**: aggiungere Pagine Gialle/altri in futuro?
6. **Categoria + città di partenza** per il primo test reale di Fase 1.
7. **Modello AI default**: confermare Haiku vs Sonnet dopo test qualità in Fase 2.

---

## 14. Definizione di "fatto" (Definition of Done)

Una fase è completa quando:
- Tutte le checkbox della fase sono spuntate
- Il deliverable testabile è verificato manualmente con dati reali
- Nessun segreto nel repo (gitleaks pulito)
- Il codice è su un branch mergeato in `main` via PR
- La sezione 11 (Stato avanzamento) è aggiornata
- Deploy su Vercel funzionante (preview almeno)

---

## 15. Costi reali stimati

> Sezione aggiunta in v1.1. Target a basso volume (50-100 richieste/giorno).

| Servizio | Piano | Costo stimato |
|---|---|---|
| Vercel | Hobby/Pro secondo necessità | €0-20/mese |
| Neon | Free / scale-to-zero | €0 |
| Inngest | Free tier (50k step) | €0 |
| Apify | Pay-per-use (~$0.50/1000 record) | pochi € |
| PageSpeed | Gratis | €0 |
| Screenshot | Browserless/CF a basso volume | pochi € |
| Claude API | Haiku, pochi token/prospect | pochi € |
| Resend | Free/low tier | €0-20/mese |
| Cloudflare R2 | Zero egress, storage minimo | ~€0 |
| Analytics | Plausible/Umami self-hosted su VPS esistente | €0 |
| **Totale** | | **~€10-25/mese** |

---

## 16. Architettura evolutiva e confini dei moduli

> Sezione aggiunta in v1.1.

**Le 3 regole d'oro:**
1. **Modular monolith definitivo.** Un solo progetto Next.js, un solo deploy. I moduli vivono in
   `src/modules/<modulo>` con confini netti (logica, integrazioni, eventi propri). Niente microservizi.
2. **Condividi le fondamenta, isola il dominio.** Auth, DB client, UI primitives e utility sono
   condivisi (`src/lib`, `src/components`). La logica di dominio di un modulo non dipende da quella di
   un altro: comunicano, se serve, via eventi Inngest.
3. **Costruisci per il bisogno presente, non per l'ipotetico.** Niente astrazioni premature. Si
   generalizza solo quando un secondo modulo reale lo richiede.

**Lista anti-over-engineering (NON fare a meno di decisione esplicita):** multi-tenancy, billing,
feature flag elaborati, event sourcing, code esterne oltre Inngest, cache distribuite, gateway/API
pubbliche, microservizi, cold-outreach multi-inbox, apertura SaaS a terzi.

**Moduli futuri candidati (interni RT Studio):** automazione recensioni, automazione social, altri
flussi di acquisizione. Ognuno sarà un nuovo `src/modules/<modulo>` che riusa le fondamenta.

**Percorso evolutivo se i vincoli cambiassero:** se in futuro servisse aprire a terzi (SaaS), il
passaggio sarebbe — nell'ordine — (1) introdurre tenant_id e isolamento dati, (2) billing, (3)
onboarding self-service. Finché i vincoli di sez. 1.5 reggono, nulla di tutto questo va costruito.

---

*Fine PRD v1.1 — Nodomatic Prospector (uso interno RT Studio, 50-100 richieste/giorno)*
