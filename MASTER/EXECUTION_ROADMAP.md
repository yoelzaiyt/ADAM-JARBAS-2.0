# JARBAS 2.0 — EXECUTION ROADMAP

**Data:** 2026-07-13
**Classification:** CONFIDENTIAL
**Horizonte:** 6 semanas (~30 dias úteis)

---

## 1. VISÃO GERAL DO ROADMAP

```
SEMANA 1          SEMANA 2          SEMANA 3          SEMANA 4          SEMANA 5          SEMANA 6
├── FASE 1 ──────┤
│   Crítico       │
│   (2 dias)      │
│                 ├── FASE 2 ──────────────────────┤
│                 │   Segurança Enterprise          │
│                 │   (4 dias)                      │
│                 │                                 ├── FASE 3 ──────────────────────┤
│                 │                                 │   Performance                    │
│                 │                                 │   (5 dias)                      │
│                 │                                 │                                 ├── FASE 4 ──────────────────────────────┤
│                 │                                 │                                 │   Escalabilidade                        │
│                 │                                 │                                 │   (5 dias)                              │
│                 │                                 │                                 │                                         ├── FASE 5 ──────┤
│                 │                                 │                                 │                                         │   Qualidade     │
│                 │                                 │                                 │                                         │   (2 dias)      │
│                 │                                 │                                 │                                         │                 ├── FASE 6 ──────┤
│                 │                                 │                                 │                                         │                 │   Docs (2d)     │
│                 │                                 │                                 │                                         │                 │                 ├── FASE 7 ──────────────────────┤
│                 │                                 │                                 │                                         │                 │                 │   Testes (5d)                  │
│                 │                                 │                                 │                                         │                 │                 │                                 ├── FASE 8 ──────┤
│                 │                                 │                                 │                                         │                 │                 │                                 │   RC1 (2d)     │
```

---

## 2. FASE 1 — CORREÇÕES CRÍTICAS

**Duração:** Dias 1-2 (Segunda-Terça)
**Objetivo:** Eliminar bloqueadores de produção
**Score:** 36 → 50/100

| Dia | Tarefa | Responsável | Dependências |
|-----|--------|-------------|--------------|
| D1-AM | Rotacionar chaves de API | DevOps | Nenhuma |
| D1-AM | Migrar senhas para bcrypt | Backend | Nenhuma |
| D1-PM | Fixar JWT timing attack | Backend | Nenhuma |
| D1-PM | Remover JWT secret hardcoded | Backend | Nenhuma |
| D1-PM | Configurar CORS explícito | Backend | Nenhuma |
| D2-AM | Instalar express-rate-limit | Backend | Nenhuma |
| D2-AM | Instalar helmet | Backend | Nenhuma |
| D2-PM | Obrigar JWT_SECRET no startup | Backend | Nenhuma |
| D2-PM | Testes de validação | QA | Todas acima |

**Gate de Qualidade:** Todas as 8 ações validadas em staging antes de merge.

---

## 3. FASE 2 — SEGURANÇA ENTERPRISE

**Duração:** Semana 1 (Quinta-Sexta + Segunda-Terça da semana 2)
**Objetivo:** Postura de segurança enterprise
**Score:** 50 → 65/100

| Dia | Tarefa | Responsável | Dependências |
|-----|--------|-------------|--------------|
| D3-AM | Input validation com Zod | Backend | Fase 1 |
| D3-PM | JWT lifetime reduction | Backend | Fase 1 |
| D3-PM | Refresh token rotation | Backend | Fase 1 |
| D4-AM | Generic error responses | Backend | Nenhuma |
| D4-PM | HTTPS enforcement | DevOps | Nenhuma |
| D5-AM | Container non-root | DevOps | Nenhuma |
| D5-PM | Redis/Qdrant auth | DevOps | Nenhuma |
| D6-8 | Audit trail básico | Backend | Nenhuma |
| D9-AM | Body limit 1MB | Backend | Nenhuma |
| D9-PM | Content Security Policy | Backend | Nenhuma |

**Gate de Qualidade:** Security scan sem findings CRÍTICOS.

---

## 4. FASE 3 — PERFORMANCE

**Duração:** Semanas 2-3
**Objetivo:** Eliminar gargalos de performance
**Score:** 65 → 72/100

| Dia | Tarefa | Responsável | Dependências |
|-----|--------|-------------|--------------|
| D10-11 | Conectar auth-service ao PostgreSQL | Backend | Fase 2 |
| D12-13 | Conectar cost-optimizer ao PostgreSQL | Backend | Fase 2 |
| D14-15 | Conectar analytics-engine ao PostgreSQL | Backend | Fase 2 |
| D16-AM | Connection pooling | Backend | Dias 10-15 |
| D16-PM | Chat stats via SQL | Backend | Dias 10-15 |
| D17-18 | Pagination em todas as listas | Backend | Nenhuma |
| D19-AM | Compression gzip | Backend | Nenhuma |
| D19-PM | Rolling window analytics | Backend | Dias 14-15 |

**Gate de Qualidade:** Zero OOM em testes de carga, response time < 200ms.

---

## 5. FASE 4 — ESCALABILIDADE

**Duração:** Semanas 3-4
**Objetivo:** Multi-tenant e horizontal scaling
**Score:** 72 → 78/100

| Dia | Tarefa | Responsável | Dependências |
|-----|--------|-------------|--------------|
| D20-21 | Migrar agent-manager ao PostgreSQL | Backend | Fase 3 |
| D22 | Migrar skill-manager ao PostgreSQL | Backend | Fase 3 |
| D23 | Migrar prompt-engine ao PostgreSQL | Backend | Fase 3 |
| D24 | Corrigir RLS policies | DBA | Fase 3 |
| D25-26 | Criar migrations 002-005 | DBA | Fase 3 |
| D27-28 | Implementar event bus | Backend | Fase 3 |
| D29 | Conectar Memory Manager ao PostgreSQL | Backend | Fase 3 |
| D30 | Testes de horizontal scaling | QA | Todas acima |

**Gate de Qualidade:** 2 instâncias rodando, RLS funcionando, event bus operacional.

---

## 6. FASE 5 — QUALIDADE

**Duração:** Semana 5
**Objetivo:** Elevar padrões de código
**Score:** 78 → 82/100

| Dia | Tarefa | Responsável | Dependências |
|-----|--------|-------------|--------------|
| D31-AM | Configurar ESLint strict | Backend | Nenhuma |
| D31-PM | Remover `as any` | Backend | Nenhuma |
| D32-AM | Fixar catch blocks vazios | Backend | Nenhuma |
| D32-PM | Extrair security-core | Backend | Nenhuma |
| D33-AM | Padronizar Vitest | Backend | Nenhuma |
| D33-PM | Aumentar coverage thresholds | Backend | Nenhuma |
| D34 | Type safety em auth middleware | Backend | Nenhuma |

---

## 7. FASE 6 — DOCUMENTAÇÃO

**Duração:** Semana 5 (paralelo com Fase 5)
**Objetivo:** Documentação completa
**Score:** 82 → 85/100

| Dia | Tarefa | Responsável | Dependências |
|-----|--------|-------------|--------------|
| D31-33 | Criar OpenAPI spec | Backend | Fase 4 |
| D34 | Criar runbooks | DevOps | Fase 4 |
| D35-AM | Atualizar README | Backend | Nenhuma |
| D35-PM | Criar CONTRIBUTING.md | Backend | Nenhuma |

---

## 8. FASE 7 — TESTES

**Duração:** Semana 6
**Objetivo:** Cobertura mínima 70%
**Score:** 85 → 88/100

| Dia | Tarefa | Responsável | Dependências |
|-----|--------|-------------|--------------|
| D36-37 | Testes auth-service | QA | Fase 4 |
| D38-39 | Testes api-gateway | QA | Fase 4 |
| D40 | Testes cost-optimizer | QA | Fase 3 |
| D41 | Testes analytics-engine | QA | Fase 3 |
| D42-43 | Testes de integração | QA | Fase 4 |
| D44 | Testes de segurança | QA | Fase 2 |

---

## 9. FASE 8 — RELEASE CANDIDATE

**Duração:** Semana 6 (final)
**Objetivo:** Validação final
**Score:** 88 → 90/100

| Dia | Tarefa | Responsável | Dependências |
|-----|--------|-------------|--------------|
| D45 | CI/CD pipeline | DevOps | Todas fases |
| D46-AM | Staging environment | DevOps | Todas fases |
| D46-PM | Smoke tests | QA | Todas fases |
| D47 | RC1 checklist validation | CTO | Todas fases |
| D48 | Release notes | Backend | Todas fases |

---

## 10. HITOS CRÍTICOS

| Hito | Data | Critério | Decisão |
|------|------|----------|---------|
| H1 | Dia 2 | Fase 1 completa | Avançar / Parar |
| H2 | Dia 9 | Fase 2 completa | Avançar / Parar |
| H3 | Dia 19 | Fase 3 completa | Avançar / Parar |
| H4 | Dia 30 | Fase 4 completa | Avançar / Parar |
| H5 | Dia 35 | Fases 5+6 completas | Avançar / Parar |
| H6 | Dia 44 | Fase 7 completa | Avançar / Parar |
| H7 | Dia 48 | RC1 pronto | CERTIFICAR / REJEITAR |

---

## 11. RECURSOS NECESSÁRIOS

| Recurso | Qtd | Período | Justificativa |
|---------|-----|---------|---------------|
| Backend Developer (Sr) | 1 | 6 semanas | Principal implementador |
| Backend Developer (Pl) | 1 | 4 semanas | Suporte Fases 3-4 |
| DevOps Engineer | 0.5 | 3 semanas | Infraestrutura, CI/CD |
| QA Engineer | 0.5 | 2 semanas | Testes Fases 7-8 |
| DBA | 0.25 | 2 semanas | Migrations, RLS |
| **Total** | **~2.75 FTE** | **6 semanas** | — |

---

*Execution Roadmap — CTO Enterprise Mode*
