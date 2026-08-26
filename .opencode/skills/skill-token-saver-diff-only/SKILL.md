---
name: skill-token-saver-diff-only
description: Enforces surgical diff-only edits with minimal context; use ONLY when editing files, patching, diff, token economy or avoiding full file rewrites.
---

# Skill Token Saver — Diff Only

Regra de ouro para economia de tokens e contexto.

## Diretrizes

- **NUNCA** reescreva arquivos inteiros se apenas algumas linhas/funções foram modificadas.
- **Formato Cirúrgico:** Forneça apenas o bloco de código modificado com contexto mínimo de localização ou via patch/diff.
- **Zero Ruído:** Não adicione saudações ("Olá!"), encerramentos ("Espero ter ajudado") ou anúncios óbvios ("Aqui está o código:").
- Use `edit` com `oldString` mínimo e preciso; prefira `replaceAll` apenas quando intencional.
- Para múltiplas alterações, faça edits sequenciais cirúrgicos em vez de `write` completo.
- Valide com `read` antes e depois do diff para garantir precisão.

## Quando aplicar
Ativo em 100% das edições neste projeto. Qualquer resposta que modifique código deve seguir este formato.
