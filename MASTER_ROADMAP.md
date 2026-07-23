# JARBAS 2.0 - Master Roadmap

**Documento Oficial do Projeto**
**Versão do Documento:** 1.0
**Data de Criação:** 12 de Julho de 2026
**Autor:** Arquiteto Principal
**Status:** VIGENTE

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Status Atual](#2-status-atual)
3. [Arquitetura Geral](#3-arquitetura-geral)
4. [Divisão por Versões](#4-divisão-por-versões)
5. [Roadmap por Sprints](#5-roadmap-por-sprints)
6. [Timeline Completa](#6-timeline-completa)

---

## 1. Visão Geral

### 1.1 Objetivo do Jarbas 2.0

Construir uma **plataforma de orquestração AI provider-agnostic** que permita empresas e desenvolvedores utilizar múltiplos provedores de inteligência artificial de forma unificada, com controle de custos, memória persistente, gerenciamento de agentes e uma interface intuitiva — sem lock-in de fornecedor.

### 1.2 Missão

Democratizar o acesso à inteligência artificial empresarial fornecendo uma plataforma aberta, modular e escalável que:

- Unifica 7+ provedores AI em uma única API
- Oferece roteamento inteligente entre provedores
- Garante controle total de custos e orçamentos
- Mantém memória persistente entre conversas
- Suporta multi-tenancy desde o primeiro dia
- É extensível via skills e agentes customizáveis

### 1.3 Visão

Ser a **plataforma padrão de orquestração AI** para empresas que precisam de:

- Flexibilidade para trocar provedores sem mudar código
- Visibilidade total sobre gastos com AI
- Capacidade de rodar modelos locais (Ollama) e cloud simultaneamente
- Conformidade com LGPD/GDPR via multi-tenancy
- Extensibilidade via ecossistema de skills

**Visão de Sucesso (12 meses):** 100+ empresas usando o JARBAS em produção, processando 1M+ requests/dia.

### 1.4 Valores

| Valor | Descrição |
|-------|-----------|
| **Provider-Agnostic** | Nunca depender de um único provedor AI |
| **Cost-First** | Cada decisão considera impacto financeiro |
| **Modular** | Cada funcionalidade é um módulo independente |
| **Type-Safe** | TypeScript strict em todo o código |
| **Observable** | Tudo é mensurável e auditável |
| **Secure** | Segurança não é opcional |

---

## 2. Status Atual

### 2.1 Data de Referência

**Data:** 12 de Julho de 2026
**Versão:** 0.1.0 ( pré-alpha)

### 2.2 Percentual de Conclusão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    JARBAS 2.0 - Progresso                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ██████████████████████████░░░░░░░░░░░░░░░░░░  25%         │
│                                                             │
│  Backend Core:    ████████████████████░  95%               │
│  API Gateway:     ████████████████░░░░░  85%               │
│  Segurança:       ████████░░░░░░░░░░░░░  30%               │
│  Frontend:        ░░░░░░░░░░░░░░░░░░░░░   0%               │
│  Testes:          ░░░░░░░░░░░░░░░░░░░░░   0%               │
│  CI/CD:           ░░░░░░░░░░░░░░░░░░░░░   0%               │
│  Documentação:    █░░░░░░░░░░░░░░░░░░░░   5%               │
│  Deploy:          ████████████░░░░░░░░░  45%               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Inventário por Módulo

| Módulo | Conclusão | Linhas | Status |
|--------|-----------|--------|--------|
| `@jarbas/types` | 100% | 175 | ✅ Completo |
| `@jarbas/utils` | 100% | 68 | ✅ Completo |
| `@jarbas/config` | 100% | 98 | ✅ Completo |
| `@jarbas/ai-registry` | 95% | 1.200 | ⚠️ 1 bug |
| `@jarbas/hermes-router` | 100% | 154 | ✅ Completo |
| `@jarbas/agent-manager` | 100% | 125 | ⚠️ In-memory |
| `@jarbas/skill-manager` | 100% | 135 | ⚠️ In-memory |
| `@jarbas/prompt-engine` | 100% | 139 | ⚠️ In-memory |
| `@jarbas/memory-manager` | 100% | 154 | ✅ Qdrant |
| `@jarbas/cost-optimizer` | 100% | 175 | ⚠️ In-memory |
| `@jarbas/analytics-engine` | 100% | 153 | ⚠️ In-memory |
| `@jarbas/supabase-client` | 100% | 312 | ✅ Completo |
| `@jarbas/brainapi-client` | 100% | 138 | ✅ Completo |
| `@jarbas/auth-service` | 70% | 148 | ⚠️ SHA-256 |
| `@jarbas/api-gateway` | 85% | 638 | ⚠️ Sem middleware |
| `jarbas-pwa` | 0% | 0 | ❌ Vazio |
| Infraestrutura | 40% | 250 | ⚠️ Parcial |
| Testes | 0% | 0 | ❌ Nenhum |
| CI/CD | 0% | 0 | ❌ Nenhum |
| Documentação | 5% | 100 | ❌ Mínimo |

### 2.4 Bugs Conhecidos

| ID | Severidade | Descrição | Status |
|----|------------|-----------|--------|
| BUG-1 | Crítico | Import path incorreto OpenRouterProvider | Aberto |
| BUG-2 | Crítico | 5 tsconfig.json com path errado | Aberto |
| BUG-3 | Crítico | Dockerfile faltando 8 packages | Aberto |
| BUG-4 | Crítico | Falta pnpm-lock.yaml | Aberto |
| BUG-5 | Crítico | Type mismatch addSessionMessage | Aberto |
| SEC-1 | Crítico | Senhas com SHA-256 | Aberto |
| SEC-2 | Alto | API keys expostas no repo | Aberto |
| SEC-3 | Alto | Credenciais hardcoded | Aberto |

---

## 3. Arquitetura Geral

### 3.1 Diagrama de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION                           │
│                    ┌──────────────┐                         │
│                    │  jarbas-pwa  │  React/Vite PWA         │
│                    └──────────────┘                         │
├─────────────────────────────────────────────────────────────┤
│                       GATEWAY                               │
│              ┌─────────────────────────┐                   │
│              │     api-gateway         │  Express + CORS    │
│              │  (40+ REST endpoints)   │  Auth Middleware    │
│              └─────────────────────────┘                   │
├─────────────────────────────────────────────────────────────┤
│                       SERVICES                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │auth-service│  │   memory   │  │   brainapi-client  │   │
│  │  JWT/API   │  │  (Qdrant)  │  │  (Knowledge Graph) │   │
│  └────────────┘  └────────────┘  └────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                        CORE                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ ai-registry │  │ hermes-router│  │  prompt-engine   │  │
│  │  (7 providers│  │ (4 strategies│  │  (templates)     │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │agent-manager│  │ skill-manager│  │  cost-optimizer  │  │
│  │  (CRUD+sess) │  │  (CRUD+tool) │  │  (budget+alerts) │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │               analytics-engine                      │  │
│  │        (metrics, stats, trends, error rates)        │  │
│  └─────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                        SHARED                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │  types   │  │  config  │  │   utils  │                │
│  └──────────┘  └──────────┘  └──────────┘                │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │PostgreSQL│  │  Redis   │  │  Qdrant  │  │  Ollama  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Fluxo de Dados

```
Client → API Gateway → Auth Middleware → HermesRouter → AIProviderRegistry
                                                          ↓
                                          ┌─────────────────────────────┐
                                          │  DeepSeek │ OpenRouter │ ... │
                                          └─────────────────────────────┘
                                                          ↓
                                          Response → CostOptimizer → AnalyticsEngine
                                                          ↓
                                          MemoryManager ← SupabaseClient
```

### 3.3 Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Language | TypeScript 5.4+ (strict) |
| Runtime | Node.js 20+ |
| Monorepo | pnpm 8+ workspaces |
| Build | TurboRepo 2.0 |
| HTTP Server | Express 4.19 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Vector DB | Qdrant 1.9 |
| AI Local | Ollama (GPU) |
| Auth | Custom JWT (HMAC-SHA256) |
| Deploy (Cloud) | Vercel (serverless) |
| Deploy (Self-hosted) | Docker Compose |
| Frontend | React + Vite (PWA) |
| Testing | Vitest |
| Linting | ESLint + Prettier |

---

## 4. Divisão por Versões

### 4.1 Alpha (v0.1.0 → v0.2.0)

**Objetivo:** Projeto compila, roda localmente, todas as APIs funcionais.

| Marco | Descrição | Data Alvo |
|-------|-----------|-----------|
| α-1 | Todos os bugs críticos resolvidos | Semana 1 |
| α-2 | `pnpm build` compila sem erros | Semana 1 |
| α-3 | `docker-compose up` sobe todos os serviços | Semana 2 |
| α-4 | Endpoints testados manualmente | Semana 2 |
| α-5 | Primeira tag `v0.2.0-alpha` | Semana 2 |

**Módulos Incluídos:**
- Fix de todos os 5 bugs críticos
- Geração de `pnpm-lock.yaml`
- Dockerfile completo
- Teste manual dos 40+ endpoints

**Critérios de Aceite:**
- [ ] `pnpm build` retorna 0 erros
- [ ] `docker-compose up -d` sobe 5 serviços
- [ ] POST `/api/v1/auth/register` retorna tokens
- [ ] POST `/api/v1/chat` retorna resposta de qualquer provider configurado
- [ ] GET `/api/v1/providers` lista providers ativos

---

### 4.2 Beta (v0.2.0 → v0.5.0)

**Objetivo:** Segurança adequada, persistência de dados, testes básicos.

| Marco | Descrição | Data Alvo |
|-------|-----------|-----------|
| β-1 | Senhas com bcrypt/argon2 | Semana 3 |
| β-2 | API keys rotacionadas, hardcoded removido | Semana 3 |
| β-3 | Rate limiting funcional | Semana 4 |
| β-4 | Input validation com Zod | Semana 4 |
| β-5 | Auth migrado para PostgreSQL | Semana 5 |
| β-6 | Agent/Skill/Prompt migrados para PostgreSQL | Semana 6 |
| β-7 | Testes unitários core (60%+ coverage) | Semana 7 |
| β-8 | CI/CD GitHub Actions | Semana 7 |
| β-9 | ESLint + Prettier + husky | Semana 8 |
| β-10 | Tag `v0.5.0-beta` | Semana 8 |

**Módulos Incluídos:**
- `auth-service` → bcrypt + PostgreSQL
- `agent-manager` → PostgreSQL
- `skill-manager` → PostgreSQL
- `prompt-engine` → PostgreSQL
- `cost-optimizer` → PostgreSQL
- `analytics-engine` → PostgreSQL/ClickHouse
- Rate limiting middleware
- Zod validation middleware
- Vitest para todos os core packages
- GitHub Actions CI

**Critérios de Aceite:**
- [ ] Senhas hasheadas com bcrypt (custo 12+)
- [ ] Nenhuma API key hardcoded no código
- [ ] Rate limit retorna 429 após limite
- [ ] Inputs inválidos retornam 400 com mensagem clara
- [ ] Dados persistem entre reinicializações do servidor
- [ ] `pnpm test` passa com 60%+ coverage
- [ ] PR no GitHub roda lint + test automaticamente

---

### 4.3 Release Candidate (v0.5.0 → v0.9.0)

**Objetivo:** Frontend funcional, documentação completa, pronto para beta testers.

| Marco | Descrição | Data Alvo |
|-------|-----------|-----------|
| RC-1 | Frontend: Setup React + Vite + PWA | Semana 9 |
| RC-2 | Frontend: Tela de Login/Registro | Semana 10 |
| RC-3 | Frontend: Tela de Chat com Streaming | Semana 11 |
| RC-4 | Frontend: Seleção de Provider/Modelo | Semana 12 |
| RC-5 | Frontend: Dashboard de Custos | Semana 13 |
| RC-6 | Frontend: Histórico de Conversas | Semana 14 |
| RC-7 | OpenAPI/Swagger Documentation | Semana 15 |
| RC-8 | Contributing Guide + LICENSE | Semana 15 |
| RC-9 | Security Audit externo | Semana 16 |
| RC-10 | Tag `v0.9.0-rc.1` | Semana 16 |

**Módulos Incluídos:**
- `jarbas-pwa` completo
- OpenAPI 3.0 spec
- Documentação de arquitetura
- Guia de contribuição
- Auditoria de segurança

**Critérios de Aceite:**
- [ ] Login/registro funcional via frontend
- [ ] Chat com streaming SSE no browser
- [ ] Troca de provider em tempo real
- [ ] Dashboard mostra custos por provider/modelo
- [ ] PWA instalável (manifest + service worker)
- [ ] Documentação da API completa (Swagger UI)
- [ ] Nenhuma vulnerabilidade crítica encontrada

---

### 4.4 v1.0 (v0.9.0 → v1.0.0)

**Objetivo:** Produção estável, Kubernetes, monitoring, pronto para clientes.

| Marco | Descrição | Data Alvo |
|-------|-----------|-----------|
| 1.0-1 | Kubernetes manifests | Semana 17 |
| 1.0-2 | HPA (auto-scaling) | Semana 17 |
| 1.0-3 | Graceful shutdown | Semana 18 |
| 1.0-4 | HTTPS/TLS config | Semana 18 |
| 1.0-5 | Structured logging (Pino) | Semana 19 |
| 1.0-6 | OpenTelemetry traces | Semana 19 |
| 1.0-7 | Prometheus metrics | Semana 20 |
| 1.0-8 | Load testing (k6/Artillery) | Semana 20 |
| 1.0-9 | Penetration testing | Semana 21 |
| 1.0-10 | Performance optimization | Semana 21 |
| 1.0-11 | Release notes | Semana 22 |
| 1.0-12 | Tag `v1.0.0` + CHANGELOG | Semana 22 |

**Módulos Incluídos:**
- Kubernetes (Deployment, Service, HPA, ConfigMap, Secret)
- TLS/HTTPS (Let's Encrypt ou cert-manager)
- Logging estruturado
- Distributed tracing
- Métricas Prometheus
- Load testing
- Security hardening

**Critérios de Aceite:**
- [ ] `kubectl apply` deploya em cluster K8s
- [ ] HPA escala de 2 a 20 pods baseado em CPU
- [ ] Graceful shutdown completa requests ativos
- [ ] HTTPS forçado em todos os endpoints
- [ ] Logs estruturados (JSON) com correlation ID
- [ ] Traces no Jaeger/Zipkin
- [ ] Métricas no Prometheus/Grafana
- [ ] Suporta 1000 RPS sem degradação
- [ ] Zero vulnerabilidades críticas no pentest
- [ ] Tempo de resposta P95 < 500ms

---

### 4.5 Enterprise (v1.0.0 → v1.5.0)

**Objetivo:** Recursos empresariais: RBAC avançado, audit log, SSO, compliance.

| Marco | Descrição | Data Alvo |
|-------|-----------|-----------|
| ENT-1 | RBAC avançado (roles customizadas) | Semana 23-24 |
| ENT-2 | Audit log (todas as ações) | Semana 25-26 |
| ENT-3 | SSO/SAML integration | Semana 27-28 |
| ENT-4 | LDAP/AD integration | Semana 29-30 |
| ENT-5 | Data residency (LGPD/GDPR) | Semana 31-32 |
| ENT-6 | White-label options | Semana 33-34 |
| ENT-7 | SLA monitoring dashboard | Semana 35-36 |
| ENT-8 | Tag `v1.5.0` | Semana 36 |

**Módulos Incluídos:**
- RBAC engine
- Audit log (append-only)
- SAML/OIDC provider
- LDAP connector
- Data residency middleware
- White-label theming
- SLA dashboard

**Critérios de Aceite:**
- [ ] Roles customizáveis via UI
- [ ] Todas as ações logadas com timestamp + user + IP
- [ ] Login via Okta/Azure AD funcional
- [ ] Dados filtrados por região (EU/BR/US)
- [ ] Tema customizável (logo, cores)
- [ ] Dashboard de SLA com uptime 99.9%

---

### 4.6 v2.0 (v1.5.0 → v2.0.0)

**Objetivo:** Plataforma de marketplace de skills, multi-model orchestration, edge deployment.

| Marco | Descrição | Data Alvo |
|-------|-----------|-----------|
| 2.0-1 | Skill Marketplace | Semana 37-40 |
| 2.0-2 | Multi-model chaining (RAG pipelines) | Semana 41-44 |
| 2.0-3 | Edge deployment (Jetson/RPi) | Semana 45-48 |
| 2.0-4 | Federated learning support | Semana 49-52 |
| 2.0-5 | Real-time collaboration (WebSocket) | Semana 53-56 |
| 2.0-6 | Advanced analytics (ML-powered) | Semana 57-60 |
| 2.0-7 | Tag `v2.0.0` | Semana 60 |

**Módulos Incluídos:**
- Skill Marketplace (publish, install, rating)
- Pipeline builder (visual RAG)
- Edge runtime (ARM64 optimized)
- Federated learning coordinator
- WebSocket collaboration
- ML-powered analytics

---

## 5. Roadmap por Sprints

### SPRINT 1: FIX CRÍTICO
**Duração:** 3 dias
**Versão:** v0.1.1-alpha

#### Objetivo
O projeto deve compilar sem erros e rodar localmente via `docker-compose up`.

#### Módulos
| Módulo | Ação |
|--------|------|
| `ai-registry` | Corrigir import path OpenRouterProvider |
| `ai-registry/tsconfig.json` | Corrigir extends path |
| `memory-manager/tsconfig.json` | Corrigir extends path |
| `hermes-router/tsconfig.json` | Corrigir extends path |
| `auth-service/tsconfig.json` | Corrigir extends path |
| `api-gateway/tsconfig.json` | Corrigir extends path |
| `api-gateway/src/index.ts` | Corrigir type mismatch addSessionMessage |
| Root | Gerar `pnpm-lock.yaml` via `pnpm install` |
| `docker/Dockerfile` | Adicionar 8 packages faltando |

#### Dependências
- Acesso ao repositório
- Node.js 20+ instalado
- pnpm 8+ instalado

#### Critérios de Aceite
- [ ] `pnpm install` completa sem erros
- [ ] `pnpm build` compila todos os 15 packages
- [ ] `docker-compose build` gera imagem com sucesso
- [ ] `docker-compose up -d` sobe 5 serviços (postgres, redis, qdrant, ollama, api-gateway)
- [ ] `curl http://localhost:3000/health` retorna `{"status":"ok"}`
- [ ] Nenhum erro de TypeScript em nenhum package

#### Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Outros bugs de compilação surgem | Média | Alto | Revisar todos os imports antes de fechar |
| pnpm-lock.yaml conflita | Baixa | Médio | Usar `pnpm install` limpo |
| Docker build lento | Baixa | Baixo | Usar cache de layers |

#### Tempo Estimado
- Correção de bugs: 4 horas
- Geração de lockfile: 30 minutos
- Correção do Dockerfile: 1 hora
- Testes manuais: 2 horas
- **Total: 7.5 horas (1 dia útil)**

---

### SPRINT 2: SEGURANÇA
**Duração:** 5 dias (1 semana)
**Versão:** v0.2.0-alpha

#### Objetivo
Todas as vulnerabilidades de segurança críticas e altas resolvidas. Projeto seguro para ambiente de teste.

#### Módulos
| Módulo | Ação |
|--------|------|
| `auth-service` | Substituir SHA-256 por bcrypt (cost 12) |
| `.env` | Rotacionar todas as API keys |
| `config/src/index.ts` | Remover credenciais hardcoded |
| `api-gateway` | Adicionar `express-rate-limit` |
| `api-gateway` | Adicionar `zod` para validação de input |
| `api-gateway` | Configurar CORS restritivo |
| `api-gateway` | Adicionar security headers (helmet) |
| Root | Adicionar `.env` ao `.gitignore` (verificar history) |

#### Dependências
- Sprint 1 concluída
- `bcrypt` ou `argon2` instalado
- `express-rate-limit` instalado
- `zod` instalado
- `helmet` instalado

#### Critérios de Aceite
- [ ] Senhas hasheadas com bcrypt (custo 12+)
- [ ] Teste: hash de 1000 senhas < 2 segundos
- [ ] Nenhuma API key visível no código fonte
- [ ] `.env` não está no git history (ou está limpo)
- [ ] Rate limit: 429 retornado após 100 requests/min
- [ ] Input inválido retorna 400 com mensagem clara
- [ ] CORS bloqueia requests de origens não autorizadas
- [ ] Security headers presentes (X-Content-Type-Options, etc.)

#### Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| bcrypt quebra compatibilidade com dados existentes | Alta | Alto | Migrar senhas no login (re-hash) |
| Rate limit bloqueia requests legítimos | Média | Médio | Configurar limites generosos primeiro |
| API keys ainda expostas em commits anteriores | Alta | Crítico | Force push ou repositório novo |

#### Tempo Estimado
- bcrypt migration: 4 horas
- API key rotation: 2 horas
- Rate limiting: 3 horas
- Input validation: 4 horas
- Security headers: 1 hora
- Testes: 4 horas
- **Total: 18 horas (2.5 dias)**

---

### SPRINT 3: PERSISTÊNCIA
**Duração:** 5 dias (1 semana)
**Versão:** v0.3.0-alpha

#### Objetivo
Todos os dados persistem entre reinicializações. PostgreSQL como store primário.

#### Módulos
| Módulo | Ação |
|--------|------|
| Infrastructure | Setup Drizzle ORM + migration runner |
| `auth-service` | Migrar users, api_keys, refresh_tokens para PostgreSQL |
| `agent-manager` | Migrar agents, sessions para PostgreSQL |
| `skill-manager` | Migrar skills para PostgreSQL |
| `prompt-engine` | Migrar templates para PostgreSQL |
| `cost-optimizer` | Migrar costs, budgets, alerts para PostgreSQL |
| `analytics-engine` | Migrar metrics para PostgreSQL (ou ClickHouse) |
| Root | Criar `db:migrate` e `db:seed` scripts |

#### Dependências
- Sprint 2 concluída
- PostgreSQL rodando (docker-compose)
- Drizzle ORM instalado
- Schema SQL atualizado

#### Critérios de Aceite
- [ ] `pnpm db:migrate` cria todas as tabelas
- [ ] `pnpm db:seed` popula dados de teste
- [ ] Usuário registrado persiste após restart do servidor
- [ ] Agent criado persiste após restart
- [ ] Skill criada persiste após restart
- [ ] Prompt template persiste após restart
- [ ] Cost entries persistem após restart
- [ ] Analytics metrics persistem após restart
- [ ] Todos os testes existentes continuam passando

#### Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Migração quebra dados existentes | Média | Alto | Scripts de migration com backup |
| Performance degrada com PostgreSQL | Baixa | Médio | Connection pooling (pgBouncer) |
| Conflitos de schema | Média | Médio | Versionamento de migrations |

#### Tempo Estimado
- Setup Drizzle: 4 horas
- Migration auth: 4 horas
- Migration managers: 6 horas
- Scripts db:migrate/seed: 3 horas
- Testes: 5 horas
- **Total: 22 horas (3 dias)**

---

### SPRINT 4: TESTES
**Duração:** 5 dias (1 semana)
**Versão:** v0.4.0-alpha

#### Objetivo
Cobertura mínima de 60% nos core packages. Testes automatizados rodando no CI.

#### Módulos
| Módulo | Ação |
|--------|------|
| Root | Configurar Vitest global + coverage |
| `@jarbas/types` | Testes de tipos (type-level tests) |
| `@jarbas/utils` | Testes unitários (todas as funções) |
| `@jarbas/config` | Testes de configuração |
| `@jarbas/ai-registry` | Testes com providers mockados |
| `@jarbas/hermes-router` | Testes de roteamento |
| `@jarbas/agent-manager` | Testes CRUD + sessions |
| `@jarbas/skill-manager` | Testes CRUD + tool parsing |
| `@jarbas/prompt-engine` | Testes CRUD + render |
| `@jarbas/memory-manager` | Testes com Qdrant mockado |
| `@jarbas/cost-optimizer` | Testes de budget + alerts |
| `@jarbas/analytics-engine` | Testes de metrics + stats |
| `api-gateway` | Testes de integração (supertest) |

#### Dependências
- Sprint 3 concluída
- Vitest configurado
- Supertest instalado

#### Critérios de Aceite
- [ ] `pnpm test` passa em todos os packages
- [ ] Coverage global > 60%
- [ ] Nenhum teste depende de serviços externos (tudo mockado)
- [ ] Testes rodam em < 30 segundos
- [ ] CI roda testes em todo PR

#### Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Mocks complexos demais | Média | Médio | Usar MSW para HTTP mocking |
| Testes lentos | Baixa | Baixo | Parallelização via Vitest |
| Coverage inflado por testes triviais | Média | Baixo | Definir métricas de qualidade |

#### Tempo Estimado
- Setup Vitest: 2 horas
- Testes utils/types/config: 3 horas
- Testes ai-registry: 4 horas
- Testes hermes-router: 3 horas
- Testes managers (4 packages): 6 horas
- Testes api-gateway: 4 horas
- **Total: 22 horas (3 dias)**

---

### SPRINT 5: CI/CD & QUALIDADE
**Duração:** 3 dias
**Versão:** v0.4.1-alpha

#### Objetivo
Pipeline completo de CI/CD. Todo PR automaticamente testado e lintado.

#### Módulos
| Módulo | Ação |
|--------|------|
| Root | Configurar ESLint + Prettier |
| Root | Configurar husky + lint-staged |
| GitHub | Criar `.github/workflows/ci.yml` |
| GitHub | Criar `.github/workflows/cd.yml` |
| GitHub | Criar `.github/ISSUE_TEMPLATE` |
| GitHub | Criar `.github/PULL_REQUEST_TEMPLATE.md` |
| Root | Adicionar `lint` e `format` scripts |

#### Dependências
- Sprint 4 concluída
- Repositório GitHub configurado

#### Critérios de Aceite
- [ ] `pnpm lint` passa sem erros
- [ ] `pnpm format` formata todo o código
- [ ] Pre-commit hook roda lint + format
- [ ] CI roda em todo PR: lint → test → build
- [ ] CD faz deploy automático em push para main
- [ ] Issues e PRs têm templates

#### Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Lint rules conflitam com código existente | Alta | Baixo | Auto-fix primeiro |
| CI lento | Média | Baixo | Cache de dependencies |
| CD deploy falha | Média | Médio | Smoke tests antes do deploy |

#### Tempo Estimado
- ESLint + Prettier: 2 horas
- Husky + lint-staged: 1 hora
- GitHub Actions CI: 3 horas
- GitHub Actions CD: 3 horas
- Templates: 1 hora
- **Total: 10 horas (1.5 dias)**

---

### SPRINT 6: FRONTEND FUNDAMENTOS
**Duração:** 5 dias (1 semana)
**Versão:** v0.5.0-beta

#### Objetivo
Frontend funcional com login, chat básico e seleção de provider.

#### Módulos
| Módulo | Ação |
|--------|------|
| `jarbas-pwa` | Setup React + Vite + TypeScript |
| `jarbas-pwa` | Setup Tailwind CSS + shadcn/ui |
| `jarbas-pwa` | Configuração de rotas (React Router) |
| `jarbas-pwa` | Tela de Login/Registro |
| `jarbas-pwa` | Tela de Chat com streaming SSE |
| `jarbas-pwa` | Seleção de Provider/Modelo |
| `jarbas-pwa` | Context de autenticação |
| `jarbas-pwa` | API client (fetch wrapper) |

#### Dependências
- Sprint 5 concluída
- React 18+ instalado
- Vite configurado
- API Gateway rodando

#### Critérios de Aceite
- [ ] `pnpm dev` no jarbas-pwa abre no browser
- [ ] Login/registro funcional
- [ ] Chat com streaming funcional (resposta aparece word-by-word)
- [ ] Usuário pode trocar de provider/modelo
- [ ] Layout responsivo (mobile + desktop)
- [ ] PWA manifest presente

#### Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| SSE streaming complica no React | Média | Médio | Usar library existente |
| CORS bloqueia frontend | Alta | Baixo | Configurar origins no backend |
| Performance de rendering | Baixa | Baixo | Virtualização se necessário |

#### Tempo Estimado
- Setup projeto: 3 horas
- Auth flow: 4 horas
- Chat screen: 6 horas
- Provider selection: 3 horas
- API client: 2 horas
- Layout/UX: 4 horas
- **Total: 22 horas (3 dias)**

---

### SPRINT 7: FRONTEND COMPLETO
**Duração:** 5 dias (1 semana)
**Versão:** v0.6.0-beta

#### Objetivo
Dashboard completo com custos, histórico, settings e admin.

#### Módulos
| Módulo | Ação |
|--------|------|
| `jarbas-pwa` | Dashboard de Custos (gráfico) |
| `jarbas-pwa` | Histórico de Conversas |
| `jarbas-pwa` | Gerenciamento de Skills |
| `jarbas-pwa` | Gerenciamento de Agents |
| `jarbas-pwa` | Gerenciamento de Prompts |
| `jarbas-pwa` | Settings (perfil, API keys) |
| `jarbas-pwa` | PWA offline support |
| `jarbas-pwa` | Service Worker |

#### Dependências
- Sprint 6 concluída
- Recharts ou Victory para gráficos
- Service Worker registration

#### Critérios de Aceite
- [ ] Dashboard mostra custos por provider/dia
- [ ] Histórico de conversas listado com busca
- [ ] Skills podem ser criadas/editadas/deletadas via UI
- [ ] Agents podem ser criados/editados/deletados via UI
- [ ] Prompts podem ser criados/editados/renderizados via UI
- [ ] Usuário pode ver/regenerar API keys
- [ ] PWA funciona offline (chat cached)
- [ ] Install prompt aparece em mobile

#### Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Gráficos complexos demais | Média | Baixo | Usar biblioteca pronta |
| Offline sync complicado | Média | Médio | Cache simples primeiro |
| State management complexo | Média | Médio | Zustand ou Jotai |

#### Tempo Estimado
- Dashboard custos: 4 horas
- Histórico: 3 horas
- Skills/Agents/Prompts CRUD: 6 horas
- Settings: 3 horas
- PWA offline: 4 horas
- Testes E2E básicos: 3 horas
- **Total: 23 horas (3 dias)**

---

### SPRINT 8: DOCUMENTAÇÃO
**Duração:** 3 dias
**Versão:** v0.7.0-beta

#### Objetivo
Documentação completa para desenvolvedores e usuários.

#### Módulos
| Módulo | Ação |
|--------|------|
| Root | OpenAPI 3.0 specification |
| Root | Swagger UI endpoint |
| `docs/` | Guia de Arquitetura |
| `docs/` | Guia de Contribuição |
| `docs/` | Guia de Deploy |
| `docs/` | Guia de Configuração |
| Root | CHANGELOG.md |
| Root | LICENSE (MIT ou Private) |
| Root | Atualizar README.md completo |

#### Dependências
- Sprint 7 concluída
- Todos os endpoints documentados

#### Critérios de Aceite
- [ ] `/docs` mostra Swagger UI funcional
- [ ] OpenAPI spec valida sem erros
- [ ] Guia de arquitetura explica todas as camadas
- [ ] Guia de contribuição tem setup passo-a-passo
- [ ] Guia de deploy cobre Docker + Vercel + K8s
- [ ] CHANGELOG documenta todas as versões
- [ ] README tem badges, screenshots, examples

#### Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| OpenAPI incompleto | Média | Médio | Gerar de tipos TypeScript |
| Docs desatualizados | Alta | Baixo | CI verifica docs |

#### Tempo Estimado
- OpenAPI spec: 4 horas
- Swagger UI: 1 hora
- Docs (4 guias): 6 horas
- CHANGELOG + LICENSE: 1 hora
- README: 2 horas
- **Total: 14 horas (2 dias)**

---

### SPRINT 9: INFRAESTRUTURA
**Duração:** 5 dias (1 semana)
**Versão:** v0.8.0-beta

#### Objetivo
Deploy em Kubernetes funcional com auto-scaling e monitoring.

#### Módulos
| Módulo | Ação |
|--------|------|
| `kubernetes/` | Deployment manifests |
| `kubernetes/` | Service + Ingress |
| `kubernetes/` | HPA (Horizontal Pod Autoscaler) |
| `kubernetes/` | ConfigMap + Secret |
| `kubernetes/` | PersistentVolumeClaim |
| Root | Graceful shutdown handler |
| Root | HTTPS/TLS config (cert-manager) |
| Root | Structured logging (Pino) |
| Root | OpenTelemetry setup |
| Root | Prometheus metrics endpoint |

#### Dependências
- Sprint 8 concluída
- Cluster K8s disponível (minikube para dev)
- cert-manager instalado

#### Critérios de Aceite
- [ ] `kubectl apply -f kubernetes/` deploya tudo
- [ ] HPA escala de 2-20 pods
- [ ] Graceful shutdown completa requests ativos
- [ ] HTTPS funciona com certificado válido
- [ ] Logs em formato JSON com correlation ID
- [ ] Métricas disponíveis em `/metrics`
- [ ] Traces visíveis no Jaeger

#### Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| K8s manifests incorretos | Média | Alto | Testar em minikube primeiro |
| TLS setup complexo | Média | Médio | Usar Let's Encrypt + cert-manager |
| Memory leaks em longa duração | Baixa | Alto | Profiling antes do deploy |

#### Tempo Estimado
- K8s manifests: 6 horas
- Graceful shutdown: 2 horas
- HTTPS/TLS: 3 horas
- Logging: 3 horas
- OpenTelemetry: 4 horas
- Prometheus: 2 horas
- Testes: 4 horas
- **Total: 24 horas (3 dias)**

---

### SPRINT 10: PERFORMANCE & SECURITY
**Duração:** 5 dias (1 semana)
**Versão:** v0.9.0-rc.1

#### Objetivo
Otimização de performance e hardening de segurança para produção.

#### Módulos
| Módulo | Ação |
|--------|------|
| Root | Load testing (k6 ou Artillery) |
| Root | Performance profiling |
| Root | Memory leak detection |
| Root | Security hardening |
| Root | Penetration testing |
| Root | Vulnerability scanning (npm audit) |
| Root | Dependency updates |
| Root | Bundle optimization |

#### Dependências
- Sprint 9 concluída
- k6 ou Artillery instalado
- OWASP ZAP para pentest

#### Critérios de Aceite
- [ ] Suporta 1000 RPS sem erro
- [ ] P95 latency < 500ms
- [ ] P99 latency < 1000ms
- [ ] Zero memory leaks em 24h
- [ ] Zero vulnerabilidades críticas
- [ ] npm audit sem high/critical
- [ ] Bundle size < 500KB (gzipped)

#### Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Bottleneck no database | Média | Alto | Connection pooling + indexes |
| Memory leak em streaming | Média | Alto | Profiling contínuo |
| Vulnerabilidades em deps | Alta | Médio | Automated scanning |

#### Tempo Estimado
- Load testing: 4 horas
- Performance profiling: 4 horas
- Security hardening: 4 horas
- Pentest: 4 horas
- Vulnerability scanning: 2 horas
- Otimizações: 6 horas
- **Total: 24 horas (3 dias)**

---

### SPRINT 11: RELEASE PREPARATION
**Duração:** 3 dias
**Versão:** v1.0.0

#### Objetivo
Preparação final para o release 1.0.

#### Módulos
| Módulo | Ação |
|--------|------|
| Root | Release notes |
| Root | Migration guide |
| Root | Breaking changes documentation |
| Root | Version bump (v1.0.0) |
| Root | Git tag + GitHub Release |
| Root | Docker image publish |
| Root | npm publish (se aplicável) |

#### Dependências
- Sprint 10 concluída
- Todos os testes passando
- Documentação completa

#### Critérios de Aceite
- [ ] Release notes documentam todas as features
- [ ] Migration guide para usuários v0.x
- [ ] Git tag `v1.0.0` criada
- [ ] GitHub Release com changelog
- [ ] Docker image publicada no registry
- [ ] Zero bugs abertos com severidade crítica/alta

#### Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Bug de último momento | Média | Alto | Feature freeze 1 semana antes |
| Docker image grande demais | Baixa | Baixo | Multi-stage build otimizado |
| Release notes incompletas | Média | Médio | Review coletivo |

#### Tempo Estimado
- Release notes: 3 horas
- Migration guide: 2 horas
- Version bump + tag: 1 hora
- Docker publish: 2 horas
- Smoke tests: 2 horas
- **Total: 10 horas (1.5 dias)**

---

### CORE PACKAGES SPRINTS: IMPLEMENTAÇÃO DOS MÓDULOS CENTRAIS

#### SPRINT 01: HERMES CORE
**Status:** ✅ CONCLUÍDO
**Módulos:** 16 | **Testes:** 172/172 | **TS Errors:** 0

#### SPRINT 02: KNOWLEDGE HUB
**Status:** ✅ CONCLUÍDO
**Módulos:** 21 | **Testes:** 149/149 | **TS Errors:** 0

#### SPRINT 03: VOICE ENGINE
**Status:** ✅ CONCLUÍDO
**Módulos:** 36 | **Testes:** 107/107 | **TS Errors:** 0

#### SPRINT 05: MEETING AI
**Status:** ✅ CONCLUÍDO
**Módulos:** 41 | **Testes:** 73/73 | **TS Errors:** 0

#### SPRINT 06: WHATSAPP AI
**Status:** ✅ CONCLUÍDO
**Módulos:** 23 | **Testes:** 117/117 | **TS Errors:** 0

#### SPRINT 07: EMAIL AI
**Status:** ✅ CONCLUÍDO
**Módulos:** 26 | **Testes:** 143/143 | **TS Errors:** 0
**Componentes:** EmailGateway, ProviderRegistry, MailboxManager, SyncEngine, FolderManager, ConversationEngine, PriorityEngine, ClassificationEngine, SpamDetector, PhishingAnalyzer, AttachmentManager, DocumentParser, AIResponseEngine, ApprovalWorkflow, DraftGenerator, SignatureManager, ContactManager, CRMSync, CalendarSync, TaskSync, NotificationEngine, Analytics, Monitoring, Security, EmailAPI, EmailAI

---

## 6. Timeline Completa

### 6.1 Visão Geral (60 semanas / ~14 meses)

```
2026
Jul     Ago     Set     Out     Nov     Dez
|-------|-------|-------|-------|-------|-------
S1  S2  S3  S4  S5  S6  S7  S8  S9  S10 S11
|   |   |   |   |   |   |   |   |   |   |
▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼
FIX SEC PER TST CIC FND CMP DOC INF PRF REL
    |                                   |
    └─────── ALPHA (v0.2.0) ───────────┘
                |
                └─────── BETA (v0.7.0) ────────────────┘
                            |
                            └────── RC (v0.9.0) ───────┘
                                        |
                                        └── 1.0 ──┘

2027
Jan     Fev     Mar     Abr     Mai     Jun
|-------|-------|-------|-------|-------|-------
        ENT-1  ENT-2  ENT-3  ENT-4  ENT-5
        |      |      |      |      |
        └──────┴──────┴──────┴──────┘
                    |
                ENTERPRISE (v1.5.0)

Jul     Ago     Set     Out     Nov     Dez
|-------|-------|-------|-------|-------|-------
2.0-1   2.0-2  2.0-3  2.0-4  2.0-5  2.0-6
|       |      |      |      |      |
└───────┴──────┴──────┴──────┴──────┘
                |
            v2.0.0
```

### 6.2 Marcos Principais

| Marco | Versão | Data Alvo | Status |
|-------|--------|-----------|--------|
| α-1 | v0.2.0-alpha | Jul 2026 (Semana 2) | 🔄 Próximo |
| β-1 | v0.5.0-beta | Set 2026 (Semana 8) | ⏳ Planejado |
| RC-1 | v0.9.0-rc.1 | Nov 2026 (Semana 16) | ⏳ Planejado |
| 1.0 | v1.0.0 | Jan 2027 (Semana 22) | ⏳ Planejado |
| ENT | v1.5.0 | Jun 2027 (Semana 36) | ⏳ Planejado |
| 2.0 | v2.0.0 | Dez 2027 (Semana 60) | ⏳ Planejado |

### 6.3 Resumo de Esforço

| Fase | Sprints | Dias | Semanas | Versão |
|------|---------|------|---------|--------|
| Alpha | S1-S2 | 8 | 2 | v0.2.0 |
| Beta | S3-S8 | 26 | 6 | v0.7.0 |
| RC | S9-S10 | 10 | 2 | v0.9.0 |
| Release | S11 | 3 | 0.5 | v1.0.0 |
| Enterprise | ENT | 40 | 8 | v1.5.0 |
| v2.0 | 2.0 | 60 | 14 | v2.0.0 |
| **Total** | **30+** | **147** | **32.5** | **v2.0.0** |

### 6.4 Milestones por Trimestre

**Q3 2026 (Jul-Set):**
- ✅ Projeto compila e roda
- ✅ Segurança adequada
- ✅ Dados persistem
- ✅ Testes básicos
- ✅ CI/CD funcional

**Q4 2026 (Out-Dez):**
- ✅ Frontend funcional
- ✅ Documentação completa
- ✅ Deploy em K8s
- ✅ Performance validada
- ✅ v1.0.0 released

**Q1 2027 (Jan-Mar):**
- ✅ Enterprise features
- ✅ RBAC avançado
- ✅ Audit log
- ✅ SSO/SAML

**Q2 2027 (Abr-Jun):**
- ✅ LGPD/GDPR compliance
- ✅ White-label
- ✅ SLA dashboard
- ✅ v1.5.0 released

**Q3-Q4 2027 (Jul-Dez):**
- ✅ Skill Marketplace
- ✅ Multi-model chaining
- ✅ Edge deployment
- ✅ v2.0.0 released

### 6.5 Dependências Críticas entre Sprints

```
S1 (Fix) ──→ S2 (Segurança) ──→ S3 (Persistência) ──→ S4 (Testes)
                                                           │
                                                           ▼
                                                    S5 (CI/CD)
                                                           │
                                                           ▼
                                                    S6 (Frontend Fund)
                                                           │
                                                           ▼
                                                    S7 (Frontend Comp)
                                                           │
                                                           ▼
                                                    S8 (Documentação)
                                                           │
                                                           ▼
                                                    S9 (Infraestrutura)
                                                           │
                                                           ▼
                                                    S10 (Performance)
                                                           │
                                                           ▼
                                                    S11 (Release)
                                                           │
                                                           ▼
                                                    v1.0.0 🎉
```

---

## Appendices

### A. Glossário

| Termo | Definição |
|-------|-----------|
| Provider | Provedor de AI (DeepSeek, OpenRouter, etc.) |
| Router | Componente que seleciona o melhor provider |
| Skill | Habilidade customizável do sistema |
| Agent | Entidade AI autônoma com memória e skills |
| Prompt Template | Template reutilizável para prompts |
| Tenant | Organização/empresa no sistema multi-tenancy |
| Cost Budget | Limite mensal de gastos por tenant |

### B. Referências

- [PROJECT_AUDIT.md](./PROJECT_AUDIT.md) - Auditoria completa do projeto
- [README.md](./README.md) - Guia rápido do projeto
- [.env.example](./.env.example) - Template de configuração

---

*Documento criado pelo Arquiteto Principal em 12/07/2026*
*Última atualização: 12/07/2026*
