---
name: skill-frontend-expert
description: React Next.js App Router TypeScript Tailwind Shadcn expertise; use when building frontend components, hooks, Server Components, next/image or componentization.
---

# Skill Frontend Expert

Stack: React, Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, Shadcn/UI.

## Diretrizes

- Componentização atômica e tipagem estrita (proibido `any`). Use `unknown` + narrow ou generics.
- Isole lógica de negócio e chamadas de API em custom hooks reutilizáveis (`src/lib/hooks/`).
- Priorize Server Components por padrão; declare `"use client"` apenas quando houver estado local, hooks de ciclo de vida ou eventos interativos.
- Otimize renderização (`memo`, `useMemo`, `useCallback` quando mensurável) e utilize `next/image` para imagens estáticas/dinâmicas.
- Co-localize estilos com `clsx` + `tailwind-merge` via `src/lib/utils.ts`.
- Valide props com Zod quando dados vêm de API/URL.

## Estrutura alvo neste projeto
- `src/components/ui/` → primitivos Shadcn
- `src/components/scrolly/` , `src/components/admin/` → domínios
- `src/app/` → routes App Router
