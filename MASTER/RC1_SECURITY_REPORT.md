================================================================================
JARBAS 2.0 — SECURITY REPORT (RC1)
================================================================================
Data: 2026-07-13
================================================================================

## RESUMO EXECUTIVO

| Severidade | Quantidade |
|------------|------------|
| CRITICO | 6 |
| ALTO | 10 |
| MEDIO | 8 |
| BAIXO | 2 |
| **TOTAL** | **26** |

## PROBLEMAS CRITICOS

### S-01: Secrets Expostos
- **Local:** .env
- **Risco:** Chaves de API para 5 provedores de IA
- **Acao:** Rodar chaves imediatamente, usar Vault

### S-02: Senhas SHA-256
- **Local:** auth-service/src/index.ts
- **Risco:** Brute force facilitado
- **Acao:** Migrar para bcrypt (cost 12+)

### S-03: JWT Timing Attack
- **Local:** auth-service/src/index.ts:133
- **Risco:** Assinatura JWT dedutivel
- **Acao:** Usar crypto.timingSafeEqual

### S-04: JWT Secret Default
- **Local:** shared/config/src/index.ts:33
- **Risco:** Token forjavel
- **Acao:** Obrigar JWT_SECRET no startup

### S-05: Sem Rate Limiting
- **Local:** api-gateway
- **Risco:** Brute force, DDoS
- **Acao:** Instalar express-rate-limit

### S-06: CORS Aberto
- **Local:** api-gateway:16
- **Risco:** CSRF, data exfiltration
- **Acao:** Configurar origens explicitas

## PROBLEMAS ALTOS

| # | Problema | Localizacao |
|---|----------|-------------|
| S-07 | Sem Helmet (security headers) | api-gateway |
| S-08 | Auth in-memory (nao persistente) | auth-service |
| S-09 | Sem MFA | Todo o projeto |
| S-10 | RBAC nao enforce | api-gateway |
| S-11 | RLS muito permissivo | database/migrations |
| S-12 | Encrypt/Decrypt fake | whatsapp-ai, email-ai |
| S-13 | Sem HTTPS | api-gateway, docker |
| S-14 | Sem input validation | api-gateway |
| S-15 | JWT 7 dias (muito longo) | auth-service |
| S-16 | Erros leakam detalhes internos | api-gateway |

## PROBLEMAS MEDIOS

| # | Problema | Localizacao |
|---|----------|-------------|
| S-17 | Container como root | Dockerfile |
| S-18 | Redis/Qdrant sem auth | docker-compose |
| S-19 | SQL injection risk | supabase-client |
| S-20 | Rate limit in-memory | whatsapp-ai, email-ai |
| S-21 | Sem audit trail | api-gateway |
| S-22 | Body limit 10MB | api-gateway |
| S-23 | Sem ABAC | Todo o projeto |
| S-24 | HTTP em producao | config |

## SCORE DE SEGURANCA

| Aspecto | Nota |
|---------|------|
| Autenticacao | 4/10 |
| Autorizacao | 3/10 |
| Criptografia | 4/10 |
| Rate Limiting | 2/10 |
| Audit | 2/10 |
| Input Validation | 3/10 |
| **Total** | **3.0/10** |

## ACOES IMEDIATAS

1. Rodar todas as chaves de API
2. Migrar para bcrypt
3. Instalar helmet + rate-limit
4. Fixar JWT timing attack
5. Remover default JWT secret

================================================================================
*Security Report — RC1*
================================================================================
