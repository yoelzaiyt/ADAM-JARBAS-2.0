================================================================================
JARBAS 2.0 — INTEGRATION HUB — MODELO DE BANCO DE DADOS
================================================================================
Sprint: 11.3 — Database Schema
Data: 2026-07-13
================================================================================

## 1. TECNOLOGIA

- Primary: PostgreSQL 16
- Cache: Redis 7
- Search: Meilisearch
- ORM: Drizzle ORM

## 2. SCHEMA PRINCIPAL

### 2.1 API Registry

`sql
CREATE TABLE api_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    base_url TEXT NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    auth_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    tags JSONB DEFAULT '[]',
    description TEXT,
    documentation_url TEXT,
    health_check_url TEXT,
    rate_limit JSONB DEFAULT '{}',
    pricing JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_registry_category ON api_registry(category);
CREATE INDEX idx_api_registry_status ON api_registry(status);
CREATE INDEX idx_api_registry_slug ON api_registry(slug);
`

### 2.2 API Credentials

`sql
CREATE TABLE api_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_id UUID NOT NULL REFERENCES api_registry(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    credential_type VARCHAR(50) NOT NULL,
    encrypted_value TEXT NOT NULL,
    iv VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    rotation_enabled BOOLEAN DEFAULT FALSE,
    rotation_interval_days INTEGER,
    last_rotated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(api_id, tenant_id, credential_type)
);

CREATE INDEX idx_api_credentials_api ON api_credentials(api_id);
CREATE INDEX idx_api_credentials_tenant ON api_credentials(tenant_id);
`

### 2.3 OAuth Tokens

`sql
CREATE TABLE oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_id UUID NOT NULL REFERENCES api_registry(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_type VARCHAR(50) NOT NULL DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scope TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_oauth_tokens_api ON oauth_tokens(api_id);
CREATE INDEX idx_oauth_tokens_tenant ON oauth_tokens(tenant_id);
CREATE INDEX idx_oauth_tokens_expires ON oauth_tokens(expires_at);
`

### 2.4 Tenants

`sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'free',
    rate_limits JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
`

### 2.5 API Usage

`sql
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_id UUID NOT NULL REFERENCES api_registry(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    request_size INTEGER,
    response_size INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partitioned by month for performance
CREATE INDEX idx_api_usage_api ON api_usage(api_id);
CREATE INDEX idx_api_usage_tenant ON api_usage(tenant_id);
CREATE INDEX idx_api_usage_timestamp ON api_usage(timestamp);
CREATE INDEX idx_api_usage_status ON api_usage(status_code);
`

### 2.6 Health Checks

`sql
CREATE TABLE health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_id UUID NOT NULL REFERENCES api_registry(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    latency_ms INTEGER NOT NULL,
    status_code INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_health_checks_api ON health_checks(api_id);
CREATE INDEX idx_health_checks_status ON health_checks(status);
CREATE INDEX idx_health_checks_checked ON health_checks(checked_at);
`

### 2.7 Webhooks

`sql
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events JSONB NOT NULL DEFAULT '[]',
    secret_encrypted TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    retry_count INTEGER DEFAULT 3,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhooks_tenant ON webhooks(tenant_id);
CREATE INDEX idx_webhooks_active ON webhooks(active);
`

### 2.8 Webhook Deliveries

`sql
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
`

### 2.9 Audit Logs

`sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partitioned by month
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
`

### 2.10 Cache Entries

`sql
CREATE TABLE cache_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_id UUID NOT NULL REFERENCES api_registry(id) ON DELETE CASCADE,
    endpoint_hash VARCHAR(64) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_body JSONB NOT NULL,
    response_status INTEGER NOT NULL,
    ttl INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(api_id, endpoint_hash, method)
);

CREATE INDEX idx_cache_entries_api ON cache_entries(api_id);
CREATE INDEX idx_cache_entries_expires ON cache_entries(expires_at);
`

### 2.11 Circuit Breakers

`sql
CREATE TABLE circuit_breakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_id UUID NOT NULL REFERENCES api_registry(id) ON DELETE CASCADE,
    endpoint VARCHAR(500) NOT NULL,
    state VARCHAR(50) NOT NULL DEFAULT 'closed',
    failure_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_threshold INTEGER DEFAULT 5,
    recovery_timeout INTEGER DEFAULT 30,
    last_failure TIMESTAMP WITH TIME ZONE,
    last_success TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(api_id, endpoint)
);

CREATE INDEX idx_circuit_breakers_api ON circuit_breakers(api_id);
CREATE INDEX idx_circuit_breakers_state ON circuit_breakers(state);
`

### 2.12 Rate Limits

`sql
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    api_id UUID NOT NULL REFERENCES api_registry(id) ON DELETE CASCADE,
    max_requests INTEGER NOT NULL,
    window_seconds INTEGER NOT NULL,
    current_count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, api_id)
);

CREATE INDEX idx_rate_limits_tenant ON rate_limits(tenant_id);
CREATE INDEX idx_rate_limits_api ON rate_limits(api_id);
`

### 2.13 Queues

`sql
CREATE TABLE queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    priority INTEGER DEFAULT 0,
    max_depth INTEGER DEFAULT 10000,
    current_depth INTEGER DEFAULT 0,
    consumer_count INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_queues_name ON queues(name);
`

### 2.14 Queue Messages

`sql
CREATE TABLE queue_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id UUID NOT NULL REFERENCES queues(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_queue_messages_queue ON queue_messages(queue_id);
CREATE INDEX idx_queue_messages_status ON queue_messages(status);
CREATE INDEX idx_queue_messages_scheduled ON queue_messages(scheduled_for);
`

### 2.15 Encryption Keys

`sql
CREATE TABLE encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    algorithm VARCHAR(50) NOT NULL DEFAULT 'AES-256-GCM',
    key_encrypted TEXT NOT NULL,
    iv VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rotated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_encryption_keys_active ON encryption_keys(active);
`

### 2.16 API Performance

`sql
CREATE TABLE api_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_id UUID NOT NULL REFERENCES api_registry(id) ON DELETE CASCADE,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    period VARCHAR(50) NOT NULL,
    p50_latency INTEGER,
    p95_latency INTEGER,
    p99_latency INTEGER,
    avg_latency INTEGER,
    min_latency INTEGER,
    max_latency INTEGER,
    total_requests BIGINT,
    error_count INTEGER,
    error_rate DECIMAL(5,2),
    throughput DECIMAL(10,2),
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_performance_api ON api_performance(api_id);
CREATE INDEX idx_api_performance_period ON api_performance(period);
CREATE INDEX idx_api_performance_measured ON api_performance(measured_at);
`

### 2.17 Cost Tracking

`sql
CREATE TABLE cost_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_id UUID NOT NULL REFERENCES api_registry(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    period VARCHAR(50) NOT NULL,
    requests_count BIGINT DEFAULT 0,
    requests_cost DECIMAL(10,4) DEFAULT 0,
    egress_bytes BIGINT DEFAULT 0,
    egress_cost DECIMAL(10,4) DEFAULT 0,
    storage_bytes BIGINT DEFAULT 0,
    storage_cost DECIMAL(10,4) DEFAULT 0,
    other_cost DECIMAL(10,4) DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cost_tracking_api ON cost_tracking(api_id);
CREATE INDEX idx_cost_tracking_tenant ON cost_tracking(tenant_id);
CREATE INDEX idx_cost_tracking_period ON cost_tracking(period);
`

### 2.18 Migration Plans

`sql
CREATE TABLE migration_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    source_api_id UUID NOT NULL REFERENCES api_registry(id),
    target_api_id UUID NOT NULL REFERENCES api_registry(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    config JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_migration_plans_tenant ON migration_plans(tenant_id);
CREATE INDEX idx_migration_plans_status ON migration_plans(status);
`

## 3. VIEWS

### 3.1 API Status View
`sql
CREATE OR REPLACE VIEW v_api_status AS
SELECT
    ar.id,
    ar.name,
    ar.slug,
    ar.status,
    ar.category,
    hc.status as health_status,
    hc.latency_ms as last_latency,
    hc.checked_at as last_check,
    cb.state as circuit_state
FROM api_registry ar
LEFT JOIN LATERAL (
    SELECT status, latency_ms, checked_at
    FROM health_checks
    WHERE api_id = ar.id
    ORDER BY checked_at DESC
    LIMIT 1
) hc ON TRUE
LEFT JOIN circuit_breakers cb ON cb.api_id = ar.id;
`

### 3.2 Usage Summary View
`sql
CREATE OR REPLACE VIEW v_usage_summary AS
SELECT
    au.api_id,
    ar.name as api_name,
    au.tenant_id,
    t.name as tenant_name,
    DATE_TRUNC('day', au.timestamp) as date,
    COUNT(*) as total_requests,
    AVG(au.latency_ms) as avg_latency,
    SUM(CASE WHEN au.status_code >= 400 THEN 1 ELSE 0 END) as error_count,
    ROUND(
        SUM(CASE WHEN au.status_code >= 400 THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100,
        2
    ) as error_rate
FROM api_usage au
JOIN api_registry ar ON ar.id = au.api_id
JOIN tenants t ON t.id = au.tenant_id
GROUP BY au.api_id, ar.name, au.tenant_id, t.name, DATE_TRUNC('day', au.timestamp);
`

### 3.3 Cost Summary View
`sql
CREATE OR REPLACE VIEW v_cost_summary AS
SELECT
    ct.api_id,
    ar.name as api_name,
    ct.tenant_id,
    t.name as tenant_name,
    ct.period,
    SUM(ct.total_cost) as total_cost,
    SUM(ct.requests_count) as total_requests,
    ROUND(SUM(ct.total_cost) / NULLIF(SUM(ct.requests_count), 0), 6) as cost_per_request
FROM cost_tracking ct
JOIN api_registry ar ON ar.id = ct.api_id
JOIN tenants t ON t.id = ct.tenant_id
GROUP BY ct.api_id, ar.name, ct.tenant_id, t.name, ct.period;
`

## 4. FUNCTIONS

### 4.1 Update Timestamp
`sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS 
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
 LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER set_api_registry_updated_at
    BEFORE UPDATE ON api_registry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- (repeat for other tables)
`

### 4.2 Cleanup Old Logs
`sql
CREATE OR REPLACE FUNCTION cleanup_old_logs(retention_days INTEGER DEFAULT 90)
RETURNS void AS 
BEGIN
    DELETE FROM api_usage
    WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;

    DELETE FROM health_checks
    WHERE checked_at < NOW() - (retention_days || ' days')::INTERVAL;

    DELETE FROM audit_logs
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
END;
 LANGUAGE plpgsql;
`

## 5. MIGRATIONS

### Estrutura de Migrations
`
packages/database/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_partitions.sql
│   ├── 003_add_indexes.sql
│   └── 004_seed_data.sql
├── seeds/
│   ├── default_tenant.sql
│   └── default_apis.sql
└── drizzle.config.ts
`

## 6. PERFORMANCE

### 6.1 Particionamento
- api_usage: particionado por mes
- audit_logs: particionado por mes
- health_checks: particionado por semana

### 6.2 Indexes Criticos
- Todas as foreign keys
- Timestamps para queries temporais
- Status para filtragem
- Slug/name para busca

### 6.3 Retencao de Dados
- api_usage: 90 dias
- health_checks: 30 dias
- audit_logs: 1 ano
- cache_entries: 24 horas

================================================================================
*Documentacao gerada pela Sprint 11.3 — Database Schema*
================================================================================
