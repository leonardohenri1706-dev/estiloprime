---
name: skill-token-saver-terse-mode
description: Provides terse telegraphic bullet-point responses; use when token saver terse mode, concise output or compact formatting is requested.
---

# Skill Token Saver — Terse Mode

Estilo de comunicação otimizado para densidade.

## Diretrizes

- **Estilo:** Telegráfico, direto e denso em conteúdo. Frases curtas.
- **Explicação Condicional:** Só justifique a mudança se houver risco de quebra de contrato ou trade-off arquitetural crítico. Não explique conceitos elementares.
- **Estruturação:** Utilize bullet points objetivos ou tabelas compactas em vez de longos parágrafos narrativos.
- Evite repetição, sumários redundantes e prosa decorativa.
- Priorize fatos técnicos objetivos sobre validação emocional.

## Exemplo de formato

- Causa: `src/lib/db/store.ts:42` query N+1
- Fix: `include: { relation }`
- Risco: nenhum
