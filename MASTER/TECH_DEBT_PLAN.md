# JARBAS 2.0 — TECH DEBT PLAN

**Data:** 2026-07-13
**Classification:** CONFIDENTIAL
**Auditor:** QA Lead + Enterprise Software Architect

---

## 1. RESUMO DE TECH DEBT

| Categoria | Itens | Esforço Total | Impacto |
|-----------|-------|---------------|---------|
| Segurança | 10 | 46h | Crítico |
| Arquitetura | 6 | 50h | Alto |
| Banco de Dados | 5 | 40h | Alto |
| Performance | 8 | 32h | Alto |
| Qualidade | 8 | 26h | Médio |
| Documentação | 4 | 14h | Médio |
| Testes | 6 | 36h | Médio |
| DevOps | 3 | 10h | Médio |
| Integração | 3 | 24h | Médio |
| **TOTAL** | **53** | **278h** | — |

---

## 2. TECH DEBT CRÍTICO (Fase 1)

### TD-01: Chaves de API Expostas
- **Esforço:** 1h
- **Impacto:** Roubo de credenciais, custos financeiros
- **Ação:** Rotacionar chaves, remover defaults hardcoded

### TD-02: Senhas SHA-256
- **Esforço:** 2h
- **Impacto:** Brute force trivial, takeover de conta
- **Ação:** Migrar para bcrypt cost 12

### TD-03: JWT Timing Attack
- **Esforço:** 1h
- **Impacto:** Assinatura JWT dedutível
- **Ação:** crypto.timingSafeEqual

### TD-04: JWT Secret Hardcoded
- **Esforço:** 1h
- **Impacto:** Token forjável
- **Ação:** Obrigar env var no startup

### TD-05: CORS Wide Open
- **Esforço:** 1h
- **Impacto:** CSRF, data exfiltration
- **Ação:** Configurar origens explícitas

### TD-06: Zero Rate Limiting
- **Esforço:** 2h
- **Impacto:** DDoS, brute force
- **Ação:** express-rate-limit

### TD-07: Sem Helmet
- **Esforço:** 1h
- **Impacto:** XSS, clickjacking
- **Ação:** helmet()

### TD-08: JWT 7 Dias
- **Esforço:** 2h
- **Impacto:** Janela de ataque enorme
- **Ação:** Reduzir para 15min

**Total Fase 1:** 11h

---

## 3. TECH DEBT ALTO (Fase 2)

### TD-09: Auth In-Memory
- **Esforço:** 8h
- **Módulo:** auth-service
- **Ação:** Migrar para PostgreSQL

### TD-10: Sem Input Validation
- **Esforço:** 4h
- **Módulo:** api-gateway
- **Ação:** Zod em todas as rotas

### TD-11: Erros Leakam Detalhes
- **Esforço:** 4h
- **Módulo:** api-gateway
- **Ação:** Generic error handler

### TD-12: Sem HTTPS
- **Esforço:** 4h
- **Módulo:** api-gateway, docker
- **Ação:** TLS termination

### TD-13: Container Como Root
- **Esforço:** 1h
- **Módulo:** Dockerfile
- **Ação:** USER node

### TD-14: Redis/Qdrant Sem Auth
- **Esforço:** 2h
- **Módulo:** docker-compose
- **Ação:** Adicionar passwords

### TD-15: Sem MFA
- **Esforço:** 16h
- **Módulo:** auth-service
- **Ação:** TOTP implementation

### TD-16: RBAC Não Enforce
- **Esforço:** 8h
- **Módulo:** api-gateway
- **Ação:** Authorization middleware

### TD-17: Encrypt/Decrypt Fake
- **Esforço:** 4h
- **Módulo:** whatsapp-ai, email-ai
- **Ação:** AES-256-GCM real

### TD-18: Sem Audit Trail
- **Esforço:** 8h
- **Módulo:** api-gateway
- **Ação:** audit_logs table

**Total Fase 2:** 59h

---

## 4. TECH DEBT MÉDIO (Fases 3-4)

### Arquitetura

| TD | Descrição | Esforço | Ação |
|----|-----------|---------|------|
| TD-19 | HermesCore God Object | 16h | Decompor em módulos menores |
| TD-20 | Sem Dependency Injection | 12h | tsyringe ou inversify |
| TD-21 | Sem Repository Pattern | 8h | Extrair data access layer |
| TD-22 | Sem Event Bus | 8h | Implementar event-driven |

### Qualidade

| TD | Descrição | Esforço | Ação |
|----|-----------|---------|------|
| TD-23 | Sem ESLint | 4h | Configurar @typescript-eslint |
| TD-24 | Coverage Baixo | 16h | Aumentar para 80% |
| TD-25 | Core Packages Sem Testes | 8h | Testes unitários |
| TD-26 | Excesso `as any` | 4h | Tipar corretamente |
| TD-27 | Catch Blocks Vazios | 2h | Adicionar logging |
| TD-28 | Logger Async Mismatch | 2h | Corrigir tipos |

### Integração

| TD | Descrição | Esforço | Ação |
|----|-----------|---------|------|
| TD-29 | Eventos Não Conectados | 8h | Wire events |
| TD-30 | APIs Não Expostas | 8h | Criar endpoints |

### DevOps

| TD | Descrição | Esforço | Ação |
|----|-----------|---------|------|
| TD-31 | Sem CI/CD | 4h | GitHub Actions |
| TD-32 | Sem Staging | 2h | docker-compose.staging |
| TD-33 | Sem Monitoring | 4h | Sentry + UptimeRobot |

**Total Fases 3-4:** 106h

---

## 5. TECH DEBT BAIXO (Fases 5-6)

| TD | Descrição | Esforço | Ação |
|----|-----------|---------|------|
| TD-34 | Sem OpenAPI Spec | 8h | Swagger/OpenAPI |
| TD-35 | Sem Runbooks | 4h | Criar documentação |
| TD-36 | Sem Changelog | 1h | CHANGELOG.md |
| TD-37 | Sem Contributing Guide | 1h | CONTRIBUTING.md |
| TD-38 | Sem Pagination | 4h | Cursor-based |
| TD-39 | Sem Compression | 1h | gzip middleware |
| TD-40 | Logger Ring Buffer | 2h | Circular buffer |
| TD-41 | Cache Eviction Batch | 4h | Batch eviction |
| TD-42 | Sem Code Splitting | 4h | Dynamic imports |
| TD-43 | Sem Lazy Loading | 2h | React.lazy |
| TD-44 | Sem Commit Conventions | 1h | Conventional commits |

**Total Fases 5-6:** 32h

---

## 6. EVOLUÇÃO DO TECH DEBT

### Estado Atual
```
Tech Debt Score: 278h (~35 dias úteis)
Distribuição:
  Crítico:  11h  (4%)
  Alto:     59h  (21%)
  Médio:   106h  (38%)
  Baixo:    32h  (12%)
  Code:     70h  (25%) ← testes e qualidade
```

### Estado Alvo (após remediação)
```
Tech Debt Score: < 20h (manutenção contínua)
Distribuição esperada:
  Crítico:  0h
  Alto:     0h
  Médio:    5h (manutenção)
  Baixo:   15h (melhorias contínuas)
```

---

## 7. MÉTRICAS DE TECH DEBT

| Métrica | Atual | Target | Fórmula |
|---------|-------|--------|---------|
| Tech Debt Ratio | 100% | < 10% | (horas debt / horas totais) × 100 |
| Debt por Pacote | 10.7h | < 1h | total debt / 26 pacotes |
| Hotspot de Debt | auth-service | Nenhum | módulo com mais issues |
| Debt New/Removed | 0/0 | > 1.0 | novos / removidos por sprint |

---

## 8. CHECKLIST DE TECH DEBT

- [ ] Fase 1: 11h de tech debt crítico resolvido
- [ ] Fase 2: 59h de tech debt alto resolvido
- [ ] Fase 3: 50h de tech debt médio (arquitetura) resolvido
- [ ] Fase 4: 56h de tech debt médio (integração+devops) resolvido
- [ ] Fase 5: 32h de tech debt baixo resolvido
- [ ] Tech Debt Ratio < 10%
- [ ] Zero issues CRÍTICAS abertas
- [ ] Zero issues ALTAS abertas

---

*Tech Debt Plan — CTO Enterprise Mode*
