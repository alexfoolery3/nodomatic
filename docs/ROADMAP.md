# ROADMAP — piano + storico sintetico

**Fonte unica del piano operativo.** Lo stato di dettaglio narrativo vive in
[`HISTORY.md`](HISTORY.md); la spec di prodotto in [`PRD.md`](PRD.md).

Legenda stato: ✅ fatto · 🔜 prossimo · ⏸️ in pausa / posticipato · ❓ da valutare / decidere.

## Prossimi passi

> `nodomatic.com` = **sito vetrina agency**; l'app interna (Prospector) andrà su `app.nodomatic.com`.
> Stato 2026-06-25: ambiente live operativo (DB Neon + admin + deploy Vercel). Focus attuale: **sito vetrina**.

**Fatto (2026-06-25):**
- ✅ DB **Neon** via integrazione Vercel + `DATABASE_URL` su tutti gli ambienti.
- ✅ Migrazioni `0000`–`0002` applicate (migrator HTTP, aggira websocket su Node 20) + **admin seedato**.
- ✅ Env auth su Vercel prod + redeploy → **login admin live** su `nodomatic.vercel.app`.
- ✅ Brand system in Figma (metallico, Geist, logo "N" a nodi) + IA servizi×mercati.
- ✅ **Home + /contatti** del sito vetrina in codice (route group `(site)`, tema `.site`, Geist).
- ✅ **Soluzione servizio×settore** (`/{servizio}-per-{settore}`): Automazioni × 12 settori (SSG) + **Chi siamo**.
- ✅ **Hub Servizio/Settore** (`/servizi/[servizio]`, `/settori/[settore]`) + indici + breadcrumb; matrice estesa a
  **4 servizi × 12 settori = 48 soluzioni**; mesh IA Home→hub→soluzione; **menu mobile** + polish responsive. Figma: 2 template hub.
- ✅ **Mega menu** Servizi/Settori nella navbar (dropdown, no icone) + pagina **/sitemap** e **/sitemap.xml**
  (48 soluzioni = pagine **SEO-only**, indicizzabili e in sitemap, fuori dal nav). Figma: mega menu, footer con
  settori, sitemap, **brand book 11 sezioni**; pittogramma = **N a nodi**.

**Prossimo (sito vetrina / go-live):**
- ⏸️ **Tema chiaro** del sito (rinviato dall'utente; base resta dark-only).
- 🔜 Rifinitura copy dei nuovi servizi (`ads`/`siti`/`social`) se necessario.
- 🔜 Chiavi funnel (Apify/PageSpeed/Anthropic/Resend/R2/Inngest) — le inserisce l'utente.
- 🔜 Dominio `nodomatic.com` + sottodominio `app.nodomatic.com`.

## Storico (sintetico)

| data | aspetto | voce | PR/commit |
|------|---------|------|-----------|
| 2026-06-26 | G Sito vetrina | Mega menu anche su mobile (accordion espandibile) + archivio Figma Brand Board | _branch sessione_ |
| 2026-06-25 | G Sito vetrina | Mega menu (navbar) + /sitemap + /sitemap.xml (SEO, 48 soluzioni SEO-only) + brand book Figma 11 sez. + pittogramma N | _branch sessione_ |
| 2026-06-25 | G Sito vetrina | Hub Servizio/Settore + indici + matrice 4×12 (48 SSG) + mesh/breadcrumb + menu mobile; Figma 2 template | _branch sessione_ |
| 2026-06-25 | G Sito vetrina | Template soluzione servizio×settore (Automazioni × 12, SSG) + Chi siamo + nav/footer | _branch sessione_ |
| 2026-06-25 | G Sito vetrina | Home + /contatti agency in codice (route group `(site)`, tema `.site`, Geist) | _branch sessione_ |
| 2026-06-25 | H Go-live | DB Neon via Vercel + migrazioni applicate + admin **live** su Vercel | _questa sessione_ |
| 2026-06-25 | Brand | brand system Figma (metallico, Geist, logo "N") + IA servizi×mercati + decisione vetrina/app-sottodominio | _Figma_ |
| 2026-06-24 | H Go-live | A2: `.env.example` a due livelli + guida `docs/SETUP-LOCAL.md` | _questa sessione_ |
| 2026-06-23 | Evoluzione | backlog 15 aree future (❓) + chiarimento n8n (non usato) | _questa sessione_ |
| 2026-06-21 | H Go-live | pin Node 22.x, build verde, deploy Vercel avviato | `7eca253` |
| 2026-06-21 | — Processo | fix branch orfano: `main` allineato + passo "atterraggio su main" nel rituale | _questa sessione_ |
| 2026-06-21 | — Processo | rituale dev: HISTORY/ROADMAP + skill `/pre-merge` + hook | _questa sessione_ |
| 2026-06-20 | C Reporting | report online + export PDF/CSV (modulo completo) | `a6dae82` |
| 2026-06-20 | C Reporting | Google Ads + social organico | `36cd7e7` |
| 2026-06-20 | C Reporting | Meta Ads (insights + dashboard) | `687f9a6` |
| 2026-06-20 | C Reporting | GA4 (pull reale + dashboard cliente) | `90122f5` |
| 2026-06-20 | C Reporting | Fase 0: entità client + connessioni dati | `4227b68` |
| 2026-06-20 | C Retention | monitoring continuo siti + alert | `c154dc1` |
| 2026-06-20 | B Funnel | tech detection, Apollo, inserimento manuale | `207e3cf`/`0056039`/`33f30b2` |
| 2026-06-20 | B Funnel | Prospector Fasi 1-4 (MVP completo) | `4a11efa`→`d11da61` |
| 2026-06-20 | — Fondamenta | scaffold deploy-ready (Fase 0) | `50a1abb` |

## Aree

Schema a lettere condiviso tra progetti, etichette adattate a Nodomatic.

### A — Sicurezza & Auth ✅
BetterAuth (ruoli admin/sales/viewer), validazione Zod su tutte le mutation, IP visitatori
hashati (GDPR), nessun segreto versionato. Pattern build-green senza segreti.

### B — Conversione / Funnel Prospector ✅
Scraping (Apify) → audit (PageSpeed) → scoring → AI content → landing `/p/[slug]` → outreach
(Resend) → follow-up condizionale. Inserimento manuale prospect/clienti.
- 🔜 verifica live end-to-end quando arrivano le chiavi (DATABASE_URL, APIFY_TOKEN, ecc.).

### C — Retention / Clienti + Reporting ✅
Monitoring continuo siti + alert. Modulo Reporting: GA4 + Meta Ads + Google Ads + social
organico → report online white-label `/r/[slug]` + export PDF/CSV + narrativa AI.

### D — Contenuti AI ✅
Generazione email/landing copy e narrativa report (`claude-haiku-4-5`), best-effort.

### E — Admin / Multi-utente ✅
Gestione team, analytics per campagna, KPI globali, notifiche team.

### F — Automations (Inngest) ✅
Function funnel + cron (refresh metriche giornaliero, report mensili) + throttle/warmup.
Client condiviso `src/lib/inngest.ts`, un solo `serve()` su `app/api/inngest`.

### G — Design / UX 🔜
**Sito vetrina**: brand metallico/Geist; Home + hub Servizio/Settore + matrice 4×12 + indici + breadcrumb +
menu mobile (responsive) ✅. Tema chiaro ⏸️ (rinviato). **Dashboard** (shadcn/ui new-york, recharts):
rifinitura visuale e coerenza ancora da fare.

### H — Go-live (.com / Vercel / Neon) 🔜
Codice builda verde senza segreti; `engines.node = 22.x`. **In corso:** deploy su Vercel
(team `rt-studio`) — vedi "Azioni manuali in sospeso" in CLAUDE.md. **Da fare:** collegare
DATABASE_URL Neon, env var, `pnpm db:migrate`, seed admin, Inngest sync, Resend webhook,
dominio `nodomatic.com`. Setup env locale a due livelli: guida passo-passo in [`SETUP-LOCAL.md`](SETUP-LOCAL.md).

### I — Wow / AI avanzata ⏸️
Moduli futuri posticipati dall'utente: `geo` (AI visibility tracker) e `digital-pr` (earned
media). Da progettare e approvare prima di scrivere codice.

## Evoluzione futura — backlog idee (da valutare ❓)

> Menu di evoluzione, **non** backlog da attaccare tutto insieme. Vincoli sempre validi (uso
> interno, basso volume, modular monolith, budget €10-25/mese, anti-over-engineering): ogni voce
> va decisa esplicitamente e costruita per fasi, riusando le fondamenta esistenti.

**Nota n8n** ❓: Nodomatic **non usa n8n** (nessuna dipendenza nel codice; l'unica occorrenza nel
lock file è un falso positivo in un hash). L'orchestrazione è già interamente in casa con **Inngest**
(funnel + cron). n8n compare solo nel PRD come *VPS esterno preesistente di RT Studio*, ipotesi di
hosting per Plausible/Umami (web analytics) — non come motore di automazione dell'app. Non serve
introdurlo. *(Da decidere: chiarire questa nota anche nel PRD per chiudere l'ambiguità.)*

### Acquisizione / Prospect (estensioni modulo `prospector`)
1. ❓ **Multi-source scraping & dedup** — oltre Google Maps (Pagine Gialle, directory, registri
   imprese, LinkedIn company) con merge/dedup per non ricontattare lo stesso lead. *(cfr. decisione aperta PRD #5)*
2. ❓ **Lead scoring predittivo / ICP fit** — evolvere `scoring.ts` da regole a punteggio
   "probabilità di conversione" sullo storico esiti, con spiegazione dei fattori (no ML pesante).
3. ❓ **Multi-canale outreach** — oltre email (Resend): LinkedIn semi-manuale, WhatsApp Business,
   liste cold-call con script AI; sequenze cross-canale condizionali.
4. ❓ **Reply intelligence & intent detection** — parsing AI delle risposte email (interessato /
   non ora / no / OOO), routing CRM e stop follow-up automatico.
5. ❓ **A/B testing copy & landing** — varianti email/landing `/p/[slug]` con misura open/click/
   conversione e scelta automatica della variante vincente.
6. ❓ **Competitor & market intelligence** — per ogni prospect, snapshot di chi gli fa marketing
   (Meta Ad Library, presenza Google, recensioni) per personalizzare il pitch.

### Gestione clienti / Digital marketing (estensioni modulo `reporting` + retention)
7. ❓ **Pianificazione & approvazione contenuti social** — calendario editoriale, bozze AI
   (testo + brief immagine), approvazione cliente, scheduling/pubblicazione.
8. ❓ **Budget & spend pacing ads** — sopra Meta/Google Ads: pacing vs budget mensile, alert
   over/under, suggerimenti AI di riallocazione (lettura, non gestione bid automatica).
9. ❓ **Goal tracking & anomaly alerts** — obiettivi su KPI per cliente (lead, CPL, ROAS) con
   avvisi su deviazioni dal trend; riusa `repMetricsDaily` + pattern alert del monitoring siti.
10. ❓ **Client portal / area cliente** — evolvere `/r/[slug]` in mini-portale (login leggero) per
    report live + approvazioni. ⚠️ inquadrare come area cliente read/approvazione, **non** onboarding self-service.
11. ❓ **SEO / Local SEO monitoring** — tracking keyword, Google Business Profile (recensioni/post/
    insights), audit on-page periodico. Estensione del monitoring siti.
12. ❓ **Conversion tracking & attribution** — pixel/eventi sulle landing per legare lead → fonte →
    campagna → cliente e mostrare l'attribuzione nei report.

### Trasversali / Operazioni
13. ❓ **CRM unificato & pipeline deal** — fondere prospect e cliente in un'unica pipeline
    (lead → opportunità → cliente attivo → churn) con valore deal, attività e timeline.
14. ❓ **Billing & ricavi interni (light)** — contratti/retainer, MRR, marginalità per cliente
    (ricavi vs spend ads vs costi tool). *Interno*, non billing SaaS.
15. ❓ **Copilot / Assistant interno** — assistente AI sui dati Nodomatic ("clienti a rischio
    churn?", "scrivi il follow-up", "riassumi giugno") via Claude sui dati già in DB.
