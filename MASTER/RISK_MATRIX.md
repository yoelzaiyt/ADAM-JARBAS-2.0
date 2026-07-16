# JARBAS 2.0 — RISK MATRIX

**Data:** 2026-07-13
**Classification:** CONFIDENTIAL

---

## 1. MATRIZ DE RISCOS CONSOLIDADA

### Legenda de Probabilidade
- 1 = Improvável (< 10%)
- 2 = Possível (10-30%)
- 3 = Provável (30-60%)
- 4 = Muito Provável (60-90%)
- 5 = Quase Certa (> 90%)

### Legenda de Impacto
- 1 = Insignificante
- 2 = Baixo
- 3 = Médio
- 4 = Alto
- 5 = Catastrófico

### Score de Risco = Probabilidade × Impacto

---

## 2. RISCOS CRÍTICOS (Score ≥ 15)

| ID | Risco | Prob | Impact | Score | Categoria |
|----|-------|------|--------|-------|-----------|
| R-01 | **Takeover de conta** via JWT forjado (secret hardcoded) | 5 | 5 | **25** | Segurança |
| R-02 | **Roubo de senhas** via brute force (SHA-256) | 5 | 5 | **25** | Segurança |
| R-03 | **Exfiltração de dados** via CORS aberto | 4 | 5 | **20** | Segurança |
| R-04 | **DDoS** em todos os endpoints (zero rate limiting) | 5 | 4 | **20** | Segurança |
| R-05 | **Perda total de dados** (100+ stores in-memory) | 5 | 5 | **25** | Operacional |
| R-06 | **Comprometimento multi-tenant** (RLS USING true) | 4 | 5 | **20** | Segurança |
| R-07 | **Timing attack** na verificação JWT | 4 | 4 | **16** | Segurança |
| R-08 | **Chaves de API comprometidas** (.env exposto) | 4 | 5 | **20** | Segurança |

---

## 3. RISCOS ALTOS (Score 10-14)

| ID | Risco | Prob | Impact | Score | Categoria |
|----|-------|------|--------|-------|-----------|
| R-09 | OOM com crescimento de métricas (analytics) | 4 | 3 | 12 | Performance |
| R-10 | Fuga de memória nos containers | 3 | 4 | 12 | Infraestrutura |
| R-11 | SQL injection no supabase-client | 3 | 4 | 12 | Segurança |
| R-12 | Containers como root (escalada de privilégio) | 3 | 4 | 12 | Segurança |
| R-13 | Sem audit trail (não detecta incidentes) | 4 | 3 | 12 | Compliance |
| R-14 | JWT 7 dias (janela de ataque enorme) | 4 | 3 | 12 | Segurança |
| R-15 | Input validation ausente (injection) | 3 | 4 | 12 | Segurança |
| R-16 | Erros leakam detalhes internos | 3 | 3 | 9 | Segurança |
| R-17 | Redis/Qdrant sem auth (acesso não autorizado) | 3 | 3 | 9 | Segurança |
| R-18 | Body limit 10MB (DoS por memória) | 3 | 3 | 9 | Performance |

---

## 4. RISCOS MÉDIOS (Score 5-9)

| ID | Risco | Prob | Impact | Score | Categoria |
|----|-------|------|--------|-------|-----------|
| R-19 | LGPD violation (sem consentimento) | 3 | 3 | 9 | Compliance |
| R-20 | Sem MFA (contas fragilizadas) | 3 | 2 | 6 | Segurança |
| R-21 | Sem monitoring (falhas não detectadas) | 4 | 2 | 8 | Operacional |
| R-22 | Sem CI/CD (deploy manual, erros) | 3 | 2 | 6 | DevOps |
| R-23 | Coverage de testes baixa (regressão) | 3 | 2 | 6 | Qualidade |
| R-24 | Sem documentação (onboarding lento) | 3 | 2 | 6 | Operacional |
| R-25 | Dependências não utilizadas (attack surface) | 2 | 3 | 6 | Segurança |
| R-26 | Sem versionamento de API (breaking changes) | 3 | 2 | 6 | API |
| R-27 | Cache in-memory compartilhado (race condition) | 2 | 3 | 6 | Concorrência |
| R-28 | Logger O(n) shift (performance) | 2 | 2 | 4 | Performance |

---

## 5. RISCOS BAIXOS (Score < 5)

| ID | Risco | Prob | Impact | Score | Categoria |
|----|-------|------|--------|-------|-----------|
| R-29 | Sem OpenAPI spec (docs desatualizadas) | 2 | 2 | 4 | Documentação |
| R-30 | Sem changelog (rastreabilidade) | 2 | 1 | 2 | Documentação |
| R-31 | Inconsistência de frameworks de teste | 2 | 1 | 2 | Qualidade |
| R-32 | Código morto (manutenção) | 2 | 1 | 2 | Qualidade |
| R-33 | Sem graceful shutdown | 2 | 1 | 2 | Operacional |

---

## 6. MAPA DE CALOR

```
IMPACTO →    1       2       3       4       5
PROB ↓
5           -       -       -       R-04    R-01,R-02,R-05
4           -       R-21    R-09    R-07    R-03,R-06,R-08
3           -       R-20    R-16    R-11    -
2           R-30    R-28    R-25    -       -
1           -       -       -       -       -
```

---

## 7. RISCOS FINANCEIROS

| Cenário | Prejuízo Estimado | Probabilidade |
|---------|-------------------|---------------|
| Roubo de API keys (fatura de IA) | $5.000 - $50.000 | Alta |
| Multa LGPD (vazamento de dados) | $10.000 - $100.000 | Média |
| Downtime por OOM/DoS | $1.000 - $10.000 | Alta |
| Perda de dados (restart) | $5.000 - $25.000 | Certa |
| Ataque de takeover | $10.000 - $100.000 | Alta |
| **Prejuízo total potencial** | **$31.000 - $285.000** | — |

---

## 8. MITIGAÇÃO PRIORIZADA

| Prioridade | Riscos | Ação Principal | Custo Mitigação |
|------------|--------|----------------|-----------------|
| P0 | R-01,R-02,R-07,R-08 | Fase 1 (Crítico) | 10h |
| P0 | R-03,R-04,R-05 | Fase 1 + 2 | 37h |
| P0 | R-06 | Fase 4 (RLS fix) | 4h |
| P1 | R-09,R-10,R-18 | Fase 3 (Performance) | 33h |
| P1 | R-11,R-12,R-14,R-15 | Fase 2 (Segurança) | 27.5h |
| P2 | R-13,R-19,R-21 | Fase 2 + 4 | 12h |
| P3 | R-20,R-22,R-23 | Fase 5 + 8 | 17h |

---

*Risk Matrix — CTO Enterprise Mode*
