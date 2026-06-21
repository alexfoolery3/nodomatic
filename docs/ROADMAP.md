# ROADMAP — piano + storico sintetico

**Fonte unica del piano operativo.** Lo stato di dettaglio narrativo vive in
[`HISTORY.md`](HISTORY.md); la spec di prodotto in [`PRD.md`](PRD.md).

Legenda stato: ✅ fatto · 🔜 prossimo · ⏸️ in pausa / posticipato.

## Storico (sintetico)

| data | aspetto | voce | PR/commit |
|------|---------|------|-----------|
| 2026-06-21 | H Go-live | pin Node 22.x, build verde, deploy Vercel avviato | `7eca253` |
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
