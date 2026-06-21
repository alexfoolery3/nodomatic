#!/usr/bin/env sh
# Rete di sicurezza del rituale pre-merge.
# Hook PreToolUse su Bash: legge il payload JSON da stdin e, se il comando in procinto
# di essere eseguito contiene "git push", stampa un promemoria NON bloccante (exit 0).
# Nessuna dipendenza (no jq/node): grep sul JSON grezzo.

payload="$(cat)"

case "$payload" in
  *'git push'*)
    cat <<'REMINDER'
─────────────────────────────────────────────────────────────
PROMEMORIA pre-merge (rituale) — prima di pushare verifica:
  1. docs/HISTORY.md  → blocco "### Sessione AAAA-MM-GG — Titolo" in cima
  2. docs/ROADMAP.md  → riga in "Storico" + stato area (✅/🔜/⏸️) aggiornato
  3. CLAUDE.md        → solo se cambiano regole/gotcha/"Azioni manuali in sospeso"
  4. Migration Drizzle→ se schema cambiato: pnpm db:generate + nota db:migrate
  5. Qualità          → pnpm typecheck && pnpm lint && pnpm build (verdi, senza .env)
                        commit Conventional Commits · PR · merge solo con OK
Dettagli: skill /pre-merge
─────────────────────────────────────────────────────────────
REMINDER
    ;;
esac

exit 0
