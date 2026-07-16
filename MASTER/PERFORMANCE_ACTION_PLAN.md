# JARBAS 2.0 — PERFORMANCE ACTION PLAN

**Data:** 2026-07-13
**Classification:** CONFIDENTIAL
**Auditor:** Performance Engineer

---

## 1. ESTADO ATUAL DE PERFORMANCE

| Aspecto | Estado | Nota | Target |
|---------|--------|------|--------|
| Memory Management | 100+ stores in-memory, OOM risk | 3/10 | 7/10 |
| Database | 0 tabelas usadas, sem pooling | 2/10 | 7/10 |
| Caching | In-memory, não compartilhável | 3/10 | 6/10 |
| Connection Pool | Não implementado | 1/10 | 7/10 |
| Build Time | ~30s (OK) | 7/10 | 8/10 |
| Bundle Size | Não otimizado | 5/10 | 7/10 |
| **Score Geral** | | **3.5/10** | **7.0/10** |

---

## 2. PROBLEMAS DE PERFORMANCE — DETALHAMENTO

### PERF-01: 100+ In-Memory Stores (CRÍTICO)

**Problema:** Todo o sistema armazena dados em `Map` e `Array` dentro do processo Node.js.

**Módulos afetados:**

| Módulo | Store | Tipo | Risco |
|--------|-------|------|-------|
| auth-service | users, apiKeys, refreshTokens | Map | CRÍTICO |
| cost-optimizer | costs[], budgets, alerts[] | Array+Map | CRÍTICO |
| analytics-engine | metrics[] | Array | CRÍTICO |
| agent-manager | agents, sessions | Map | ALTO |
| skill-manager | skills | Map | MÉDIO |
| prompt-engine | prompts | Map | MÉDIO |
| business-suite | leads, contacts, accounts, etc. (20+ Maps) | Map | ALTO |
| hermes-core | pipelines, executions | Map | ALTO |

**Impacto:**
- Dados perdidos em cada restart
- OOM com crescimento de dados
- Sem horizontal scaling (cada instância tem seu próprio estado)
- Race conditions em concorrência

**Remediação:**
1. Migrar auth-service → PostgreSQL (Fase 3)
2. Migrar cost-optimizer → PostgreSQL (Fase 3)
3. Migrar analytics-engine → PostgreSQL (Fase 3)
4. Migrar agent-manager → PostgreSQL (Fase 4)
5. Migrar skill-manager → PostgreSQL (Fase 4)
6. Migrar prompt-engine → PostgreSQL (Fase 4)
7. Migrar business-suite → PostgreSQL (Fase 4)

**Esforço:** 42h (distribuído nas Fases 3-4)

### PERF-02: Analytics Unbounded Growth

**Problema:** `analytics-engine` mantém `metrics[]` em memória com cap de 100k que descarta metade dos dados.

**Código problemático:**
```typescript
// analytics-engine/src/index.ts:51-55
if (this.metrics.length > 100000) {
  this.metrics = this.metrics.slice(-50000); // Perde 50k registros!
}
```

**Remediação:**
1. Migrar para PostgreSQL com tabela `completion_logs`
2. Usar time-series partitioning (mensal)
3. Implementar rolling window de 30 dias
4. Agregar dados diariamente para analytics

**Esforço:** 4h

### PERF-03: Cost History O(n)

**Problema:** `getCostHistory()` itera 30 dias × full scan do array `this.costs[]`.

**Código problemático:**
```typescript
// cost-optimizer/src/index.ts:91-107
for (let i = 0; i < 30; i++) {
  const dayCosts = this.costs.filter(c => {
    const costDate = new Date(c.timestamp);
    return costDate.toDateString() === date.toDateString();
  });
  // ... soma custos
}
```

**Remediação:**
1. Query SQL com `GROUP BY date` (1 query vs 30 scans)
2. Materialized view para relatórios diários

**Esforço:** 2h

### PERF-04: Sem Connection Pooling

**Problema:** Cada request ao Supabase cria nova conexão TLS.

**Impacto:** Overhead de ~50ms por request em TLS handshake.

**Remediação:**
1. Implementar `pg.Pool` com max 20 conexões
2. Configurar keep-alive
3. Monitorar métricas de pool

**Esforço:** 4h

### PERF-05: Chat Stats 10k Rows

**Problema:** `getChatStats()` busca até 10.000 logs para aggregação no client.

**Código problemático:**
```typescript
// supabase-client/src/index.ts:246
const logs = await this.getChatLogsByTenant(tenantId, 10000);
// Agregação manual em JavaScript...
```

**Remediação:**
```sql
-- Query SQL otimizada
SELECT
  provider,
  model,
  COUNT(*) as total_requests,
  SUM(tokens) as total_tokens,
  SUM(cost) as total_cost,
  AVG(latency) as avg_latency
FROM chat_logs
WHERE tenant_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY provider, model;
```

**Esforço:** 2h

---

## 3. OTIMIZAÇÕES ADICIONAIS

### PERF-06: Sem Cache de Respostas AI

**Problema:** Cada request gera nova chamada à API de IA, mesmo para prompts idênticos.

**Remediação:**
1. Implementar semantic cache no Redis
2. Hash do prompt + modelo como key
3. TTL de 1 hora para respostas cached

**Esforço:** 8h

### PERF-07: Telemetry 1h TTL

**Problema:** `TelemetryEngine` mantém apenas 1 hora de dados.

**Remediação:**
1. Migrar para PostgreSQL com tabela `telemetry`
2. Partitionamento mensal
3. Retenção de 90 dias

**Esforço:** 2h

### PERF-08: Logger O(n) Shift

**Problema:** `Logger` usa `this.entries.shift()` que é O(n) em arrays grandes.

**Remediação:**
1. Usar ring buffer circular
2. Ou usar `Deque` (double-ended queue)

**Esforço:** 2h

### PERF-09: Cache Eviction 1 por vez

**Problema:** `CacheManager` evicta 1 entry por vez quando cheio.

**Remediação:**
1. Batch eviction (evict 10% de uma vez)
2. LRU com doubly-linked list

**Esforço:** 4h

### PERF-10: Sem Pagination

**Problema:** Todas as listas carregam todos os registros.

**Remediação:**
1. Cursor-based pagination em todas as rotas
2. Default: 20 items por página
3. Max: 100 items por página

**Esforço:** 4h

### PERF-11: Sem Compression

**Problema:** Respostas HTTP não comprimidas.

**Remediação:**
```typescript
import compression from 'compression';
app.use(compression({ threshold: 1024 }));
```

**Esforço:** 1h

---

## 4. BENCHMARKS ALVO

| Métrica | Atual | Target | Método |
|---------|-------|--------|--------|
| Response Time (p50) | Não medido | < 50ms | Artillery |
| Response Time (p95) | Não medido | < 200ms | Artillery |
| Response Time (p99) | Não medido | < 500ms | Artillery |
| Throughput | Não medido | > 1000 req/s | Artillery |
| Memory Usage | Variável | < 512MB | clinic.js |
| CPU Usage | Não medido | < 70% | clinic.js |
| Build Time | ~30s | < 45s | turbo |
| Test Time | ~60s | < 120s | vitest |

---

## 5. TESTES DE CARGO

### Ferramentas
- **Artillery** — load testing
- **Clinic.js** — profiling e flame graphs
- **0x** — flame graph analysis

### Cenários de Teste

| Cenário | VUs | Duração | Target |
|---------|-----|---------|--------|
| Auth login | 100 | 5min | p95 < 200ms |
| Chat completion | 50 | 5min | p95 < 2s |
| Dashboard load | 200 | 5min | p95 < 300ms |
| CRUD operations | 100 | 5min | p95 < 150ms |

---

## 6. CHECKLIST DE PERFORMANCE

- [ ] Connection pooling ativo (max 20)
- [ ] Todas as listas paginadas
- [ ] Compression gzip ativo
- [ ] Analytics com rolling window
- [ ] Cost history via SQL aggregation
- [ ] Chat stats via SQL
- [ ] Logger com ring buffer
- [ ] Cache eviction em batch
- [ ] Response time p95 < 200ms
- [ ] Memory usage < 512MB
- [ ] Zero OOM em testes de carga

---

*Performance Action Plan — CTO Enterprise Mode*
