---
name: skill-ui-component-states
description: Standardized UI component states for loading, empty, error and interactions; use when implementing skeleton, empty state, error banner, hover or disabled states.
---

# Skill UI — Component States

## Estados Visuais Obrigatórios

- **Loading / Skeleton:** `animate-pulse bg-muted rounded` respeitando estrutura do card/tabela.
- **Empty State:** Ícone sutil centralizado, título explicativo e CTA primário (`<Button>`).
- **Error State:** Banner contextual com mensagem legível e ação de retry (`variant="destructive"` ou `bg-destructive/10`).
- **Interações:** `hover:opacity-90`, `active:scale-[0.98]`, `disabled:opacity-50 disabled:pointer-events-none`, `transition-colors duration-150`.

## Regra
Todo componente que busca dados deve implementar os 3 estados (loading, empty, error). Não deixe tela em branco.
