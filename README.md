# JARBAS 2.0 - Hermes Platform

AI Orchestration & Intelligence Platform - Provider-agnostic, modular, scalable.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment config
cp .env.example .env
# Edit .env with your API keys

# 3. Start infrastructure
docker-compose up -d

# 4. Start dev server
pnpm dev
```

## API Usage

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"User","tenantId":"my-org"}'

# Chat
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

## Providers

| Provider | Status | Models |
|----------|--------|--------|
| DeepSeek | Active | deepseek-chat, deepseek-reasoner |
| OpenRouter | Active | 200+ models |
| NVIDIA NIM | Active | Llama, Nemotron, Mixtral |
| ZhipuAI/GLM | Active | glm-4-flash, glm-4-plus |
| Ollama | Local | Any local model |
| OpenCode | Local | OpenCode models |

## Architecture

- **Clean Architecture** + Hexagonal (Ports & Adapters)
- **Monorepo** with pnpm + TurboRepo
- **TypeScript** strict mode throughout
- Real API integrations (no mocks)

## License

Private - All rights reserved.
