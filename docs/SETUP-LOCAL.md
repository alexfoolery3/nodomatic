# SETUP-LOCAL — far girare Nodomatic in locale

Guida operativa numerata "cosa incollare dove". Due livelli: parti dal **LIVELLO 1**
(login + dashboard, ~10 min) e aggiungi il **LIVELLO 2** solo quando vuoi provare il
funnel completo. Il template delle variabili è [`.env.example`](../.env.example);
le lettere `[B1]…[B4]` rimandano ai task in [`ROADMAP.md`](ROADMAP.md).

> Pre-requisiti: Node 22.x, `pnpm`. Dalla cartella del progetto:
> ```bash
> pnpm install
> cp .env.example .env.local   # poi riempi .env.local seguendo i passi sotto
> ```
> ⚠️ Riempi sempre **`.env.local`** (gitignored), mai `.env.example`. Niente segreti versionati.

---

## LIVELLO 1 — Login + Dashboard

Obiettivo: app in piedi, login funzionante, primo admin creato. Bastano un DB Neon e
due secret generati a mano.

1. **`NEXT_PUBLIC_APP_URL`** → lascia `http://localhost:3000`.
2. **`DATABASE_URL`** `[B1]` → crea un progetto su <https://neon.tech>, copia la
   *connection string* (con `?sslmode=require`) e incollala qui.
3. **`BETTER_AUTH_SECRET`** `[B2]` → genera e incolla:
   ```bash
   openssl rand -base64 32
   ```
4. **`BETTER_AUTH_URL`** → lascia `http://localhost:3000`.
5. **`IP_HASH_SALT`** `[B2]` → genera un secondo valore con `openssl rand -base64 32`.
   (Lo usano solo le landing `/p/[slug]` per hashare gli IP; impostalo comunque.)
6. **`SEED_ADMIN_EMAIL`** / **`SEED_ADMIN_PASSWORD`** / **`SEED_ADMIN_NAME`** `[B3]` →
   le credenziali del primo admin che verrà creato al passo 8.
7. **Applica le migrazioni** `[B3]` (crea le tabelle sul DB Neon):
   ```bash
   pnpm db:migrate
   ```
8. **Crea il primo admin** `[B3]` (legge i `SEED_ADMIN_*`):
   ```bash
   pnpm db:seed
   ```
9. **Avvia** e fai login con le credenziali del passo 6:
   ```bash
   pnpm dev
   ```
   → <http://localhost:3000>

✅ A questo punto login e dashboard funzionano. Il funnel mostrerà errori/stub finché
non completi il LIVELLO 2 (è normale: le integrazioni esterne sono stub `NotImplementedError`).

---

## LIVELLO 2 — Funnel completo + Reporting

Aggiungi le chiavi solo per le feature che vuoi attivare: ognuna è indipendente.

### Background jobs (Inngest)
- In locale **non servono chiavi**: avvia la dev server Inngest in un secondo terminale:
  ```bash
  npx inngest-cli@latest dev
  ```
- `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` servono **solo in produzione** (sync su `/api/inngest`).

### Funnel Prospector `[B4]`
10. **`APIFY_TOKEN`** → token da <https://apify.com> (Google Maps Scraper).
11. **`PAGESPEED_API_KEY`** → API key PageSpeed Insights (Google Cloud Console).
12. **`ANTHROPIC_API_KEY`** → da <https://console.anthropic.com> (generazione copy/landing/narrativa).
13. **`BROWSERLESS_TOKEN`** → screenshot dei siti (Browserless o Cloudflare Browser Rendering).
14. **`RESEND_API_KEY`** + **`OUTREACH_FROM_EMAIL`** (+ **`RESEND_WEBHOOK_SECRET`** per i webhook
    di delivery, **`TEAM_NOTIFY_EMAIL`** per gli alert) → email outreach via <https://resend.com>.
15. **`R2_*`** (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`,
    `R2_PUBLIC_URL`) → bucket Cloudflare R2 per archiviare gli screenshot.
16. **`APOLLO_API_KEY`** (opzionale) → arricchimento email dei prospect.

### Reporting clienti (agency-managed)
17. **`GOOGLE_SERVICE_ACCOUNT_JSON`** → service account Google (GA4 / Google Ads) in base64:
    ```bash
    base64 -w0 service-account.json
    ```
18. **`META_SYSTEM_USER_TOKEN`** → token System User del Business Manager (Meta Marketing API).
19. **`GOOGLE_ADS_*`** (`DEVELOPER_TOKEN`, `LOGIN_CUSTOMER_ID`, `CLIENT_ID`, `CLIENT_SECRET`,
    `REFRESH_TOKEN`) → accesso all'MCC Google Ads.

---

## Verifica build senza segreti

L'app **deve** compilare anche senza `.env.local` (convenzione build-green). Prima di
pushare:
```bash
pnpm typecheck && pnpm lint && pnpm build
```
Devono passare verdi **senza** segreti impostati.
