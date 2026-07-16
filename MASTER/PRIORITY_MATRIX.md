# JARBAS 2.0 — PRIORITY MATRIX

**Data:** 2026-07-13
**Classification:** CONFIDENTIAL

---

## 1. MATRIZ DE PRIORIZAÇÃO COMPLETA

### Legenda Quick Win
- **Sim** = Pode ser feito em < 4h, impacto alto, sem dependências
- **Não** = Requer mais tempo ou dependências

---

## 2. ISSUES CRÍTICAS (P0)

| ID | Descrição | Cat | Sever | Impact | Prob | Complex | Tempo | Deps | Risco Prod | Risco Fin | Risco Seg | Risco Op | Prior | QW |
|----|-----------|-----|-------|--------|------|---------|-------|------|------------|-----------|-----------|----------|-------|----|
| SEC-01 | Chaves de API expostas | Segurança | CRÍTICO | 5 | 5 | 1 | 1h | Nenhuma | 5 | 5 | 5 | 4 | P0 | **Sim** |
| SEC-02 | Senhas SHA-256 | Segurança | CRÍTICO | 5 | 5 | 2 | 2h | Nenhuma | 5 | 3 | 5 | 5 | P0 | **Sim** |
| SEC-03 | JWT timing attack | Segurança | CRÍTICO | 4 | 4 | 1 | 1h | Nenhuma | 4 | 2 | 5 | 3 | P0 | **Sim** |
| SEC-04 | JWT secret hardcoded | Segurança | CRÍTICO | 5 | 5 | 1 | 1h | Nenhuma | 5 | 2 | 5 | 4 | P0 | **Sim** |
| SEC-05 | CORS wide open | Segurança | CRÍTICO | 5 | 4 | 1 | 1h | Nenhuma | 5 | 3 | 5 | 4 | P0 | **Sim** |
| SEC-06 | Zero rate limiting | Segurança | CRÍTICO | 5 | 5 | 2 | 2h | Nenhuma | 5 | 3 | 4 | 5 | P0 | **Sim** |
| DB-01 | RLS USING (true) | DB | CRÍTICO | 5 | 4 | 3 | 4h | Fase 3 | 5 | 2 | 5 | 5 | P0 | Não |
| PERF-01 | 100+ stores in-memory | Performance | CRÍTICO | 5 | 5 | 4 | 42h | Fase 3-4 | 5 | 2 | 3 | 5 | P0 | Não |

---

## 3. ISSUES ALTAS (P1)

| ID | Descrição | Cat | Sever | Impact | Prob | Complex | Tempo | Deps | Risco Prod | Risco Fin | Risco Seg | Risco Op | Prior | QW |
|----|-----------|-----|-------|--------|------|---------|-------|------|------------|-----------|-----------|----------|-------|----|
| SEC-07 | Sem Helmet | Segurança | ALTO | 4 | 4 | 1 | 1h | Nenhuma | 4 | 1 | 4 | 2 | P1 | **Sim** |
| SEC-08 | Auth in-memory | Segurança | ALTO | 4 | 5 | 3 | 8h | Fase 3 | 5 | 1 | 3 | 5 | P1 | Não |
| SEC-09 | Sem MFA | Segurança | ALTO | 3 | 3 | 4 | 16h | Fase 2 | 3 | 1 | 4 | 2 | P1 | Não |
| SEC-10 | RBAC não enforce | Segurança | ALTO | 4 | 4 | 3 | 8h | Fase 4 | 4 | 2 | 4 | 4 | P1 | Não |
| SEC-11 | Encrypt/decrypt fake | Segurança | ALTO | 4 | 3 | 2 | 4h | Nenhuma | 3 | 2 | 4 | 3 | P1 | Não |
| SEC-12 | Sem HTTPS | Segurança | ALTO | 4 | 3 | 2 | 4h | Nenhuma | 4 | 1 | 4 | 3 | P1 | **Sim** |
| SEC-13 | Input validation ausente | Segurança | ALTO | 4 | 4 | 2 | 4h | Nenhuma | 4 | 2 | 4 | 3 | P1 | **Sim** |
| SEC-14 | JWT 7 dias | Segurança | ALTO | 4 | 4 | 1 | 2h | Nenhuma | 4 | 2 | 4 | 3 | P1 | **Sim** |
| SEC-15 | Erros leakam detalhes | Segurança | ALTO | 3 | 3 | 2 | 4h | Nenhuma | 3 | 1 | 3 | 2 | P1 | **Sim** |
| SEC-16 | Container como root | Segurança | ALTO | 3 | 3 | 1 | 1h | Nenhuma | 3 | 1 | 3 | 2 | P1 | **Sim** |
| SEC-17 | Redis/Qdrant sem auth | Segurança | ALTO | 3 | 3 | 1 | 2h | Nenhuma | 3 | 1 | 3 | 3 | P1 | **Sim** |
| PERF-02 | Analytics unbounded | Performance | ALTO | 4 | 4 | 2 | 2h | Fase 3 | 4 | 1 | 1 | 4 | P1 | Não |
| PERF-03 | Cost history O(n) | Performance | ALTO | 3 | 3 | 2 | 2h | Fase 3 | 3 | 1 | 1 | 3 | P1 | Não |
| PERF-04 | Sem connection pooling | Performance | ALTO | 4 | 4 | 2 | 4h | Fase 3 | 4 | 1 | 1 | 3 | P1 | Não |
| PERF-05 | Chat stats 10k rows | Performance | ALTO | 3 | 3 | 2 | 2h | Fase 3 | 3 | 1 | 1 | 2 | P1 | Não |
| DB-02 | 13 tabelas faltantes | DB | ALTO | 4 | 5 | 3 | 16h | Fase 4 | 4 | 1 | 2 | 4 | P1 | Não |
| API-01 | Sem OpenAPI spec | API | ALTO | 3 | 5 | 3 | 8h | Fase 6 | 2 | 1 | 1 | 3 | P1 | Não |

---

## 4. ISSUES MÉDIAS (P2)

| ID | Descrição | Cat | Sever | Tempo | Prior | QW |
|----|-----------|-----|-------|-------|-------|----|
| Q-01 | Sem ESLint | Qualidade | MÉDIO | 4h | P2 | **Sim** |
| Q-02 | Coverage baixo | Qualidade | MÉDIO | 16h | P2 | Não |
| Q-03 | Core packages sem testes | Qualidade | MÉDIO | 8h | P2 | Não |
| Q-04 | Duplicação security | Qualidade | MÉDIO | 8h | P2 | Não |
| Q-05 | Excesso `as any` | Qualidade | MÉDIO | 4h | P2 | **Sim** |
| Q-06 | Catch blocks vazios | Qualidade | MÉDIO | 2h | P2 | **Sim** |
| Q-07 | Logger async mismatch | Qualidade | MÉDIO | 2h | P2 | **Sim** |
| SEC-18 | SQL injection risk | Segurança | MÉDIO | 4h | P2 | Não |
| SEC-19 | Rate limit in-memory | Segurança | MÉDIO | 8h | P2 | Não |
| SEC-20 | Sem audit trail | Segurança | MÉDIO | 8h | P2 | Não |
| SEC-21 | Body limit 10MB | Segurança | MÉDIO | 0.5h | P2 | **Sim** |
| SEC-22 | Sem ABAC | Segurança | MÉDIO | 16h | P2 | Não |
| PERF-06 | Sem cache AI | Performance | MÉDIO | 8h | P2 | Não |
| PERF-07 | Telemetry 1h TTL | Performance | MÉDIO | 2h | P2 | **Sim** |
| PERF-08 | Logger O(n) | Performance | MÉDIO | 2h | P2 | **Sim** |
| PERF-09 | Cache eviction 1x | Performance | MÉDIO | 4h | P2 | Não |
| PERF-10 | Sem pagination | Performance | MÉDIO | 4h | P2 | Não |
| LGPD-01 | Sem consentimento | LGPD | MÉDIO | 16h | P2 | Não |
| LGPD-02 | Sem right to erasure | LGPD | MÉDIO | 8h | P2 | Não |
| INT-01 | Event bus pendente | Integração | MÉDIO | 8h | P2 | Não |

---

## 5. ISSUES BAIXAS (P3)

| ID | Descrição | Cat | Sever | Tempo | Prior | QW |
|----|-----------|-----|-------|-------|-------|----|
| DOC-01 | Sem API docs | Documentação | BAIXO | 8h | P3 | Não |
| DOC-02 | Sem runbooks | Documentação | BAIXO | 4h | P3 | Não |
| DOC-03 | Sem changelog | Documentação | BAIXO | 1h | P3 | **Sim** |
| DOC-04 | Sem contributing guide | Documentação | BAIXO | 1h | P3 | **Sim** |
| PERF-11 | Sem compression | Performance | BAIXO | 1h | P3 | **Sim** |
| PERF-12 | Sem code splitting | Performance | BAIXO | 4h | P3 | Não |
| PERF-13 | Sem lazy loading | Performance | BAIXO | 2h | P3 | Não |
| Q-08 | Sem commit conventions | Qualidade | BAIXO | 1h | P3 | **Sim** |
| DEV-01 | Sem CI/CD | DevOps | BAIXO | 4h | P3 | Não |
| DEV-02 | Sem staging env | DevOps | BAIXO | 2h | P3 | Não |

---

## 6. QUICK WINS IDENTIFICADOS

**Total de Quick Wins: 22 itens (40% do total)**
**Esforço total dos Quick Wins: ~30h**
**Impacto dos Quick Wins: Elimina 6 issues CRÍTICAS + 8 issues ALTAS**

| # | ID | Ação | Tempo | Impacto |
|---|-----|------|-------|---------|
| 1 | SEC-01 | Rotacionar chaves de API | 1h | CRÍTICO |
| 2 | SEC-02 | Migrar para bcrypt | 2h | CRÍTICO |
| 3 | SEC-03 | Fixar JWT timing | 1h | CRÍTICO |
| 4 | SEC-04 | JWT secret hardcoded | 1h | CRÍTICO |
| 5 | SEC-05 | CORS explícito | 1h | CRÍTICO |
| 6 | SEC-06 | Rate limiting | 2h | CRÍTICO |
| 7 | SEC-07 | Helmet | 1h | ALTO |
| 8 | SEC-12 | HTTPS | 4h | ALTO |
| 9 | SEC-13 | Input validation | 4h | ALTO |
| 10 | SEC-14 | JWT 15min | 2h | ALTO |
| 11 | SEC-15 | Generic errors | 4h | ALTO |
| 12 | SEC-16 | Non-root container | 1h | ALTO |
| 13 | SEC-17 | Redis/Qdrant auth | 2h | ALTO |
| 14 | SEC-21 | Body limit 1MB | 0.5h | MÉDIO |
| 15 | Q-01 | ESLint | 4h | MÉDIO |
| 16 | Q-05 | Remove `as any` | 4h | MÉDIO |
| 17 | Q-06 | Fix catch blocks | 2h | MÉDIO |
| 18 | Q-07 | Logger types | 2h | MÉDIO |
| 19 | PERF-07 | Telemetry TTL | 2h | MÉDIO |
| 20 | PERF-08 | Logger O(n) | 2h | MÉDIO |
| 21 | PERF-11 | Compression | 1h | BAIXO |
| 22 | DOC-03 | Changelog | 1h | BAIXO |

---

## 7. ANÁLISE DE ESFORÇO POR PRIORIDADE

| Prioridade | Itens | Esforço Total | Quick Wins | Esforço QW |
|------------|-------|---------------|------------|------------|
| P0 (Crítico) | 8 | 54h | 6 | 8h |
| P1 (Alto) | 17 | 92h | 8 | 16h |
| P2 (Médio) | 20 | 108h | 6 | 14h |
| P3 (Baixo) | 10 | 24h | 2 | 2h |
| **Total** | **55** | **278h** | **22** | **40h** |

---

*Priority Matrix — CTO Enterprise Mode*
