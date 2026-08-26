---
name: skill-backend-database
description: Backend and database patterns for Python Django FastAPI Node PostgreSQL Prisma Drizzle SQLAlchemy; use when designing REST JSON APIs, Zod Pydantic validation, N+1 queries or indexes.
---

# Skill Backend Database

Stack: Python (Django / FastAPI), Node.js, PostgreSQL, SQLite, Prisma / Drizzle / SQLAlchemy.

## Diretrizes

- Padronize respostas REST/JSON: `{ "success": boolean, "data"?: any, "error"?: { "code": string, "message": string } }`.
- Validação estrita de entrada (Zod / Pydantic) em todos os endpoints antes de qualquer processamento.
- Modelagem relacional eficiente: crie índices para colunas de busca/filtros e chaves estrangeiras.
- Elimine N+1 queries utilizando `select_related`/`prefetch_related` ou `joins`/`include` apropriados (Prisma: `include`, `select`).
- Use transações quando houver múltiplas writes dependentes.
- Nunca exponha detalhes internos do DB no `error.message` do cliente.

## Neste projeto (Prisma)
- Schema em `prisma/schema.prisma`
- Helpers em `src/lib/db/catalog.ts` e `src/lib/db/store.ts`
- Schemas Zod em `src/lib/schemas/`
