---
name: skill-sec-input-validation-owasp
description: OWASP input validation, XSS, SQL injection and path traversal prevention; use when securing inputs, OWASP, XSS, DOMPurify, parametrized queries or path.basename.
---

# Skill Sec — Input Validation (OWASP)

## Prevenção OWASP

- Valide payloads usando schemas estritos no backend (Zod `parse` / Pydantic) antes de qualquer processamento.
- Sanitize saídas HTML dinâmicas contra XSS (evite `dangerouslySetInnerHTML` sem DOMPurify; prefira texto puro).
- Use consultas parametrizadas ou ORMs em 100% dos acessos ao banco para evitar SQL Injection (Prisma já parametriza; nunca concatene SQL).
- Trate caminhos de arquivos com `path.basename` e restrinja diretórios para impedir Path Traversal (allowlist de diretórios).
- Normalize e limite tamanho de payloads; rejeite tipos inesperados.

## Neste projeto
- Schemas: `src/lib/schemas/admin.schema.ts`, `src/lib/schemas/lead.schema.ts`
- Actions: `src/app/actions/lead.ts` e `src/lib/actions/` → valide na primeira linha.
