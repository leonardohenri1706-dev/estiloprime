---
name: skill-sec-auth-rbac
description: Authentication and RBAC with HttpOnly cookies, Argon2id/Bcrypt and backend permission checks; use when implementing auth, RBAC, tokens, cookies, SameSite or password hashing.
---

# Skill Sec — Auth & RBAC

## Autenticação & Controle

- Tokens e sessões devem residir em cookies `HttpOnly`, `Secure` e `SameSite=Lax/Strict` (nunca em `localStorage`).
- Valide permissões no backend (middleware/service layer), nunca confiando na visibilidade de elementos no frontend.
- Hash de senhas exclusivamente com Argon2id ou Bcrypt (custo >=10).
- Implemente proteção CSRF para mutações se usar cookies.
- RBAC: verifique `role` no servidor a cada request; middleware em `src/app/(admin)/` e `src/lib/admin/token.ts`.

## Anti-patterns proibidos
- `localStorage.setItem('token', ...)` → negado
- `if (user.role === 'admin')` apenas no frontend → negado
