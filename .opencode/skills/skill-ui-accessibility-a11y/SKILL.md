---
name: skill-ui-accessibility-a11y
description: Accessibility a11y with semantic HTML, labels and focus rings; use when a11y, accessibility, aria-label, label htmlFor, focus-visible or keyboard navigation.
---

# Skill UI — Accessibility (a11y)

## Diretrizes

- Utilize tags semânticas HTML5 (`<button>`, `<nav>`, `<aside>`, `<main>`, `<section>`).
- Formulários sempre vinculados via `<label htmlFor="...">` + `id` no input.
- Anéis de foco visíveis para navegação por teclado (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`).
- Botões exclusivamente com ícones DEVEM conter `aria-label` descritivo.
- Contraste AA: `text-foreground` sobre `bg-background`; teste com Lighthouse.
- Não remova `outline` sem substituir por `focus-visible:ring`.
