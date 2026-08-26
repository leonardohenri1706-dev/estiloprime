---
name: skill-sec-api-secrets-guard
description: API secrets guard with env protection, rate limiting and defensive headers; use when handling secrets, .env, CSP, HSTS, rate limiting or secrets guard.
---

# Skill Sec — API Secrets Guard

## Segredos & Resiliência

- NUNCA versione credenciais ou `.env` no Git (use `.env.example` com placeholders).
- Configure rate limiting por IP/usuário em rotas sensíveis de login e APIs de LLM (ex: `429 Too Many Requests` + `Retry-After`).
- Implemente headers defensivos (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).
- Nunca retorne stack traces ou mensagens internas do banco para o cliente; use `error.code` genérico.
- Valide `process.env` no boot com Zod; falhe rápido se segredo ausente.
- Logs nunca devem imprimir segredos; use redaction.

## Neste projeto (Next.js)
- Headers em `next.config.mjs`
- Env validation em `src/lib/` ou `src/app/api/`
