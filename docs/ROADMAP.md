# ROADMAP — piano + storico sintetico

**Fonte unica del piano operativo.** Lo stato di dettaglio narrativo vive in
[`HISTORY.md`](HISTORY.md); la spec di prodotto in [`PRD.md`](PRD.md).

Legenda stato: ✅ fatto · 🔜 prossimo · ⏸️ in pausa / posticipato · ❓ da valutare / decidere.

## Prossimi passi (handoff → sessione locale)

> Contesto: l'utente lavora ora in **locale** (`~/developer/nodomatic`). Vuole fare verifiche e
> applicare le migrazioni. Divisione dei compiti concordata il 2026-06-23.

**Micro-task immediato proposto (codice, lato Claude):**
- **A2** — Generare un template `.env.local` commentato a due livelli ("solo login+dashboard" vs
  "funnel completo") + checklist numerata di cosa incollare dove. *(non ancora fatto — partire da qui)*

**Faccio io (codice → commit/push, nessun segreto):**
- A1 — chiarire la nota n8n nel `PRD.md`.
- A3 — rifinitura UX/dashboard (area G).
- A4 — implementare **una** delle 15 aree future (§Evoluzione) scelta dall'utente, per fasi.
- A5 — verificare `pnpm typecheck && lint && build` verdi prima di ogni push.
- A6 — preparare/ricontrollare l'SQL delle migrazioni Drizzle.

**Fa l'utente (account esterni / segreti / sua macchina):**
- B1 — creare DB **Neon** → `DATABASE_URL` in `.env.local`.
- B2 — `openssl rand -base64 32` → `BETTER_AUTH_SECRET` (+ `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `IP_HASH_SALT`).
- B3 — `pnpm db:migrate` (applica `0000`–`0002`, mai applicate) poi `pnpm db:seed` (primo admin via `SEED_ADMIN_*`).
- B4 — chiavi API per il funnel: Apify, PageSpeed, Anthropic, Resend, R2.
- B5 — go-live: collegare repo a Vercel + env var + dominio `nodomatic.com`.

**Obiettivo verifica scelto:** _(da confermare)_ "solo login+dashboard" (B1+B2+B3, ~10 min) **oppure** funnel completo (anche B4).

## Storico (sintetico)

| data | aspetto | voce | PR/commit |
|------|---------|------|-----------|
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
Funzionale (shadcn/ui new-york, recharts). Rifinitura visuale e coerenza dashboard da fare.

### H — Go-live (.com / Vercel / Neon) 🔜
Codice builda verde senza segreti; `engines.node = 22.x`. **In corso:** deploy su Vercel
(team `rt-studio`) — vedi "Azioni manuali in sospeso" in CLAUDE.md. **Da fare:** collegare
DATABASE_URL Neon, env var, `pnpm db:migrate`, seed admin, Inngest sync, Resend webhook,
dominio `nodomatic.com`.

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
