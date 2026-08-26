---
name: skill-ui-motion-framer
description: Framer Motion animations 150-300ms ease-out with motion-reduce support; use when adding animations, framer-motion, motion, transitions or ease-out.
---

# Skill UI — Motion (Framer)

## Diretrizes

- Animações rápidas e funcionais (`150ms` a `300ms`), curvas `ease-out` em entradas.
- Use `framer-motion` (`motion.div`) com `initial`, `animate`, `exit`; prefira `transform` e `opacity` (GPU).
- Suporte a `motion-reduce:transition-none` e hook `useReducedMotion` (`src/lib/hooks/use-reduced-motion.ts`).
- Stagger sutil para listas (`staggerChildren: 0.05`).
- Nunca bloqueie interação durante animação; mantenha `pointer-events` coerente.
- No projeto já existe `gsap` + `lenis` para scroll; coordene para não conflitar.
