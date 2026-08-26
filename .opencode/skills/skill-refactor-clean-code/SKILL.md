---
name: skill-refactor-clean-code
description: Clean code refactoring with SRP, KISS, YAGNI and dead code removal; use when refactoring, clean code, SRP, dead code or console.log removal.
---

# Skill Refactor — Clean Code

## Diretrizes

- Aplique SRP: funções curtas e focadas (máx ~20-30 linhas, 1 responsabilidade).
- Remova dead code, imports não utilizados e `console.log`/`print` de depuração temporários.
- Respeite KISS e YAGNI: não antecipe abstrações; generalize apenas no terceiro uso.
- Nomeação semântica; evite abreviações obscuras.
- Prefira early-return sobre nesting profundo.
- Mantenha convenções do projeto (Tailwind, App Router, Prisma) e rode `next lint` / `tsc --noEmit` após refactor.
