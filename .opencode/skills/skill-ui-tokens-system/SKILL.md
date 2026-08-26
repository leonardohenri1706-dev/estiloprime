---
name: skill-ui-tokens-system
description: Semantic Tailwind CSS tokens and dark mode system; use when styling with bg-background, text-foreground, rounded, design tokens or dark mode.
---

# Skill UI — Tokens System

## Diretrizes

- **Tokens Semânticos:** Use variáveis CSS e classes semânticas do Tailwind (`bg-background`, `text-foreground`, `border-border`, `bg-muted`, `text-muted-foreground`).
- **Escala Padronizada:** Evite valores arbitrários isolados (como `w-[347px]`); utilize escala nativa de espaçamento, tipografia e bordas (`rounded-lg`, `rounded-md`, `p-4`, `gap-6`).
- **Suporte a Dark Mode:** Garanta contraste e legibilidade acessível em ambos os modos; teste com `dark:` variant.
- Defina tokens em `src/app/globals.css` via CSS variables; consuma via Tailwind config (`tailwind.config.ts`).
- Nunca hardcode hex direto em componentes; use token semântico.
