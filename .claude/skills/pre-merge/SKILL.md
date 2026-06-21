---
name: pre-merge
description: Rituale da eseguire PRIMA di pushare/mergiare qualsiasi lavoro su Nodomatic. Aggiorna la memoria di progetto (HISTORY/ROADMAP/CLAUDE), gestisce le migrazioni Drizzle, esegue i check di qualità e prepara commit/push/PR. Usalo quando una modifica è completa e stai per fare git push, aprire una PR o chiudere la sessione.
---

# Rituale pre-merge

Esegui questi passi **in ordine** prima di pushare un branch di sessione o aprire/mergiare una PR.
Non saltarli: sono la memoria operativa del progetto. (Setup memoria: `CLAUDE.md` = sempre caricato;
`docs/ROADMAP.md` = piano + stato; `docs/HISTORY.md` = archivio narrativo; `docs/PRD.md` = spec.)

## 1. `docs/HISTORY.md` — cronologia narrativa
Aggiungi **in cima**, sotto `## Cosa è stato fatto`, un blocco:

```
### Sessione AAAA-MM-GG — Titolo sintetico
- Cosa hai fatto (verboso), file/aree toccati, decisioni prese e perché.
```

## 2. `docs/ROADMAP.md` — piano + storico sintetico
- Aggiungi una riga in cima alla tabella **Storico**: `| data | aspetto | voce | PR/commit |`.
- Aggiorna lo **stato** (✅/🔜/⏸️) nell'area di pertinenza (A Sicurezza, B Funnel, C Retention,
  D Contenuti, E Admin, F Automations, G Design, H Go-live, I Wow/AI).

## 3. `CLAUDE.md` — solo se serve
Toccalo **solo** se cambiano regole, gotcha, stato operativo o le **"Azioni manuali in sospeso"**.
La cronologia NON va qui (vive in HISTORY): CLAUDE.md resta snello e sempre-caricato.

## 4. Migrazioni Drizzle (se hai cambiato lo schema DB)
Stack: **Neon + Drizzle**, migrazioni versionate (non Supabase).
- Genera la migration: `pnpm db:generate` (scrive in `src/lib/db/migrations/`).
- Committa l'SQL versionato.
- Annota in `CLAUDE.md` → **"Azioni manuali in sospeso"** che va applicata con `pnpm db:migrate`
  sul DB Neon live. C'è **un solo DB condiviso**: la migration si applica una volta sola.

## 5. Qualità → commit → push → PR
- Verde, **senza `.env.local`**: `pnpm typecheck && pnpm lint && pnpm build` (+ `pnpm test` se rilevante).
- Commit in **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- `git push -u origin <branch-di-sessione>` (retry con backoff se errori di rete).
- Apri PR; **merge solo con OK dell'utente**. Non creare PR se non richiesto esplicitamente.

---

## Bootstrap nuovo progetto/repo
Per replicare questo rituale altrove, copia e adatta:
- `.claude/skills/pre-merge/SKILL.md` (questo file)
- `.claude/settings.json` + `.claude/hooks/pre-merge-reminder.sh` (hook SessionStart + git push)
- `docs/HISTORY.md` e `docs/ROADMAP.md` (scheletri: intestazione + sezioni vuote)
- In `CLAUDE.md`: sezioni "Promemoria critici", "Azioni manuali in sospeso", "Rituale pre-merge",
  "Comandi" e i ruoli del trittico di memoria.

Adatta il passo 4 allo stack del nuovo progetto (es. Supabase = un solo DB, SQL idempotente
applicato a mano dal SQL Editor; Drizzle = `db:generate` + `db:migrate`).
