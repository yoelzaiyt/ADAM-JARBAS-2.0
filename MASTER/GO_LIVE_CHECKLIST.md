# JARBAS 2.0 — GO LIVE CHECKLIST

**Data:** 2026-07-13
**Classification:** CONFIDENTIAL
**Status:** 🔴 NÃO APTO — 48 itens pendentes

---

## 1. BLOQUEADORES DE PRODUÇÃO (Devem estar OK antes de qualquer deploy público)

### 🔴 SEGURANÇA CRÍTICA (15 itens)

| # | Item | Status | Owner | Evidência |
|---|------|--------|-------|-----------|
| S-01 | Chaves de API rotacionadas | ❌ | DevOps | .env verificado |
| S-02 | Senhas migradas para bcrypt | ❌ | Backend | auth-service testado |
| S-03 | JWT timing attack corrigido | ❌ | Backend | crypto.timingSafeEqual |
| S-04 | JWT secret obrigatório (sem default) | ❌ | Backend | Config validado |
| S-05 | CORS configurado com origens explícitas | ❌ | Backend | api-gateway testado |
| S-06 | Rate limiting ativo (100 req/min) | ❌ | Backend | express-rate-limit |
| S-07 | Helmet com todos os headers | ❌ | Backend | helmet() ativo |
| S-08 | JWT lifetime ≤ 15min | ❌ | Backend | auth-service config |
| S-09 | Input validation (Zod) em todas as rotas | ❌ | Backend | api-gateway |
| S-10 | Error handler genérico | ❌ | Backend | api-gateway |
| S-11 | HTTPS forçado em produção | ❌ | DevOps | docker + redirect |
| S-12 | Containers non-root | ❌ | DevOps | Dockerfile |
| S-13 | Redis/Qdrant com autenticação | ❌ | DevOps | docker-compose |
| S-14 | Sem vulnerabilidades CRÍTICAS no npm audit | ❌ | Backend | npm audit clean |
| S-15 | Secret scan (gitleaks) sem findings | ❌ | DevOps | gitleaks report |

### 🔴 BANCO DE DADOS (8 itens)

| # | Item | Status | Owner | Evidência |
|---|------|--------|-------|-----------|
| D-01 | PostgreSQL rodando e acessível | ⚠️ | DevOps | docker-compose |
| D-02 | auth-service persistindo em PostgreSQL | ❌ | Backend | teste de login |
| D-03 | RLS com isolamento por tenant | ❌ | DBA | SQL policies |
| D-04 | Migrations 002-005 criadas | ❌ | DBA | pnpm db:migrate |
| D-05 | Connection pooling configurado | ❌ | Backend | pg.Pool |
| D-06 | Backup automático configurado | ❌ | DevOps | pg_dump cron |
| D-07 | Audit trail funcional | ❌ | Backend | audit_logs |
| D-08 | Database schema validado | ❌ | DBA | pnpm db:validate |

### 🔴 PERFORMANCE (5 itens)

| # | Item | Status | Owner | Evidência |
|---|------|--------|-------|-----------|
| P-01 | Zero OOM em testes de carga | ❌ | QA | artillery report |
| P-02 | Response time p95 < 200ms | ❌ | QA | artillery report |
| P-03 | Memory usage < 512MB | ❌ | QA | clinic.js |
| P-04 | Todas as listas paginadas | ❌ | Backend | API test |
| P-05 | Compression gzip ativo | ❌ | Backend | headers verificados |

### 🔴 TESTES (5 itens)

| # | Item | Status | Owner | Evidência |
|---|------|--------|-------|-----------|
| T-01 | Coverage mínimo 60% | ❌ | QA | vitest report |
| T-02 | Auth-service com testes | ❌ | QA | auth/*.test.ts |
| T-03 | Api-gateway com testes | ❌ | QA | gateway/*.test.ts |
| T-04 | Zero testes falhando | ❌ | QA | pnpm test |
| T-05 | Smoke tests passando | ❌ | QA | tests/smoke/* |

---

## 2. ITENS RECOMENDADOS (Devem estar OK antes de escalar)

### 🟠 SEGURANÇA ALTA (5 itens)

| # | Item | Status | Owner |
|---|------|--------|-------|
| R-01 | MFA implementado | ❌ | Backend |
| R-02 | RBAC enforced em todas as rotas | ❌ | Backend |
| R-03 | Encryption at rest (AES-256) | ❌ | Backend |
| R-04 | Semantic versioning de API | ❌ | Backend |
| R-05 | ABAC para permissões granulares | ❌ | Backend |

### 🟠 QUALIDADE (7 itens)

| # | Item | Status | Owner |
|---|------|--------|-------|
| Q-01 | ESLint configurado e sem warnings | ❌ | Backend |
| Q-02 | Coverage thresholds ≥ 80% | ❌ | QA |
| Q-03 | Zero `as any` no código | ❌ | Backend |
| Q-04 | Zero catch blocks vazios | ❌ | Backend |
| Q-05 | Conventional commits | ❌ | Time |
| Q-06 | Code review obrigatório | ❌ | Time |
| Q-07 | No merge sem CI verde | ❌ | DevOps |

### 🟠 DEVOPS (5 itens)

| # | Item | Status | Owner |
|---|------|--------|-------|
| V-01 | CI/CD pipeline funcional | ❌ | DevOps |
| V-02 | Staging environment | ❌ | DevOps |
| V-03 | Monitoring (Sentry/UptimeRobot) | ❌ | DevOps |
| V-04 | Logging centralizado | ❌ | DevOps |
| V-05 | Alertas configurados | ❌ | DevOps |

### 🟠 DOCUMENTAÇÃO (4 itens)

| # | Item | Status | Owner |
|---|------|--------|-------|
| W-01 | OpenAPI/Swagger spec | ❌ | Backend |
| W-02 | Runbooks de operação | ❌ | DevOps |
| W-03 | README.md completo | ❌ | Backend |
| W-04 | CONTRIBUTING.md | ❌ | Backend |

---

## 3. MÉTRICAS DE SUCESSO

| Métrica | Meta | Atual |
|---------|------|-------|
| Score QAI | ≥ 60 (condicional), ≥ 80 (total) | 36/100 |
| Vulnerabilidades CRÍTICAS | 0 | 8 |
| Vulnerabilidades ALTAS | ≤ 5 | 10 |
| Coverage de testes | ≥ 60% | ~60% (pacotes core sem testes) |
| Response time p95 | ≤ 200ms | Não medido |
| Uptime | ≥ 99.5% | N/A |
| Erros 5xx | ≤ 0.1% | Não medido |
| Memory usage | ≤ 512MB | Variável |
| Tech Debt Ratio | ≤ 10% | 100% |

---

## 4. ASSINATURAS DE APROVAÇÃO

### Para Deploy em Produção

| Aprova | Responsável | Data | Assinatura |
|--------|-------------|------|------------|
| Segurança | __________ | ____/____/____ | __________ |
| Arquitetura | __________ | ____/____/____ | __________ |
| Qualidade | __________ | ____/____/____ | __________ |
| Banco de Dados | __________ | ____/____/____ | __________ |
| DevOps | __________ | ____/____/____ | __________ |
| CTO | __________ | ____/____/____ | __________ |

### Para Certificação RC1

| Critério | Status | Evidência |
|----------|--------|-----------|
| Score ≥ 60 | ❌ | Relatório QAI |
| Zero CRÍTICOS | ❌ | Security scan |
| Coverage ≥ 60% | ❌ | Vitest report |
| RLS funcional | ❌ | SQL policies |
| CI/CD ativo | ❌ | GitHub Actions |

---

## 5. PRÓXIMOS PASSOS IMEDIATOS

1. **HOJE:** Iniciar Fase 1 (Correções Críticas) — 11h
2. **AMANHÃ:** Validar Fase 1 em staging
3. **SEMANA 1:** Iniciar Fase 2 (Segurança Enterprise)
4. **SEMANA 2:** Iniciar Fase 3 (Performance)
5. **MÊS 1:** Completar Fases 1-4
6. **MÊS 2:** Completar Fases 5-8
7. **MÊS 2 (final):** Certificação RC1

---

*Go Live Checklist — CTO Enterprise Mode*
*Status: 🔴 NÃO APTO — 48 itens pendentes*
