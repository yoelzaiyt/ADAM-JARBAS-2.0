# JARBAS 2.0 — REMEDIATION PLAN

**Data:** 2026-07-13
**Classification:** CONFIDENTIAL
**Scope:** Enterprise-wide remediation based on validated audit findings

---

## 1. ESCOPO

Este plano cobre a remediação de **55 problemas** identificados pela auditoria enterprise do JARBAS 2.0, abrangendo segurança, arquitetura, banco de dados, performance, qualidade, testes, documentação e compliance.

**NÃO cobre:** Novas funcionalidades, redesign de UX, mudanças de framework, ou features não existentes.

---

## 2. PREMISSAS

| # | Premissa |
|---|----------|
| P1 | O time de desenvolvimento tem 2-3 devs disponíveis |
| P2 | Não haverá freeze de código durante a remediação |
| P3 | As mudanças serão incrementais e testadas antes de merge |
| P4 | O sistema atual funciona em desenvolvimento (não em produção) |
| P5 | Supabase, Redis e Qdrant estão disponíveis para testes |

---

## 3. FASE 1 — CORREÇÕES CRÍTICAS (Dias 1-2)

**Objetivo:** Eliminar todos os bloqueadores de produção.
**Score esperado:** 36 → 50/100

### 3.1 Ações

| # | Ação | Arquivos | Esforço |
|---|------|----------|---------|
| 1.1 | Rotacionar todas as chaves de API expostas | .env, providers | 1h |
| 1.2 | Migrar senhas SHA-256 para bcrypt (cost 12) | auth-service/index.ts | 2h |
| 1.3 | Fixar JWT timing attack (crypto.timingSafeEqual) | auth-service/index.ts | 1h |
| 1.4 | Remover JWT secret hardcoded, obrigar env var | shared/config/index.ts | 1h |
| 1.5 | Configurar CORS com origens explícitas | api-gateway/index.ts | 1h |
| 1.6 | Instalar e configurar express-rate-limit | api-gateway/index.ts | 2h |
| 1.7 | Instalar e configurar helmet | api-gateway/index.ts | 1h |
| 1.8 | Obrigar JWT_SECRET no startup (throw se ausente) | shared/config/index.ts | 1h |

**Total Fase 1:** 10h (~1.5 dias) ✅ **CONCLUÍDO** (2026-07-13)

### 3.2 Critérios de Aceite

- [x] Nenhuma chave de API hardcoded no código (SEC-01: Supabase URL/Key removidos)
- [x] bcrypt instalado e usado em todas as rotas de senha (SEC-02: SHA-256 → bcrypt cost 12)
- [x] JWT signature comparada com timingSafeEqual (SEC-03: crypto.timingSafeEqual)
- [x] JWT_SECRET obrigatório (app não inicia sem ele) (SEC-04: env('JWT_SECRET') sem fallback)
- [x] CORS restrito a origens configuráveis (SEC-05: CORS_ORIGINS via env)
- [x] Rate limiting ativo em todos os endpoints (SEC-06: global 100/min + auth 5/min)
- [x] Helmet retornando headers de segurança (SEC-07: helmet middleware)
- [x] JWT lifetime reduzido para 15min access + 7d refresh (SEC-08)

### 3.3 Rollback

Reverter os 8 commits. O sistema volta ao estado anterior (funcional mas inseguro).

---

## 4. FASE 2 — SEGURANÇA ENTERPRISE (Semana 1)

**Objetivo:** Alcançar postura de segurança enterprise.
**Score esperado:** 50 → 65/100

### 4.1 Ações

| # | Ação | Arquivos | Esforço |
|---|------|----------|---------|
| 2.1 | Implementar input validation com Zod | api-gateway/* | 4h |
| 2.2 | Reduzir JWT lifetime para 15min (access) + 7d (refresh) | auth-service/index.ts | 2h |
| 2.3 | Implementar refresh token rotation | auth-service/index.ts | 4h |
| 2.4 | Generic error responses (não leakar stack traces) | api-gateway/index.ts | 2h |
| 2.5 | Adicionar HTTPS enforcement | api-gateway, docker | 2h |
| 2.6 | Container sem root user | Dockerfile | 1h |
| 2.7 | Adicionar auth ao Redis e Qdrant | docker-compose.yml | 2h |
| 2.8 | Implementar audit trail básico | shared/audit | 8h |
| 2.9 | Reduzir body limit para 1MB | api-gateway/index.ts | 0.5h |
| 2.10 | Adicionar Content Security Policy | api-gateway | 2h |

**Total Fase 2:** 27.5h (~3.5 dias)

### 4.2 Critérios de Aceite

- [ ] Todas as rotas com validação Zod
- [ ] Access token expira em 15min
- [ ] Refresh token rotation funcional
- [ ] Erros genéricos ao cliente
- [ ] HTTPS em produção
- [ ] Containers rodando como non-root
- [ ] Redis e Qdrant com autenticação
- [ ] Audit log para operações sensíveis

---

## 5. FASE 3 — PERFORMANCE (Semana 2)

**Objetivo:** Eliminar gargalos de performance e memória.
**Score esperado:** 65 → 72/100

### 5.1 Ações

| # | Ação | Arquivos | Esforço |
|---|------|----------|---------|
| 3.1 | Conectar auth-service ao PostgreSQL | auth-service/* | 8h |
| 3.2 | Conectar cost-optimizer ao PostgreSQL | cost-optimizer/* | 6h |
| 3.3 | Conectar analytics-engine ao PostgreSQL | analytics-engine/* | 6h |
| 3.4 | Implementar connection pooling | supabase-client | 4h |
| 3.5 | Chat stats via SQL aggregation | supabase-client | 2h |
| 3.6 | Implementar pagination em todas as listas | api-gateway/* | 4h |
| 3.7 | Adicionar compression (gzip) | api-gateway/index.ts | 1h |
| 3.8 | Rolling window para analytics (não 100k array) | analytics-engine | 2h |

**Total Fase 3:** 33h (~4 dias)

### 5.2 Critérios de Aceite

- [ ] auth-service persiste em PostgreSQL (não em memória)
- [ ] cost-optimizer persiste em PostgreSQL
- [ ] analytics-engine persiste em PostgreSQL
- [ ] Connection pooling ativo
- [ ] Chat stats calculados via SQL
- [ ] Todas as listas paginadas
- [ ] Respostas comprimidas com gzip
- [ ] Analytics com rolling window (não array ilimitado)

---

## 6. FASE 4 — ESCALABILIDADE (Semanas 3-4)

**Objetivo:** Preparar para multi-tenant e horizontal scaling.
**Score esperado:** 72 → 78/100

### 6.1 Ações

| # | Ação | Arquivos | Esforço |
|---|------|----------|---------|
| 4.1 | Migrar agent-manager para PostgreSQL | agent-manager/* | 6h |
| 4.2 | Migrar skill-manager para PostgreSQL | skill-manager/* | 4h |
| 4.3 | Migrar prompt-engine para PostgreSQL | prompt-engine/* | 4h |
| 4.4 | Corrigir RLS policies (tenant_id isolation) | migrations/* | 4h |
| 4.5 | Criar migration 002_add_models.sql | migrations/* | 4h |
| 4.6 | Criar migration 003_add_knowledge.sql | migrations/* | 4h |
| 4.7 | Criar migration 004_add_integrations.sql | migrations/* | 4h |
| 4.8 | Implementar event bus entre módulos | shared/event-bus | 8h |
| 4.9 | Conectar Memory Manager ao PostgreSQL (parcial) | memory-manager | 4h |

**Total Fase 4:** 42h (~5 dias)

### 6.2 Critérios de Aceite

- [ ] Todos os módulos core persistidos em PostgreSQL
- [ ] RLS com isolamento por tenant_id
- [ ] 4 migrations criadas e testadas
- [ ] Event bus funcional entre módulos
- [ ] Horizontal scaling testado (2 instâncias)

---

## 7. FASE 5 — QUALIDADE (Semana 5)

**Objetivo:** Elevar padrões de código e manutenibilidade.
**Score esperado:** 78 → 82/100

### 7.1 Ações

| # | Ação | Arquivos | Esforço |
|---|------|----------|---------|
| 5.1 | Configurar ESLint com regras strict | .eslintrc | 2h |
| 5.2 | Remover todos os `as any` | Todo o projeto | 4h |
| 5.3 | Fixar catch blocks vazios | Todo o projeto | 2h |
| 5.4 | Extrair security-core compartilhado | shared/security-core | 4h |
| 5.5 | Padronizar framework de teste (Vitest) | vision-engine | 2h |
| 5.6 | Aumentar coverage thresholds (80% stmt, 70% branch) | vitest.config.ts | 1h |
| 5.7 | Adicionar type safety em auth middleware | api-gateway | 2h |

**Total Fase 5:** 17h (~2 dias)

---

## 8. FASE 6 — DOCUMENTAÇÃO (Semana 5)

**Objetivo:** Documentação completa para manutenção e onboarding.
**Score esperado:** 82 → 85/100

### 8.1 Ações

| # | Ação | Arquivos | Esforço |
|---|------|----------|---------|
| 6.1 | Criar OpenAPI/Swagger spec | docs/openapi.yaml | 8h |
| 6.2 | Criar runbooks de operação | docs/runbooks/* | 4h |
| 6.3 | Atualizar README.md com instruções completas | README.md | 2h |
| 6.4 | Criar CONTRIBUTING.md | CONTRIBUTING.md | 1h |

**Total Fase 6:** 15h (~2 dias)

---

## 9. FASE 7 — TESTES (Semana 6)

**Objetivo:** Cobertura mínima de 70% com testes críticos.
**Score esperado:** 85 → 88/100

### 9.1 Ações

| # | Ação | Arquivos | Esforço |
|---|------|----------|---------|
| 7.1 | Testes unitários auth-service | auth-service/*.test.ts | 8h |
| 7.2 | Testes unitários api-gateway | api-gateway/*.test.ts | 8h |
| 7.3 | Testes unitários cost-optimizer | cost-optimizer/*.test.ts | 4h |
| 7.4 | Testes unitários analytics-engine | analytics-engine/*.test.ts | 4h |
| 7.5 | Testes de integração (auth + gateway) | tests/integration/* | 8h |
| 7.6 | Testes de segurança (SAST básico) | tests/security/* | 4h |

**Total Fase 7:** 36h (~4.5 dias)

---

## 10. FASE 8 — RELEASE CANDIDATE (Semana 6)

**Objetivo:** Validação final e准备 para produção.
**Score esperado:** 88 → 90/100

### 10.1 Ações

| # | Ação | Arquivos | Esforço |
|---|------|----------|---------|
| 8.1 | CI/CD pipeline (GitHub Actions) | .github/workflows/* | 4h |
| 8.2 | Staging environment | docker-compose.staging.yml | 2h |
| 8.3 | Smoke tests automatizados | tests/smoke/* | 4h |
| 8.4 | RC1 checklist validation | MASTER/RC1_CHECKLIST.md | 2h |
| 8.5 | Release notes | CHANGELOG.md | 1h |

**Total Fase 8:** 13h (~1.5 dias)

---

## 11. RESUMO DE ESFORÇO

| Fase | Esforço | Dias | Score Alvo |
|------|---------|------|------------|
| Fase 1 — Crítico | 10h | 1.5 | 50 |
| Fase 2 — Segurança | 27.5h | 3.5 | 65 |
| Fase 3 — Performance | 33h | 4 | 72 |
| Fase 4 — Escalabilidade | 42h | 5 | 78 |
| Fase 5 — Qualidade | 17h | 2 | 82 |
| Fase 6 — Documentação | 15h | 2 | 85 |
| Fase 7 — Testes | 36h | 4.5 | 88 |
| Fase 8 — RC1 | 13h | 1.5 | 90 |
| **TOTAL** | **193.5h** | **~24 dias** | **90/100** |

---

## 12. DEPENDÊNCIAS ENTRE FASES

```
Fase 1 (Crítico)
    │
    ├──→ Fase 2 (Segurança) ←── requer Fase 1
    │         │
    │         ├──→ Fase 3 (Performance) ←── requer Fase 2
    │         │         │
    │         │         ├──→ Fase 4 (Escalabilidade) ←── requer Fase 3
    │         │         │         │
    │         │         │         ├──→ Fase 5 (Qualidade) ←── pode paralelo
    │         │         │         ├──→ Fase 6 (Documentação) ←── pode paralelo
    │         │         │         │
    │         │         │         └──→ Fase 7 (Testes) ←── requer Fase 4
    │         │         │                   │
    │         │         │                   └──→ Fase 8 (RC1) ←── requer Fase 7
```

---

*Remediation Plan — CTO Enterprise Mode*
