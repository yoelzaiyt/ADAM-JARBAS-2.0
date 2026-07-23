# JARBAS 2.0 — DATABASE ACTION PLAN

**Data:** 2026-07-13
**Classification:** CONFIDENTIAL
**Auditor:** Database Architect

---

## 1. ESTADO ATUAL DO BANCO

| Aspecto | Estado | Nota |
|---------|--------|------|
| Schema | Mínimo (6 tabelas) | 3/10 |
| RLS | USING (true) — ineficaz | 2/10 |
| Migrations | 1 de 5 necessárias | 2/10 |
| Connection Pool | Não implementado | 1/10 |
| ORM/Query Builder | Drizzle configurado, não usado | 3/10 |
| Tabelas realmente usadas por código | **0 de 6** | 1/10 |
| **Score Geral** | | **2.0/10** |

---

## 2. TABELAS EXISTENTES vs NECESSÁRIAS

### Tabelas Implementadas (0 usadas pelo código)

| Tabela | Schema | Código Usa | Status |
|--------|--------|------------|--------|
| tenants | ✅ | ❌ | PARADO |
| users | ✅ | ❌ (Map in-memory) | PARADO |
| api_keys | ✅ | ❌ (Map in-memory) | PARADO |
| sessions | ✅ | ❌ | PARADO |
| chat_logs | ✅ | ❌ (MetricEntry[]) | PARADO |
| cost_budgets | ✅ | ❌ (Map in-memory) | PARADO |

### Tabelas Necessárias (não existem)

| Tabela | Prioridade | Módulo | Entidades |
|--------|------------|--------|-----------|
| models | P0 | ai-registry | AI model configs |
| prompts | P0 | prompt-engine | Prompt templates |
| completions | P0 | hermes-core | AI completion logs |
| embeddings | P0 | knowledge-hub | Vector embeddings |
| memories | P0 | memory-manager | Conversation memory |
| knowledge_nodes | P0 | knowledge-hub | Knowledge graph nodes |
| knowledge_edges | P0 | knowledge-hub | Knowledge graph edges |
| audit_logs | P0 | api-gateway | Security audit trail |
| agents | P1 | agent-manager | Agent configurations |
| skills | P1 | skill-manager | Skill definitions |
| webhooks | P1 | integration-hub | Webhook configs |
| oauth_tokens | P1 | integration-hub | OAuth state |
| api_registry | P1 | integration-hub | External API configs |
| workflows | P2 | business-suite | Workflow definitions |
| crm_leads | P2 | business-suite | CRM leads |
| crm_contacts | P2 | business-suite | CRM contacts |
| crm_opportunities | P2 | business-suite | CRM opportunities |
| finance_accounts | P2 | business-suite | Financial accounts |
| finance_transactions | P2 | business-suite | Financial transactions |
| hr_employees | P2 | business-suite | Employee records |
| hr_vacations | P2 | business-suite | Vacation records |
| legal_processes | P2 | business-suite | Legal processes |
| erp_inventory | P2 | business-suite | Inventory items |
| erp_orders | P2 | business-suite | Purchase orders |

---

## 3. RLS POLICIES — CORREÇÃO

### Problema Atual
```sql
-- TODAS as policies são:
CREATE POLICY "policy_name" ON table FOR ALL USING (true) WITH CHECK (true);
-- Isso significa: qualquer usuário autenticado acessa TUDO
```

### Correção Necessária
```sql
-- Para cada tabela, criar policy com isolamento por tenant:
CREATE POLICY "tenant_isolation" ON table
  FOR ALL
  USING (tenant_id = auth.uid() ->> 'tenant_id')
  WITH CHECK (tenant_id = auth.uid() ->> 'tenant_id');

-- Policies específicas por role:
CREATE POLICY "admin_full_access" ON table
  FOR ALL
  USING (auth.uid() ->> 'role' = 'admin');

CREATE POLICY "user_read_own" ON table
  FOR SELECT
  USING (tenant_id = auth.uid() ->> 'tenant_id');
```

### Tabelas que Precisam de RLS Corrigido

| Tabela | Policy Atual | Policy Necessária |
|--------|-------------|-------------------|
| tenants | USING (true) | tenant_id = auth.uid() |
| users | USING (true) | tenant_id = auth.uid() |
| api_keys | USING (true) | user_id = auth.uid() |
| sessions | USING (true) | user_id = auth.uid() |
| chat_logs | USING (true) | tenant_id = auth.uid() |

---

## 4. MIGRAÇÕES NECESSÁRIAS

### Migration 002: Models & Prompts
```sql
-- models: Configurações de modelos de IA
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  provider TEXT NOT NULL,
  model_id TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- prompts: Templates de prompts
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Migration 003: Knowledge & Memory
```sql
-- knowledge_nodes: Grafos de conhecimento
CREATE TABLE knowledge_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- memories: Memória de conversas
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tokens INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Migration 004: Integrations
```sql
-- api_registry: APIs externas registradas
CREATE TABLE api_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  auth_type TEXT DEFAULT 'api_key',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- webhooks: Configurações de webhooks
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Migration 005: Audit & Workflows
```sql
-- audit_logs: Trail de auditoria
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index para queries frequentes
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
```

---

## 5. INDEXES NECESSÁRIOS

| Tabela | Index | Tipo | Justificativa |
|--------|-------|------|---------------|
| users | email, tenant_id | B-tree | Lookup por email + tenant |
| api_keys | key_hash | B-tree | Validação de API key |
| chat_logs | tenant_id, created_at | B-tree + DESC | Queries por tenant + data |
| completions | tenant_id, model_id | B-tree | Analytics por modelo |
| memories | session_id | B-tree | Histórico de conversa |
| audit_logs | tenant_id, created_at | B-tree + DESC | Compliance queries |
| knowledge_nodes | tenant_id | B-tree | Busca por tenant |

---

## 6. CONNECTION POOLING

### Configuração Recomendada

```typescript
// packages/shared/supabase-client/src/pool.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,           // Máximo de conexões
  min: 5,            // Mínimo de conexões
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export default pool;
```

### Métricas de Pool

| Métrica | Target | Alerta |
|---------|--------|--------|
| Conexões ativas | < 15 | > 18 |
| Conexões ociosas | < 5 | > 10 |
| Tempo de espera | < 100ms | > 500ms |
| Conexões recusadas | 0 | > 0 |

---

## 7. SCRIPTS DE MIGRAÇÃO

| Script | Descrição | Dependências |
|--------|-----------|--------------|
| `db:migrate` | Rodar migrations pendentes | PostgreSQL rodando |
| `db:seed` | Popular dados de teste | Migrations rodadas |
| `db:rollback` | Reverter última migration | Backup disponível |
| `db:validate` | Validar schema atual | Migrations rodadas |
| `db:backup` | Backup antes de migrations | PostgreSQL rodando |

---

## 8. CHECKLIST DE VALIDAÇÃO

- [ ] Todas as 5 migrations criadas e testadas
- [ ] RLS policies com isolamento por tenant
- [ ] Connection pooling configurado (max 20)
- [ ] Indexes criados para queries frequentes
- [ ] db:migrate funciona sem erros
- [ ] db:seed popula dados de teste
- [ ] db:rollback reverte corretamente
- [ ] Todos os módulos core usando PostgreSQL (não in-memory)
- [ ] Audit trail funcional

---

*Database Action Plan — CTO Enterprise Mode*
