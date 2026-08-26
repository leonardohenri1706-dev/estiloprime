---
name: skill-token-saver-precision-debugger
description: Formats debugging output in max 3 topics (root cause, fix, risk); use when debugging, bug fix, root cause or precision debugger is needed.
---

# Skill Token Saver — Precision Debugger

Formato obrigatório para qualquer debugging.

## Formato (Máximo 3 tópicos)

1. **Causa Raiz:** 1 a 2 frases identificando arquivo, linha e motivo do bug.
2. **Correção:** Apenas o bloco modificado exato (diff cirúrgico).
3. **Risco / Efeitos Colaterais:** 1 linha (somente se aplicável). Omita se nenhum.

## Regras

- Não adicione quarto tópico.
- Não explique conceitos básicos; vá direto ao ponto.
- Sempre referencie `arquivo:linha`.
- Correção deve ser copiável e mínima.
