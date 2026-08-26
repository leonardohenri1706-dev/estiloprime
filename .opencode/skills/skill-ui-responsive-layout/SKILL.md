---
name: skill-ui-responsive-layout
description: Mobile-first responsive layout with breakpoints and flex protections; use when responsive design, mobile-first, sm md lg xl, min-w-0, truncate or line-clamp.
---

# Skill UI — Responsive Layout

## Diretrizes

- **Mobile-First:** Escreva classes base para mobile e adicione breakpoints progressivos (`sm:`, `md:`, `lg:`, `xl:`).
- **Proteção Visual:** Evite quebras usando `min-w-0` em containers flexíveis e `truncate` / `line-clamp-*` com `title` acessível em textos longos.
- Use `grid` com `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` e `container` centralizado.
- Imagens: `w-full h-auto` + `next/image` com `sizes` correto.
- Teste overflow horizontal: `overflow-hidden` e `max-w-full` em cards.
