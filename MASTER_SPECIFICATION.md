# JARBAS 2.0 - Master Specification

**Documento Oficial de Engenharia do Jarbas 2.0**
**Versão:** 1.0
**Data:** 12 de Julho de 2026
**Status:** VIGENTE

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Objetivos](#3-objetivos)
4. [Componentes](#4-componentes)
5. [Fluxos](#5-fluxos)
6. [Eventos e Mensageria](#6-eventos-e-mensageria)
7. [Integrações](#7-integrações)
8. [Banco de Dados](#8-banco-de-dados)
9. [Segurança](#9-segurança)
10. [CI/CD](#10-cicd)
11. [Cloud e Deploy](#11-cloud-e-deploy)
12. [Testes](#12-testes)
13. [Documentação](#13-documentação)
14. [Escalabilidade](#14-escalabilidade)
15. [Especificações por Módulo](#15-especificações-por-módulo)

---

## 1. Visão Geral

### 1.1 Definição do Produto

Jarbas 2.0 é uma plataforma monolítica de orquestração AI multi-provedor que integra chatbots, agentes autônomos, memória persistente, conhecimento, processamento de voz/vídeo, e módulos de negócio em uma única aplicação TypeScript.

### 1.2 Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js 20+ |
| Linguagem | TypeScript 5.x |
| Web Framework | Fastify 5.x |
| Monorepo | pnpm Workspaces + TurboRepo |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Vector DB | Qdrant |
| ORM | Drizzle ORM |
| Validação | Zod |
| Testes | Vitest |
| Build | Turbo |
| Container | Docker |
| CI/CD | GitHub Actions |
| Frontend | React 18 + Vite + TypeScript |

### 1.3 Princípios de Arquitetura

1. **Modularidade:** Cada funcionalidade é um package independente
2. **Tipagem Forte:** TypeScript strict mode em todos os packages
3. **Dependency Injection:** Inversão de dependência via construtores
4. **Event-Driven:** Comunicação via eventos quando possível
5. **Fail-Safe:** Fallback para cada provedor AI
6. **Multi-Tenancy:** Isolamento por tenant em todas as camadas
7. **Zero-Trust:** Validação em todas as bordas

---

## 2. Arquitetura

### 2.1 Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                        JARBAS 2.0                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   PWA (React)│    │   Dashboard  │    │   Admin      │     │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘     │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │ HTTP/SSE                          │
│  ┌──────────────────────────┴──────────────────────────────┐   │
│  │                    API Gateway (Fastify)                 │   │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────┐ │   │
│  │  │Auth     │ │Rate Limit│ │CORS     │ │Validation   │ │   │
│  │  └─────────┘ └──────────┘ └─────────┘ └─────────────┘ │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│  ┌──────────────────────────┴──────────────────────────────┐   │
│  │                    Core Services                         │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐  │   │
│  │  │AI Registry │ │HermesRouter│ │Cost Optimizer      │  │   │
│  │  └──────┬─────┘ └──────┬─────┘ └────────────────────┘  │   │
│  │         │               │                                │   │
│  │  ┌──────┴───────────────┴──────────────────────────┐   │   │
│  │  │              AI Providers                        │   │   │
│  │  │ ┌───────┐ ┌────────┐ ┌───────┐ ┌──────┐       │   │   │
│  │  │ │DeepSek│ │OpenRout│ │NVIDIA │ │Ollama│ ...   │   │   │
│  │  │ └───────┘ └────────┘ └───────┘ └──────┘       │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Support Services                      │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │Memory    │ │Knowledge │ │Agent     │ │Analytics │  │ │
│  │  │Manager   │ │Graph     │ │Manager   │ │Engine    │  │ │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │ │
│  │       │             │            │             │         │ │
│  │  ┌────┴────┐ ┌──────┴──────┐ ┌──┴───┐ ┌─────┴─────┐  │ │
│  │  │Qdrant   │ │BrainAPI     │ │Redis │ │PostgreSQL │  │ │
│  │  └─────────┘ └─────────────┘ └──────┘ └───────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Business Modules                      │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │Auth      │ │Supabase  │ │Tenant    │ │Billing   │  │ │
│  │  │Service   │ │Client    │ │Manager   │ │Engine    │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Infrastructure                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │PostgreSQL│ │Redis     │ │Qdrant    │ │Ollama    │  │ │
│  │  │(Docker)  │ │(Docker)  │ │(Docker)  │ │(Docker)  │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Estrutura de Packages

```
jarbas-2.0/
├── packages/
│   ├── shared/
│   │   ├── types/           # Tipos compartilhados
│   │   ├── utils/           # Utilitários gerais
│   │   └── config/          # Configuração centralizada
│   ├── core/
│   │   ├── ai-registry/     # Registro de provedores AI
│   │   ├── hermes-router/   # Roteamento inteligente
│   │   ├── cost-optimizer/  # Otimização de custos
│   │   ├── analytics-engine/# Motor de analytics
│   │   ├── memory-manager/  # Gerenciamento de memória
│   │   ├── prompt-engine/   # Motor de prompts
│   │   ├── skill-manager/   # Gerenciamento de skills
│   │   └── brainapi-client/ # Cliente BrainAPI
│   ├── services/
│   │   ├── api-gateway/     # Gateway API REST
│   │   ├── auth-service/    # Serviço de autenticação
│   │   └── supabase-client/ # Cliente Supabase
│   ├── apps/
│   │   └── jarbas-pwa/      # Frontend React
│   └── infrastructure/
│       └── docker/          # Dockerfile
├── api/                     # Server standalone Vercel
├── kubernetes/              # Manifestos K8s
└── docs/                    # Documentação
```

### 2.3 Dependency Graph

```
types ← utils ← config
         │        │
         ▼        ▼
    ┌────────────────┐
    │  ai-registry   │
    └────────┬───────┘
             │
    ┌────────┴───────────────────────┐
    │                                │
    ▼                                ▼
hermes-router              cost-optimizer
    │                                │
    │                                ▼
    │                        analytics-engine
    │                                │
    ▼                                ▼
memory-manager          brainapi-client
    │                         │
    │                         ▼
    │                   knowledge-graph
    │
    ▼
agent-manager
    │
    ├──▶ skill-manager
    │
    └──▶ agent-executor
```

---

## 3. Objetivos

### 3.1 Objetivos do Produto

| # | Objetivo | Métrica | Meta |
|---|----------|---------|------|
| O1 | Multi-provider AI | Providers integrados | 8+ |
| O2 | Baixa latência | Time-to-first-token | <500ms |
| O3 | Custo otimizado | Redução de custo | 30%+ |
| O4 | Memória persistente | Sessões preservadas | 100% |
| O5 | Agentes autônomos | Tasks completadas | 80%+ |
| O6 | Produção-ready | Uptime | 99.9% |
| O7 | Multi-tenancy | Tenants suportados | 1000+ |
| O8 | Segurança | Vulnerabilidades P0 | 0 |

### 3.2 Objetivos Técnicos

| # | Objetivo | Critério |
|---|----------|----------|
| T1 | Type Safety | zero `any` types |
| T2 | Test Coverage | 80%+ |
| T3 | Build Success | 100% packages |
| T4 | Lint Pass | zero errors |
| T5 | API Response | <200ms p95 |
| T6 | Memory Usage | <512MB per service |
| T7 | Startup Time | <5s cold start |
| T8 | Graceful Shutdown | <10s drain |

---

## 4. Componentes

### 4.1 API Gateway

**Responsabilidade:** Ponto de entrada único, roteamento, autenticação, rate limiting

| Aspecto | Detalhe |
|---------|---------|
| Framework | Fastify 5.x |
| Porta | 3001 (configurável) |
| Rotas | /api/v1/* |
| Auth | JWT + API Key |
| Rate Limit | 100 req/min (default) |
| CORS | Configurável por ambiente |
| Body Limit | 10MB |
| Timeout | 30s (configurável) |

**Endpoints Principais:**

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/v1/chat | Enviar mensagem |
| POST | /api/v1/chat/stream | Streaming SSE |
| GET | /api/v1/sessions | Listar sessões |
| GET | /api/v1/sessions/:id | Obter sessão |
| POST | /api/v1/sessions | Criar sessão |
| DELETE | /api/v1/sessions/:id | Deletar sessão |
| GET | /api/v1/providers | Listar provedores |
| GET | /api/v1/providers/:id/health | Saúde do provedor |
| POST | /api/v1/agents | Criar agente |
| GET | /api/v1/agents | Listar agentes |
| POST | /api/v1/agents/:id/execute | Executar agente |
| GET | /api/v1/analytics | Dados de analytics |
| GET | /api/v1/custos | Dados de custos |

### 4.2 AI Registry

**Responsabilidade:** Gerenciar provedores AI, fallback chain, health checks

| Aspecto | Detalhe |
|---------|---------|
| Interface | AIProvider (abstract) |
| Métodos | chat, embed, health, listModels |
| Fallback | Chain automática |
| Health Check | A cada 30s |
| Retry | 3 tentativas com backoff |

**Interface do Provedor:**

```typescript
interface AIProvider {
  id: string;
  name: string;
  type: ProviderType;
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
  stream?(messages: Message[], options?: ChatOptions): AsyncGenerator<Chunk>;
  embed?(texts: string[]): Promise<number[][]>;
  health(): Promise<HealthStatus>;
  listModels(): Promise<Model[]>;
  estimateCost(tokens: number): number;
}
```

### 4.3 Hermes Router

**Responsabilidade:** Roteamento inteligente baseado em custo, latência, qualidade

| Aspecto | Detalhe |
|---------|---------|
| Algoritmo | Weighted Round Robin |
| Fatores | Custo, latência, qualidade, disponibilidade |
| Fallback | Automático em falha |
| Cache | Cache de rotas por 5min |
| Metrics | Coleta de latência por rota |

**Estratégias de Roteamento:**

| Estratégia | Descrição |
|-----------|-----------|
| `lowest-cost` | Menor custo por token |
| `lowest-latency` | Menor latência histórica |
| `highest-quality` | Maior qualidade (benchmark) |
| `round-robin` | Distribuição igualitária |
| `weighted` | Ponderado por configuração |
| `failover` | Backup automático |

### 4.4 Memory Manager

**Responsabilidade:** Armazenar e recuperar contexto de conversas

| Aspecto | Detalhe |
|---------|---------|
| Storage | Qdrant (vetorial) + PostgreSQL (relacional) |
| Embedding | Via provedor AI configurado |
| Dimensão | 1536 (OpenAI) / 768 (local) |
| Retention | Configurável por tenant |
| Cleanup | Automático (TTL) |

### 4.5 Agent Manager

**Responsabilidade:** Gerenciar ciclo de vida de agentes autônomos

| Aspecto | Detalhe |
|---------|---------|
| Lifecycle | create → ready → running → complete/failed |
| Concorrência | Max 10 agentes simultâneos |
| Timeout | 5min por task (configurável) |
| Retry | 3 tentativas |
| Tools | Sistema de tool calls |

---

## 5. Fluxos

### 5.1 Fluxo de Chat (Request → Response)

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Gateway │────▶│  Router  │────▶│ Provider │
│  (PWA)   │     │  (Auth)  │     │ (Select) │     │ (AI API) │
└─────────┘     └──────────┘     └──────────┘     └──────────┘
      │                │                │                │
      │                │                │                │
      │                ▼                │                │
      │         ┌──────────┐           │                │
      │         │Validate  │           │                │
      │         │Input     │           │                │
      │         └──────────┘           │                │
      │                                │                │
      │                                ▼                │
      │                         ┌──────────┐           │
      │                         │Check     │           │
      │                         │Quota     │           │
      │                         └──────────┘           │
      │                                                │
      │                                                ▼
      │                                         ┌──────────┐
      │                                         │Process   │
      │                                         │Streaming │
      │                                         └──────────┘
      │                                                │
      ◀────────────────────────────────────────────────┘
                    SSE Stream / Response
```

**Detalhamento do Fluxo:**

1. **Client** envia POST /api/v1/chat com mensagem
2. **Gateway** valida JWT/API Key
3. **Gateway** aplica rate limiting
4. **Gateway** valida input com Zod schema
5. **Router** seleciona melhor provedor
6. **Router** verifica quota do tenant
7. **Provider** processa e retorna streaming
8. **Gateway** encaminha chunks via SSE
9. **Memory** armazena contexto (async)
10. **Analytics** registra uso (async)

### 5.2 Fluxo de Agente

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Request │────▶│  Agent   │────▶│  Tool    │────▶│  Execute │
│          │     │  Manager │     │  Parser  │     │  Action  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
      │                │                │                │
      │                │                │                │
      │                ▼                │                │
      │         ┌──────────┐           │                │
      │         │  Load    │           │                │
      │         │  Skills  │           │                │
      │         └──────────┘           │                │
      │                                │                │
      │                                ▼                │
      │                         ┌──────────┐           │
      │                         │  Parse   │           │
      │                         │  Tools   │           │
      │                         └──────────┘           │
      │                                                │
      │                                                ▼
      │                                         ┌──────────┐
      │                                         │  Return  │
      │                                         │  Result  │
      │                                         └──────────┘
      │                                                │
      ◀────────────────────────────────────────────────┘
                    Final Response
```

### 5.3 Fluxo de Memória

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Message │────▶│  Embed   │────▶│  Store   │────▶│  Index   │
│  Input   │     │  Text    │     │  Vector  │     │  Update  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
      │                │                │                │
      │                │                │                │
      │                ▼                │                │
      │         ┌──────────┐           │                │
      │         │  Chunk   │           │                │
      │         │  Text    │           │                │
      │         └──────────┘           │                │
      │                                │                │
      │                                ▼                │
      │                         ┌──────────┐           │
      │                         │  Qdrant  │           │
      │                         │  Insert  │           │
      │                         └──────────┘           │
      │                                                │
      │                                                ▼
      │                                         ┌──────────┐
      │                                         │  Update  │
      │                                         │  Metadata│
      │                                         └──────────┘
```

### 5.4 Fluxo de Streaming SSE

```
Client                    Gateway                   Provider
  │                          │                          │
  │  POST /chat/stream       │                          │
  │─────────────────────────▶│                          │
  │                          │  Validate + Select       │
  │                          │─────────────────────────▶│
  │                          │                          │
  │  200 OK (SSE)            │                          │
  │◀─────────────────────────│                          │
  │                          │                          │
  │  data: {"chunk":"Hello"} │  Stream chunks           │
  │◀─────────────────────────│◀─────────────────────────│
  │                          │                          │
  │  data: {"chunk":" world"}│                          │
  │◀─────────────────────────│◀─────────────────────────│
  │                          │                          │
  │  data: [DONE]            │                          │
  │◀─────────────────────────│                          │
```

---

## 6. Eventos e Mensageria

### 6.1 Sistema de Eventos

O Jarbas 2.0 utiliza um sistema de eventos interno base em EventEmitter para comunicação desacoplada entre módulos.

### 6.2 Eventos do Sistema

| Evento | Emitter | Listeners | Descrição |
|--------|---------|-----------|-----------|
| `chat:message` | Gateway | Router, Memory, Analytics | Nova mensagem recebida |
| `chat:response` | Provider | Gateway, Memory | Resposta do provedor |
| `chat:stream:chunk` | Provider | Gateway | Chunk de streaming |
| `chat:stream:end` | Provider | Gateway, Analytics | Fim do streaming |
| `provider:health:check` | Registry | Router, Dashboard | Health check executado |
| `provider:health:down` | Registry | Router, Dashboard, Alert | Provedor indisponível |
| `provider:health:up` | Registry | Router, Dashboard, Alert | Provedor voltou |
| `agent:created` | AgentManager | Analytics | Agente criado |
| `agent:started` | AgentManager | Analytics | Agente iniciado |
| `agent:completed` | AgentManager | Analytics, Memory | Agente concluído |
| `agent:failed` | AgentManager | Analytics, Alert | Agente falhou |
| `agent:tool:call` | AgentExecutor | Analytics | Tool call executado |
| `memory:stored` | MemoryManager | Analytics | Memória armazenada |
| `memory:searched` | MemoryManager | Analytics | Busca de memória |
| `memory:cleanup` | MemoryManager | Analytics | Limpeza executada |
| `session:created` | Gateway | Analytics | Sessão criada |
| `session:ended` | Gateway | Analytics | Sessão encerrada |
| `cost:updated` | CostOptimizer | Dashboard | Custo atualizado |
| `cost:threshold` | CostOptimizer | Alert | Limite de custo atingido |
| `auth:login` | AuthService | Audit | Login realizado |
| `auth:logout` | AuthService | Audit | Logout realizado |
| `auth:failed` | AuthService | Audit, Alert | Tentativa de login falhou |
| `tenant:created` | TenantManager | Analytics | Tenant criado |
| `tenant:updated` | TenantManager | Analytics | Tenant atualizado |

### 6.3 Estrutura de Evento

```typescript
interface SystemEvent {
  type: string;
  timestamp: Date;
  source: string;
  tenantId?: string;
  userId?: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
```

### 6.4 Pattern de Uso

```typescript
// Emissão
eventEmitter.emit('chat:message', {
  type: 'chat:message',
  timestamp: new Date(),
  source: 'api-gateway',
  tenantId: 'tenant-123',
  userId: 'user-456',
  data: { sessionId: 'sess-789', message: 'Hello' }
});

// Escuta
eventEmitter.on('chat:message', (event: SystemEvent) => {
  // Processar evento
});
```

---

## 7. Integrações

### 7.1 Provedores AI

| Provedor | Status | Modelos | API Key | Fallback |
|----------|--------|---------|---------|----------|
| DeepSeek | ✅ | deepseek-chat, deepseek-coder | Requerida | OpenRouter |
| OpenRouter | ⚠️ Bug | multi-model | Requerida | DeepSeek |
| NVIDIA NIM | ✅ | llama-3.1-8b, mistral-7b | Requerida | Ollama |
| Ollama | ⚠️ | local models | Não | - |
| OpenCode | ✅ | opencode-default | Não | - |
| ZhipuAI/GLM | ✅ | glm-4, glm-4-flash | Requerida | DeepSeek |
| Nous Hermes | ✅ | hermes-3-llama | Requerida | Ollama |

### 7.2 Bancos de Dados

| Database | Uso | Versão | Porta |
|----------|-----|--------|-------|
| PostgreSQL | Dados relacionais, sessões | 15 | 5432 |
| Redis | Cache, filas, rate limiting | 7 | 6379 |
| Qdrant | Vetores, memória semântica | 1.9 | 6333 |
| Ollama | LLMs locais | Latest | 11434 |

### 7.3 APIs Externas

| API | Uso | Rate Limit |
|-----|-----|------------|
| Supabase | Auth, storage, realtime | 100 req/min |
| BrainAPI | Knowledge graph | 50 req/min |
| Resend | Email transacional | 100 req/dia |

### 7.4 Integrações Futuras (v2.0+)

| Integração | Categoria | Prioridade |
|------------|-----------|------------|
| Slack | Messaging | P2 |
| Discord | Messaging | P2 |
| WhatsApp | Messaging | P2 |
| Telegram | Messaging | P3 |
| Email (SMTP) | Email | P3 |
| Zapier | Automation | P3 |
| Make | Automation | P3 |
| Webhooks | Custom | P2 |

---

## 8. Banco de Dados

### 8.1 Schema PostgreSQL

```sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessões
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  provider_id VARCHAR(100),
  model VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Mensagens
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  provider_id VARCHAR(100),
  model VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agentes
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  system_prompt TEXT,
  tools JSONB DEFAULT '[]',
  config JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Execuções de Agentes
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  session_id UUID REFERENCES sessions(id),
  status VARCHAR(50) DEFAULT 'pending',
  input TEXT,
  output TEXT,
  tools_called JSONB DEFAULT '[]',
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Uso (analytics)
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(100) NOT NULL,
  provider_id VARCHAR(100),
  model VARCHAR(100),
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sessions_tenant ON sessions(tenant_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_agents_tenant ON agents(tenant_id);
CREATE INDEX idx_usage_tenant ON usage_logs(tenant_id);
CREATE INDEX idx_usage_created ON usage_logs(created_at);
```

### 8.2 Schema Qdrant

```typescript
// Collection: memories
{
  vectors: {
    size: 1536,  // ou 768 para modelos locais
    distance: "Cosine"
  },
  payload: {
    tenant_id: "keyword",
    user_id: "keyword",
    session_id: "keyword",
    type: "keyword",  // conversation, knowledge, summary
    content: "text",
    timestamp: "integer"
  }
}
```

### 8.3 Redis Keys

```
# Rate Limiting
rate_limit:{tenant_id}:{endpoint} → count
rate_limit:{tenant_id}:{endpoint}:reset → timestamp

# Cache
cache:provider:{provider_id}:health → { status, latency, lastCheck }
cache:router:{tenant_id}:routes → { [model]: provider_id }
cache:session:{session_id}:context → [messages]

# Sessões Ativas
session:{session_id}:active → true
session:{session_id}:last_activity → timestamp

# Filas
queue:analytics → [events]
queue:memory:index → [memory_ids]
```

---

## 9. Segurança

### 9.1 Autenticação

| Método | Uso | Implementação |
|--------|-----|---------------|
| JWT | Sessões de usuário | Fastify + @fastify/jwt |
| API Key | Acesso programático | Header X-API-Key |
| Supabase Auth | Login social | @supabase/supabase-js |

**JWT Config:**

```typescript
{
  algorithm: 'RS256',
  expiresIn: '24h',
  issuer: 'jarbas-2.0',
  audience: 'jarbas-api'
}
```

### 9.2 Autorização

| Role | Permissões |
|------|------------|
| `admin` | Tudo |
| `user` | CRUD próprio, leitura tenant |
| `viewer` | Leitura apenas |
| `api` | Endpoints API específicos |

### 9.3 Rate Limiting

| Tier | Limite | Janela |
|------|--------|--------|
| Free | 10 req/min | 1 min |
| Pro | 100 req/min | 1 min |
| Enterprise | 1000 req/min | 1 min |

### 9.4 Validação

| Camada | Método |
|--------|--------|
| Input | Zod schemas |
| Query | Zod schemas |
| Headers | Fastify hooks |
| Auth | Middleware custom |

### 9.5 Headers de Segurança

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### 9.6 CORS

```typescript
{
  origin: ['http://localhost:5173', 'https://*.jarbas.ai'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: 86400
}
```

### 9.7 Segredos

| Segredo | Localização | Método |
|---------|-------------|--------|
| JWT_SECRET | .env | Variável de ambiente |
| DATABASE_URL | .env | Variável de ambiente |
| REDIS_URL | .env | Variável de ambiente |
| QDRANT_URL | .env | Variável de ambiente |
| API Keys AI | .env | Variável de ambiente |
| Supabase Keys | config/index.ts | Hardcoded (⚠️) |

---

## 10. CI/CD

### 10.1 Pipeline GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: jarbas_test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379
      qdrant:
        image: qdrant/qdrant:latest
        ports:
          - 6333:6333
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

  docker:
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: jarbas/api:${{ github.sha }}
```

### 10.2 Scripts Package.json

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "clean": "turbo clean",
    "format": "prettier --write .",
    "prepare": "husky install"
  }
}
```

---

## 11. Cloud e Deploy

### 11.1 Docker

```dockerfile
# packages/infrastructure/docker/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/types ./packages/shared/types
COPY packages/shared/utils ./packages/shared/utils
COPY packages/shared/config ./packages/shared/config
COPY packages/core ./packages/core
COPY packages/services ./packages/services
RUN pnpm install --frozen-lockfile
RUN pnpm build --filter=@jarbas/api-gateway...

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/services/api-gateway/dist ./dist
COPY --from=builder /app/packages/services/api-gateway/package.json ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### 11.2 Kubernetes

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jarbas-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: jarbas-api
  template:
    metadata:
      labels:
        app: jarbas-api
    spec:
      containers:
      - name: api
        image: jarbas/api:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: jarbas-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: jarbas-api
spec:
  selector:
    app: jarbas-api
  ports:
  - port: 80
    targetPort: 3001
  type: LoadBalancer
```

### 11.3 Environment Variables

| Variável | Obrigatória | Default | Descrição |
|----------|-------------|---------|-----------|
| NODE_ENV | Não | development | Ambiente |
| PORT | Não | 3001 | Porta do servidor |
| DATABASE_URL | Sim | - | PostgreSQL URL |
| REDIS_URL | Sim | - | Redis URL |
| QDRANT_URL | Sim | - | Qdrant URL |
| JWT_SECRET | Sim | - | Chave JWT |
| DEEPSEEK_API_KEY | Não | - | DeepSeek API |
| OPENROUTER_API_KEY | Não | - | OpenRouter API |
| NVIDIA_API_KEY | Não | - | NVIDIA API |
| ZHIPUAI_API_KEY | Não | - | ZhipuAI API |
| HERMES_API_KEY | Não | - | Hermes API |
| SUPABASE_URL | Não | - | Supabase URL |
| SUPABASE_ANON_KEY | Não | - | Supabase Anon |
| SUPABASE_SERVICE_KEY | Não | - | Supabase Service |
| BRAINAPI_URL | Não | - | BrainAPI URL |

---

## 12. Testes

### 12.1 Estrutura de Testes

```
packages/
├── shared/
│   └── types/
│       └── src/
│           └── __tests__/
│               └── types.test.ts
├── core/
│   └── ai-registry/
│       └── src/
│           └── __tests__/
│               ├── index.test.ts
│               └── providers/
│                   └── deepseek.test.ts
└── services/
    └── api-gateway/
        └── src/
            └── __tests__/
                ├── index.test.ts
                └── routes/
                    └── chat.test.ts
```

### 12.2 Tipos de Teste

| Tipo | Cobertura | Ferramenta |
|------|-----------|------------|
| Unit | 80%+ | Vitest |
| Integration | Fluxos principais | Vitest + Testcontainers |
| E2E | Caminhos críticos | Playwright |
| Performance | Latência, throughput | k6 |

### 12.3 Configuração Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
    },
  },
});
```

### 12.4 Testes por Package

| Package | Unit | Integration | E2E |
|---------|------|-------------|-----|
| @jarbas/types | ✅ | - | - |
| @jarbas/utils | ✅ | - | - |
| @jarbas/config | ✅ | - | - |
| @jarbas/api-gateway | ✅ | ✅ | ✅ |
| @jarbas/ai-registry | ✅ | ✅ | - |
| @jarbas/hermes-router | ✅ | ✅ | - |
| @jarbas/memory-manager | ✅ | ✅ | - |
| @jarbas/agent-manager | ✅ | ✅ | - |
| @jarbas/auth-service | ✅ | ✅ | ✅ |
| @jarbas/supabase-client | ✅ | - | - |
| @jarbas/cost-optimizer | ✅ | - | - |
| @jarbas/analytics-engine | ✅ | - | - |
| @jarbas/prompt-engine | ✅ | - | - |
| @jarbas/skill-manager | ✅ | - | - |
| @jarbas/brainapi-client | ✅ | - | - |

---

## 13. Documentação

### 13.1 Estrutura de Docs

```
docs/
├── README.md                 # Visão geral
├── ARCHITECTURE.md           # Arquitetura
├── API.md                    # Referência da API
├── DEVELOPMENT.md            # Guia de desenvolvimento
├── DEPLOYMENT.md             # Guia de deploy
├── SECURITY.md               # Segurança
├── CONTRIBUTING.md           # Contribuição
├── CHANGELOG.md              # Histórico
├── modules/
│   ├── ai-registry.md
│   ├── hermes-router.md
│   ├── memory-manager.md
│   └── ...
└── adr/
    ├── 001-monorepo-structure.md
    ├── 002-database-choice.md
    └── ...
```

### 13.2 Padrões de Documentação

| Tipo | Formato | Atualização |
|------|---------|-------------|
| README | Markdown | A cada release |
| API Docs | OpenAPI 3.0 | Automática |
| ADRs | Markdown | A cada decisão |
| Module Docs | Markdown | A cada feature |
| Changelog | Keep a Changelog | A cada release |

---

## 14. Escalabilidade

### 14.1 Estratégias de Escala

| Camada | Estratégia | Configuração |
|--------|------------|--------------|
| API Gateway | Horizontal Pod Autoscaler | min: 2, max: 10 |
| AI Providers | Connection Pooling | max: 100 |
| PostgreSQL | Read Replicas | 1 write + 2 read |
| Redis | Cluster Mode | 6 nodes |
| Qdrant | Sharding | Auto-shard |

### 14.2 Limites por Tier

| Recurso | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Mensagens/dia | 100 | 10.000 | Ilimitado |
| Sessões | 10 | 100 | Ilimitado |
| Agentes | 3 | 20 | Ilimitado |
| Armazenamento | 100MB | 10GB | 1TB |
| Tenants | 1 | 10 | Ilimitado |

### 14.3 Métricas de Performance

| Métrica | Target | Alert |
|---------|--------|-------|
| Latência API (p95) | <200ms | >500ms |
| Latência AI (TTFT) | <500ms | >2000ms |
| Throughput | >1000 req/s | <100 req/s |
| Erro Rate | <0.1% | >1% |
| CPU Usage | <70% | >85% |
| Memory Usage | <80% | >90% |

---

## 15. Especificações por Módulo

---

### 15.1 @jarbas/types

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Definir tipos TypeScript compartilhados entre todos os packages |
| **Entradas** | Nenhuma (tipos estáticos) |
| **Saídas** | Interfaces, enums, types exportados |
| **Interfaces** | Message, ChatResponse, Provider, HealthStatus, etc. |
| **Eventos** | Nenhum |
| **Dependências** | Nenhuma |
| **Responsabilidades** | Garantir type safety entre packages |

**Tipos Principais:**

```typescript
// Mensagem
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
}

// Resposta do Chat
interface ChatResponse {
  id: string;
  content: string;
  model: string;
  provider: string;
  tokens: { input: number; output: number };
  cost: number;
  latency: number;
}

// Provedor
interface ProviderConfig {
  id: string;
  name: string;
  apiKey?: string;
  baseUrl?: string;
  models: string[];
  priority: number;
  enabled: boolean;
}

// Sessão
interface Session {
  id: string;
  tenantId: string;
  userId: string;
  title?: string;
  providerId: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

// Health Status
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  lastCheck: Date;
  error?: string;
}
```

---

### 15.2 @jarbas/utils

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Funções utilitárias reutilizáveis |
| **Entradas** | Dados brutos |
| **Saídas** | Dados processados |
| **Interfaces** | Funções exportadas |
| **Eventos** | Nenhum |
| **Dependências** | @jarbas/types |
| **Responsabilidades** | Helper functions comuns |

**Funções Principais:**

```typescript
// UUID
function generateId(): string;

// Hash
function hashString(input: string): string;

// Retry
async function retry<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; delay: number }
): Promise<T>;

// Debounce
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void;

// Sleep
function sleep(ms: number): Promise<void>;

// Token Counter
function countTokens(text: string): number;

// Cost Calculator
function calculateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): number;
```

---

### 15.3 @jarbas/config

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Configuração centralizada do sistema |
| **Entradas** | Variáveis de ambiente, defaults |
| **Saídas** | Objeto de configuração tipado |
| **Interfaces** | Config, DatabaseConfig, AIConfig, etc. |
| **Eventos** | Nenhum |
| **Dependências** | @jarbas/types |
| **Responsabilidades** | Unificar configurações, validação com Zod |

**Configurações:**

```typescript
interface Config {
  env: 'development' | 'production' | 'test';
  port: number;
  database: DatabaseConfig;
  redis: RedisConfig;
  qdrant: QdrantConfig;
  jwt: JWTConfig;
  cors: CORSConfig;
  ai: AIConfig;
  supabase: SupabaseConfig;
}

interface DatabaseConfig {
  url: string;
  poolSize: number;
  ssl: boolean;
}

interface AIConfig {
  defaultProvider: string;
  defaultModel: string;
  timeout: number;
  maxRetries: number;
}
```

---

### 15.4 @jarbas/api-gateway

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Gateway API REST com autenticação e rate limiting |
| **Entradas** | HTTP requests (JSON) |
| **Saídas** | HTTP responses (JSON), SSE streams |
| **Interfaces** | REST API, WebSocket (futuro) |
| **Eventos** | chat:message, chat:response, session:created, auth:login |
| **Dependências** | @jarbas/types, @jarbas/utils, @jarbas/config, @jarbas/ai-registry, @jarbas/hermes-router, @jarbas/memory-manager, @jarbas/auth-service, @jarbas/analytics-engine, @jarbas/cost-optimizer |
| **Responsabilidades** | Roteamento, autenticação, validação, rate limiting, streaming |

**Endpoints:**

| Método | Rota | Auth | Rate Limit | Descrição |
|--------|------|------|------------|-----------|
| GET | /health | Não | Não | Health check |
| POST | /api/v1/auth/login | Não | 5/min | Login |
| POST | /api/v1/auth/register | Não | 3/min | Registro |
| GET | /api/v1/auth/me | JWT | 100/min | Perfil |
| POST | /api/v1/chat | JWT/API | 100/min | Chat |
| POST | /api/v1/chat/stream | JWT/API | 100/min | Streaming |
| GET | /api/v1/sessions | JWT | 100/min | Listar sessões |
| GET | /api/v1/sessions/:id | JWT | 100/min | Obter sessão |
| POST | /api/v1/sessions | JWT | 100/min | Criar sessão |
| DELETE | /api/v1/sessions/:id | JWT | 100/min | Deletar sessão |
| GET | /api/v1/providers | JWT | 100/min | Listar provedores |
| GET | /api/v1/providers/:id/health | JWT | 100/min | Saúde |
| GET | /api/v1/agents | JWT | 100/min | Listar agentes |
| POST | /api/v1/agents | JWT | 100/min | Criar agente |
| POST | /api/v1/agents/:id/execute | JWT | 10/min | Executar agente |
| GET | /api/v1/analytics/usage | JWT | 100/min | Uso |
| GET | /api/v1/analytics/costs | JWT | 100/min | Custos |
| GET | /api/v1/memory/search | JWT | 50/min | Buscar memória |
| POST | /api/v1/memory/store | JWT | 50/min | Armazenar memória |

---

### 15.5 @jarbas/ai-registry

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Gerenciar provedores AI com fallback automático |
| **Entradas** | Configuração de provedores, requests de chat |
| **Saídas** | Respostas AI, health status, lista de modelos |
| **Interfaces** | AIProvider (abstract), ProviderResult |
| **Eventos** | provider:health:check, provider:health:down, provider:health:up |
| **Dependências** | @jarbas/types, @jarbas/utils |
| **Responsabilidades** | Registro, fallback, health check, métricas |

**Métodos:**

```typescript
class AIRegistry {
  register(provider: AIProvider): void;
  unregister(providerId: string): void;
  getProvider(providerId: string): AIProvider | undefined;
  getHealthyProviders(): AIProvider[];
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
  stream(messages: Message[], options?: ChatOptions): AsyncGenerator<Chunk>;
  health(): Promise<HealthStatus[]>;
  listAllModels(): Model[];
}
```

---

### 15.6 @jarbas/hermes-router

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Roteamento inteligente baseado em critérios configuráveis |
| **Entradas** | Request de chat, contexto do tenant |
| **Saídas** | Provider selecionado |
| **Interfaces** | RouterStrategy, RouteResult |
| **Eventos** | Nenhum |
| **Dependências** | @jarbas/ai-registry, @jarbas/cost-optimizer, @jarbas/analytics-engine |
| **Responsabilidades** | Selecionar melhor provider, fallback, balanceamento |

**Estratégias:**

```typescript
interface RouterStrategy {
  name: string;
  select(
    providers: AIProvider[],
    context: RouteContext
  ): AIProvider;
}

interface RouteContext {
  tenantId: string;
  userId: string;
  sessionId: string;
  preferredProvider?: string;
  preferredModel?: string;
  maxCost?: number;
  maxLatency?: number;
}
```

---

### 15.7 @jarbas/cost-optimizer

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Otimizar custos de uso de AI |
| **Entradas** | Uso atual, limites do tenant, preços dos providers |
| **Saídas** | Recomendações, alertas, projeções |
| **Interfaces** | CostReport, CostAlert, UsageQuota |
| **Eventos** | cost:updated, cost:threshold |
| **Dependências** | @jarbas/types, @jarbas/config |
| **Responsabilidades** | Rastrear custos, alertar limites, sugerir alternativas |

**Métodos:**

```typescript
class CostOptimizer {
  trackUsage(tenantId: string, cost: number): Promise<void>;
  getUsage(tenantId: string, period: DateRange): Promise<UsageReport>;
  getQuota(tenantId: string): Promise<UsageQuota>;
  checkLimit(tenantId: string): Promise<{ allowed: boolean; remaining: number }>;
  getProjection(tenantId: string, days: number): Promise<CostProjection>;
  suggestCheaper(
    currentProvider: string,
    currentModel: string
  ): Promise<Suggestion[]>;
}
```

---

### 15.8 @jarbas/analytics-engine

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Coletar e analisar métricas de uso |
| **Entradas** | Eventos do sistema |
| **Saídas** | Relatórios, dashboards, alertas |
| **Interfaces** | AnalyticsEvent, AnalyticsReport |
| **Eventos** | Escuta todos os eventos, gera relatórios |
| **Dependências** | @jarbas/types |
| **Responsabilidades** | Coleta, armazenamento, análise de métricas |

**Métricas Coletadas:**

| Métrica | Tipo | Granularidade |
|---------|------|---------------|
| Mensagens enviadas | Counter | Por hora |
| Tokens usados | Gauge | Por hora |
| Custo acumulado | Gauge | Por dia |
| Latência de resposta | Histogram | Por request |
| Erros por provider | Counter | Por hora |
| Sessões ativas | Gauge | Tempo real |
| Agentes executados | Counter | Por hora |
| Uso de memória | Gauge | Por hora |

---

### 15.9 @jarbas/memory-manager

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Armazenar e recuperar contexto de conversas |
| **Entradas** | Mensagens, queries de busca |
| **Saídas** | Contextos relevantes, confirmações |
| **Interfaces** | MemoryStore, SearchResult |
| **Eventos** | memory:stored, memory:searched, memory:cleanup |
| **Dependências** | @jarbas/types, Qdrant client |
| **Responsabilidades** | Embedding, armazenamento, busca semântica, cleanup |

**Métodos:**

```typescript
class MemoryManager {
  store(input: MemoryInput): Promise<MemoryResult>;
  search(query: string, options: SearchOptions): Promise<SearchResult[]>;
  getContext(sessionId: string, limit?: number): Promise<Message[]>;
  cleanup(options: CleanupOptions): Promise<CleanupResult>;
  export(tenantId: string): Promise<MemoryExport>;
  delete(memoryId: string): Promise<void>;
}

interface MemoryInput {
  content: string;
  tenantId: string;
  userId: string;
  sessionId: string;
  type: 'conversation' | 'knowledge' | 'summary';
  metadata?: Record<string, unknown>;
}

interface SearchOptions {
  tenantId: string;
  userId?: string;
  sessionId?: string;
  type?: string;
  limit?: number;
  threshold?: number;
}
```

---

### 15.10 @jarbas/prompt-engine

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Gerenciar e renderizar templates de prompt |
| **Entradas** | Template ID, variáveis |
| **Saídas** | Prompt renderizado |
| **Interfaces** | PromptTemplate, RenderOptions |
| **Eventos** | Nenhum |
| **Dependências** | @jarbas/types |
| **Responsabilidades** | Templates, versionamento, renderização |

**Templates Default:**

| ID | Descrição | Variáveis |
|----|-----------|-----------|
| `system-default` | System prompt padrão | - |
| `chat-context` | Chat com contexto | `context`, `message` |
| `agent-task` | Execução de tarefa | `task`, `tools`, `context` |
| `summary` | Resumo de conversa | `messages`, `maxLength` |
| `rag-qa` | QA com RAG | `context`, `question` |

---

### 15.11 @jarbas/skill-manager

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Gerenciar skills (habilidades) de agentes |
| **Entradas** | Definições de skill, requests de execução |
| **Saídas** | Skills disponíveis, resultados de execução |
| **Interfaces** | Skill, SkillDefinition, SkillResult |
| **Eventos** | skill:registered, skill:executed |
| **Dependências** | @jarbas/types |
| **Responsabilidades** | Registro, validação, execução de skills |

**Skills Default:**

| ID | Descrição | Parâmetros |
|----|-----------|------------|
| `web-search` | Busca na web | `query`, `maxResults` |
| `code-exec` | Executar código | `language`, `code` |
| `file-read` | Ler arquivo | `path` |
| `file-write` | Escrever arquivo | `path`, `content` |
| `api-call` | Chamar API | `url`, `method`, `body` |

---

### 15.12 @jarbas/brainapi-client

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Interface com BrainAPI para knowledge graph |
| **Entradas** | Queries, entidades, relações |
| **Saídas** | Grafos de conhecimento, respostas |
| **Interfaces** | BrainAPIClient, GraphResult |
| **Eventos** | Nenhum |
| **Dependências** | @jarbas/types |
| **Responsabilidades** | Query, inserção, traversal do grafo |

**Métodos:**

```typescript
class BrainAPIClient {
  query(query: string, options?: QueryOptions): Promise<GraphResult>;
  addEntity(entity: Entity): Promise<void>;
  addRelation(relation: Relation): Promise<void>;
  traverse(startId: string, depth: number): Promise<GraphSubgraph>;
  search(term: string): Promise<Entity[]>;
  getEntity(id: string): Promise<Entity | null>;
}
```

---

### 15.13 @jarbas/auth-service

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Autenticação e autorização |
| **Entradas** | Credenciais, tokens |
| **Saídas** | Tokens JWT, sessões |
| **Interfaces** | AuthService, AuthResult |
| **Eventos** | auth:login, auth:logout, auth:failed |
| **Dependências** | @jarbas/types, @jarbas/config, Supabase |
| **Responsabilidades** | Login, registro, JWT, refresh, revogação |

**Métodos:**

```typescript
class AuthService {
  login(email: string, password: string): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  verifyToken(token: string): Promise<TokenPayload>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  logout(token: string): Promise<void>;
  revokeAll(userId: string): Promise<void>;
  changePassword(userId: string, newPassword: string): Promise<void>;
  resetPassword(email: string): Promise<void>;
}
```

---

### 15.14 @jarbas/supabase-client

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Interface com Supabase para auth, storage, realtime |
| **Entradas** | Queries, operações |
| **Saídas** | Resultados do Supabase |
| **Interfaces** | SupabaseClient |
| **Eventos** | Nenhum |
| **Dependências** | @jarbas/config |
| **Responsabilidades** | Wrapper do Supabase SDK |

**Métodos:**

```typescript
class SupabaseClient {
  auth: SupabaseAuthClient;
  from(table: string): SupabaseQueryBuilder;
  storage: SupabaseStorageClient;
  channel(name: string): RealtimeChannel;
}
```

---

### 15.15 @jarbas/hermes-router (Detalhado)

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Roteamento inteligente multi-estatégia |
| **Entradas** | Request, contexto, configuração |
| **Saídas** | Provider selecionado, rota otimizada |
| **Interfaces** | RoutingStrategy, RouteDecision |
| **Eventos** | route:selected, route:fallback |
| **Dependências** | @jarbas/ai-registry, @jarbas/cost-optimizer, @jarbas/analytics-engine |
| **Responsabilidades** | Seleção, fallback, balanceamento, cache de rotas |

**Algoritmo de Seleção:**

```
1. Filtrar providers indisponíveis (health check)
2. Filtrar providers sem quota disponível
3. Aplicar estratégia selecionada:
   - lowest-cost: ordenar por custo estimado
   - lowest-latency: ordenar por latência média
   - highest-quality: ordenar por benchmark score
   - round-robin: ciclo simples
   - weighted: soma ponderada de fatores
4. Selecionar top-1
5. Se falhar, repetir com próximo da lista
```

---

### 15.16 @jarbas/agent-manager

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Gerenciar ciclo de vida de agentes |
| **Entradas** | Definições de agente, execuções |
| **Saídas** | Status, resultados |
| **Interfaces** | Agent, AgentExecution |
| **Eventos** | agent:created, agent:started, agent:completed, agent:failed |
| **Dependências** | @jarbas/types, @jarbas/skill-manager |
| **Responsabilidades** | CRUD, lifecycle, concorrência, timeout |

**States:**

```
draft → ready → running → completed
                   ↓
                failed
                   ↓
                retrying → running
```

---

### 15.17 @jarbas/docker/Dockerfile

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Container image para deploy |
| **Entradas** | Código fonte, dependências |
| **Saídas** | Imagem Docker otimizada |
| **Interfaces** | Docker CLI |
| **Eventos** | Nenhum |
| **Dependências** | Todos os packages |
| **Responsabilidades** | Build multi-stage, otimização de tamanho |

**Etapas:**

| Stage | Base | Propósito |
|-------|------|-----------|
| builder | node:20-alpine | Instalar deps, build |
| runner | node:20-alpine | Runtime mínimo |

---

### 15.18 @jarbas/email-ai

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Plataforma inteligente de gerenciamento de e-mails com classificação automática, priorização, resumo, geração de respostas, detecção de spam/phishing, e integração com CRM/Agenda |
| **Entradas** | E-mails recebidos (Gmail, Outlook, Exchange, Yahoo, Proton, IMAP/SMTP genéricos) |
| **Saídas** | E-mails classificados, priorizados, rascunhos gerados, tarefas criadas, contatos atualizados, CRM atualizado |
| **Interfaces** | EmailAPI (REST), Hermes Core, Knowledge Hub, Meeting AI |
| **Eventos** | email.received, email.classified, email.replied, email.archived, email.flagged, spam.detected, phishing.detected |
| **Dependências** | @jarbas/hermes-core, @jarbas/knowledge-hub, @jarbas/meeting-ai, @jarbas/shared-types, @jarbas/shared-utils |
| **Responsabilidades** | Sync de caixas de e-mail, classificação automática (9 categorias), priorização (4 níveis), detecção de spam/phishing, geração de respostas, aprovação de drafts, sincronização com CRM/Agenda/Tarefas, gerenciamento de anexos, segurança (OAuth, MFA, criptografia, auditoria) |
| **Testes** | 143/143 passing, 26 test files |
| **TS Errors** | 0 |

**Módulos (26):**

| Módulo | Responsabilidade |
|--------|-----------------|
| EmailGateway | Envio/recebimento de e-mails multi-provedor |
| ProviderRegistry | Abstração de provedores (Gmail, Outlook, Exchange, Yahoo, Proton, IMAP/SMTP) |
| MailboxManager | Gerenciamento de pastas (inbox, sent, drafts, archive, spam, trash) |
| SyncEngine | Sincronização manual, incremental, agendada e em tempo real |
| FolderManager | Mapeamento e movimentação entre pastas |
| ConversationEngine | Agrupamento de e-mails por conversa com contexto e histórico |
| PriorityEngine | Classificação automática de prioridade (urgente, alta, média, baixa) |
| ClassificationEngine | Classificação em 9 categorias (Comercial, Financeiro, Jurídico, Suporte, Marketing, Projetos, RH, Compras, Pessoal) |
| SpamDetector | Detecção de spam com scoring e indicadores |
| PhishingAnalyzer | Análise de phishing com detecção de links e anexos suspeitos |
| AttachmentManager | Processamento de anexos (PDF, DOCX, XLSX, PPTX, CSV, TXT, imagens, ZIP) |
| DocumentParser | Extração de texto de e-mails e anexos |
| AIResponseEngine | Decisão de resposta automática, draft, encaminhamento, aprovação, tarefa, reunião |
| ApprovalWorkflow | Fluxo de aprovação para respostas automáticas |
| DraftGenerator | Geração de rascunhos (comercial, jurídico, financeiro, atendimento, convites, cobranças, agradecimentos, follow-ups, técnicos) |
| SignatureManager | Gerenciamento de assinaturas pessoais, corporativas e por departamento |
| ContactManager | Gerenciamento de contatos de e-mail |
| CRMSync | Sincronização com CRM (leads, contatos, oportunidades) |
| CalendarSync | Detecção de datas, convites e criação de eventos |
| TaskSync | Extração e criação automática de tarefas |
| NotificationEngine | Notificações multi-canal (email, push, webhook, sms) |
| Analytics | Métricas: recebidos, respondidos, tempo médio, taxa de automação, categorias, volume por cliente |
| Monitoring | Dashboard de saúde do sistema |
| Security | OAuth 2.0, MFA, criptografia, auditoria, rate limit, sanitização |
| EmailAPI | REST API (send, draft, reply, forward, sync, archive, classify, task, inbox, conversation, statistics, delete) |
| EmailAI | Orquestrador que conecta todos os módulos |

**APIs REST:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /email/send | Enviar e-mail |
| POST | /email/draft | Criar rascunho |
| POST | /email/reply | Responder e-mail |
| POST | /email/forward | Encaminhar e-mail |
| POST | /email/sync | Sincronizar caixa |
| POST | /email/archive | Arquivar e-mail |
| POST | /email/classify | Classificar e-mail |
| POST | /email/task | Criar tarefa |
| GET | /email/inbox | Listar caixa de entrada |
| GET | /email/conversation/{id} | Obter conversa |
| GET | /email/statistics | Estatísticas |
| DELETE | /email/{id} | Deletar e-mail |

---

### 15.19 @jarbas/vision-engine

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Motor de visão computacional com análise de imagens, documentos, vídeos, OCR, detecção de objetos/faces/emocões, leitura de código de barras/QR, e reconhecimento de voz |
| **Entradas** | Imagens (JPG/PNG/WebP/TIFF/BMP), documentos (PDF/DOCX/PPTX/XLSX), vídeos (MP4/MOV/AVI/MKV), URLs de imagens |
| **Saídas** | Análises visuais, resultados OCR, objetos detectados, faces detectadas, emoções detectadas, tabelas extraídas, gráficos interpretados, dados de segurança |
| **Interfaces** | VisionAPI (REST), Hermes Core, Knowledge Hub, Meeting AI, WhatsApp AI, Email AI |
| **Eventos** | vision:image:analyzed, vision:object:detected, vision:video:processed, vision:alert:content |
| **Dependências** | @jarbas/hermes-core, @jarbas/knowledge-hub, @jarbas/shared-types, @jarbas/shared-utils |
| **Responsabilidades** | Análise de imagens, extração de texto OCR, detecção de objetos/faces/emocões, leitura de código de barras/QR, processamento de vídeos, análise de arquitetura, interpretação de diagramas, reconhecimento de manuscritos, extração de tabelas, interpretação de gráficos |
| **Testes** | 191/191 passing, 27 test files |
| **TS Errors** | 0 |

**Módulos (27):**

| Módulo | Responsabilidade |
|--------|-----------------|
| ProviderRegistry | Camada de abstração para provedores de visão (GPT Vision, Gemini Vision, Claude Vision, Qwen VL, Llama Vision, Florence, PaddleOCR, Tesseract, EasyOCR) |
| ImageAnalyzer | Análise de fotos, interfaces e diagramas |
| DocumentAnalyzer | Extração de PDF/DOCX/PPTX/XLSX |
| ScreenshotAnalyzer | Análise de interfaces web/mobile |
| DiagramAnalyzer | Interpretação de UML/BPMN/fluxogramas/ERD |
| ArchitectureAnalyzer | Análise de plantas, elétrica/hidráulica |
| VideoAnalyzer | Processamento de MP4/MOV/AVI/MKV |
| FrameExtractor | Extração de quadros-chave |
| ObjectDetection | Detecção de pessoas/veículos/computadores/documentos |
| SceneUnderstanding | Análise de contexto/riscos/atividades |
| OCREngine | OCR multi-idioma (PT/EN/ES/FR) |
| BarcodeReader | Leitura EAN/UPC/Code128 |
| QRReader | Parsing de URL/email/phone/WiFi |
| FaceDetector | Detecção de faces + atributos (sem identidade biométrica) |
| EmotionDetector | 8 emoções com detecção de microexpressões |
| HandwritingReader | Reconhecimento de texto manuscrito |
| TableExtractor | Conversão de tabelas para CSV/JSON |
| ChartReader | Interpretação de gráficos (barra/linha/pizza/scatter) |
| UIAnalyzer | Análise de acessibilidade/layout/componentes |
| PromptGenerator | 10 templates de prompt embutidos |
| ImageSearch | Busca de imagens por texto/tags |
| MetadataEngine | Extração EXIF/IPTC/XMP |
| Security | Detecção de PII, filtro de conteúdo, sanitização |
| Analytics | Métricas de requisição, custos, rastreamento de erros |
| Monitoring | Verificações de saúde, uptime, status do provedor |
| VisionAPI | REST API (analyze, search, health, metrics) |
| VisionAI | Orquestrador que conecta todos os 27 módulos |

**APIs REST:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /vision/analyze | Analisar imagem/documento |
| POST | /vision/analyze/video | Analisar vídeo |
| POST | /vision/ocr | Extração de texto OCR |
| POST | /vision/barcode | Leitura de código de barras |
| POST | /vision/qr | Leitura de QR code |
| POST | /vision/face | Detecção de faces |
| POST | /vision/emotion | Detecção de emoções |
| POST | /vision/table | Extração de tabelas |
| POST | /vision/chart | Interpretação de gráficos |
| POST | /vision/ui | Análise de interface |
| GET | /vision/metadata/{id} | Metadados EXIF/IPTC/XMP |
| GET | /vision/search | Busca de imagens |
| GET | /vision/health | Status do sistema |
| GET | /vision/metrics | Métricas de uso |

### 15.20 @jarbas/business-suite

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Plataforma de negócios completa com CRM, ERP, financeiro, contabilidade, tesouraria, vendas, compras, estoque, logística, RH, folha de pagamento, jurídico, contratos, conformidade, marketing, sucesso do cliente, mesa de suporte, projetos, kanban, BI, previsão, analytics, workflow, aprovações, notificações, documentos, relatórios, integrações, API, monitoramento |
| **Entradas** | Operações de negócio, transações financeiras, dados de clientes, pedidos, contratos, documentos |
| **Saídas** | Relatórios, dashboards, KPIs, alertas, workflows, aprovações, notificações |
| **Interfaces** | BusinessAPI (REST), Hermes Core, Knowledge Hub |
| **Eventos** | business:sale:created, business:payment:received, business:invoice:overdue, business:workflow:completed, business:approval:requested, business:alert:critical |
| **Dependências** | @jarbas/hermes-core, @jarbas/types, @jarbas/utils |
| **Responsabilidades** | Gestão de empresa, CRM, ERP, financeiro, contabilidade, tesouraria, vendas, compras, estoque, logística, RH, folha de pagamento, jurídico, contratos, conformidade, marketing, sucesso do cliente, mesa de suporte, projetos, kanban, BI, previsão, analytics, workflow, aprovações, notificações, documentos, relatórios, integrações, API, monitoramento |
| **Testes** | 238/238 passing, 32 test files |
| **TS Errors** | 0 |

**Módulos (32):**

| Módulo | Responsabilidade |
|--------|-----------------|
| CompanyManager | Gestão de empresa, subsidiaries, departamentos, configurações |
| CRM | Gestão de contatos, leads, oportunidades, pipeline, atividades, segmentos |
| ERP | Gestão de produtos, categorias, fornecedores, centros de custo |
| Finance | Orçamentos, transações, categorias, metas, relatórios |
| Accounting | Lançamentos contábeis, centros de custo, relatórios, fechamento |
| Treasury | Contas bancárias, saldos, transferências, reconciliação |
| Sales | Pedidos, itens, pipeline, previsões |
| Purchasing | Ordens de compra, aprovações, fornecedores |
| Inventory | Itens de estoque, movimentações, ressuprimento |
| Logistics | Entregas, rastreamento, rotas, frete |
| HR | Funcionários, departamentos, avaliações, benefícios |
| Payroll | Folha de pagamento, deduções, impostos, pagamentos |
| Legal | Casos jurídicos, documentos, prazos, riscos |
| Contracts | Contratos, cláusulas, renovações, revisões |
| Compliance | Polições, verificações, incidentes, auditorias |
| Marketing | Campanhas, leads, métricas, segmentação |
| CustomerSuccess | Contas, health scores, playbooks, churn |
| ServiceDesk | Tickets, SLAs, categorias, resoluções |
| Projects | Projetos, tarefas, times, milestones |
| Kanban | Quadros, colunas, cartões, WIP limits |
| BI | Datasets, métricas, dashboards, KPIs |
| Forecasting | Previsões de vendas, receita, demanda, custos |
| Analytics | Eventos, sessões, funis, cohortes, retenção |
| WorkflowEngine | Workflows, execuções, ações, transições |
| ApprovalEngine | Políticas, aprovações, thresholds, delegações |
| NotificationCenter | Notificações, templates, preferências, agendamento |
| DocumentManager | Documentos, versões, compartilhamento, folders |
| ReportGenerator | Relatórios, templates, agendamento, snapshots |
| Integrations | Integrações, credenciais, syncs, webhooks |
| BusinessAPI | REST API (endpoints para todos os módulos) |
| Monitoring | Health checks, métricas, alertas |
| BusinessSuite | Orquestrador dos 31 módulos |

**APIs REST:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/v1/health | Health check |
| GET | /api/v1/modules | Módulos disponíveis |
| POST | /api/v1/metrics | Métricas agregadas |
| GET | /api/v1/modules/:moduleName/status | Status de módulo |

### 15.21 @jarbas/evolution-center

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Centro de evolução contínua com análise, roadmap, governança, releases, feature flags, experimentação e monitoramento |
| **Entradas** | Métricas de plataforma, dados de telemetria, feedback, bugs, features, revisões |
| **Saídas** | Roadmaps, relatórios, dashboards, decisões de governança, releases, feature flags |
| **Interfaces** | EvolutionAPI (REST), Hermes Core, Knowledge Hub |
| **Eventos** | evolution:analysis:complete, evolution:release:created, evolution:rollback:triggered, evolution:flag:toggled, evolution:audit:recorded |
| **Dependências** | @jarbas/hermes-core, @jarbas/types, @jarbas/utils |
| **Responsabilidades** | Análise de plataforma, detecção de melhorias, roadmap, backlog, bugs, features, telemetria, analytics, qualidade, revisões (arquitetura, segurança, dependências, performance, custo), releases, experimentação, feature flags, canary, rollout, rollback, governança, aprovações, auditoria, notificações, dashboards, relatórios, monitoramento |
| **Testes** | 195/195 passing, 28 test files |
| **TS Errors** | 0 |

**Módulos (29):**

| Módulo | Responsabilidade |
|--------|-----------------|
| EvolutionEngine | Análise de plataforma, detecção de issues e recomendações |
| ImprovementEngine | Detecção de code duplication, APIs lentas, queries ineficientes |
| RoadmapEngine | Criação de roadmaps, items, priorização, dependências |
| BacklogManager | Gestão de backlog, sprints, items, story points |
| BugCenter | Gestão de bugs, status, prioridade, severidade |
| FeatureCenter | Gestão de features, votos, feedback, status |
| TelemetryEngine | Coleta e agregação de telemetria |
| AnalyticsEngine | Analytics de plataforma e módulos |
| QualityEngine | Análise de cobertura, lint, complexidade, duplicação |
| ArchitectureReview | Revisão de arquitetura (DDD, SOLID, coupling) |
| SecurityReview | Revisão de segurança (vulnerabilities, secrets, configs) |
| DependencyReview | Revisão de dependências (outdated, vulnerabilities, licenses) |
| PerformanceReview | Revisão de performance (CPU, memory, latency, response) |
| CostReview | Revisão de custos e alertas |
| ReleaseManager | Gestão de releases e changelogs |
| Experimentation | A/B testing e experimentos |
| FeatureFlags | Feature flags com targeting |
| CanaryManager | Deploy canário com health checks |
| RolloutManager | Gestão de rollout com métricas |
| RollbackManager | Gestão de rollback |
| Governance | Políticas e regras de governança |
| ApprovalEngine | Fluxo de aprovações |
| Audit | Auditoria de ações |
| NotificationCenter | Notificações e templates |
| DashboardManager | Dashboards e widgets |
| ReportGenerator | Geração de relatórios |
| EvolutionAPI | REST API do Evolution Center |
| Monitoring | Monitoramento do EC |
| EvolutionCenter | Orquestrador principal |

---

## Resumo Geral

| Aspecto | Métrica |
|---------|---------|
| Total de Módulos | 185 |
| Módulos Documentados | 19 (core + business + evolution-center) |
| Dependências Externas | 8 |
| APIs REST | 20+ |
| Eventos | 24 |
| Tabelas DB | 6 |
| Collections Qdrant | 1 |
| Templates Prompt | 5 |
| Skills Default | 5 |
| Estratégias Roteamento | 6 |
| Roles de Auth | 4 |
| Tiers de Rate Limit | 3 |
| Stages Docker | 2 |

---

*Documento criado pelo Arquiteto Principal em 12/07/2026*
*Última atualização: 12/07/2026*
