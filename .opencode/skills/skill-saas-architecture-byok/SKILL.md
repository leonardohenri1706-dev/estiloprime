---
name: skill-saas-architecture-byok
description: SaaS BYOK architecture with server-side LLM calls, tenant isolation and rate limiting; use when implementing BYOK, multi-tenant, LLM API or tenant_id isolation.
---

# Skill SaaS Architecture — BYOK

## Diretrizes SaaS & IA

- Em fluxos BYOK (Bring Your Own Key) e chamadas a modelos de IA, execute todas as requisições server-side; nunca exponha chaves no cliente.
- Isole os dados de cada usuário/organização por `tenant_id` ou `user_id` em todas as operações de banco (where clause obrigatório).
- Implemente tratamento de rate limit (HTTP 429), retries com backoff exponencial e sanitização das respostas de LLMs antes de persistir.
- Valide `tenant_id` extraído de sessão/token, nunca de payload do cliente.
- Logue uso de tokens/custo por tenant para auditoria.
- Use `HttpOnly` cookies para sessão; chaves BYOK criptografadas at-rest.
