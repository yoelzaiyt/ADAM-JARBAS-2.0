# JARBAS 2.0 — ROLLBACK PLAN

**Data:** 2026-07-13
**Classification:** CONFIDENTIAL
**Auditor:** DevOps Engineer

---

## 1. FILOSOFIA DE ROLLBACK

Cada fase de remediação deve ser **independente e reversível**. Nenhuma mudança deve ser "irreversível" sem backup e script de reversão.

**Princípios:**
1. Cada feature branch deve ter rollback script
2. Migrations devem ter down migration
3. Dados devem ter backup antes de migração
4. Deploy deve ser蓝绿 (blue-green) ou canary

---

## 2. ROLLBACK POR FASE

### Fase 1 — Correções Críticas

| Ação | Rollback | Risco | Tempo |
|------|----------|-------|-------|
| Rotacionar chaves | Revert commit + usar chaves antigas | BAIXO | 5min |
| Migrar para bcrypt | Manter SHA-256 como fallback | MÉDIO | 10min |
| Fix JWT timing | Revert commit | BAIXO | 2min |
| JWT secret hardcoded | Revert commit | BAIXO | 2min |
| CORS explícito | Revert commit | BAIXO | 2min |
| Rate limiting | Revert commit | BAIXO | 2min |
| Helmet | Revert commit | BAIXO | 2min |
| JWT 15min | Aumentar para 7d novamente | BAIXO | 2min |

**Procedimento de Rollback Fase 1:**
```bash
# Reverter último commit
git revert HEAD --no-edit

# Restart services
docker-compose restart api-gateway

# Verificar
curl http://localhost:3000/health
```

### Fase 2 — Segurança Enterprise

| Ação | Rollback | Risco | Tempo |
|------|----------|-------|-------|
| Input validation | Remover middleware Zod | BAIXO | 5min |
| JWT 15min | Aumentar lifetime | BAIXO | 2min |
| Refresh rotation | Desabilitar rotation | MÉDIO | 10min |
| Generic errors | Revert handler | BAIXO | 5min |
| HTTPS | Desabilitar redirect | BAIXO | 2min |
| Non-root container | Revert Dockerfile | BAIXO | 5min |
| Redis/Qdrant auth | Remover passwords | BAIXO | 5min |
| Audit trail | Drop table audit_logs | BAIXO | 5min |

### Fase 3 — Performance

| Ação | Rollback | Risco | Tempo |
|------|----------|-------|-------|
| Auth → PostgreSQL | Voltar para in-memory Map | MÉDIO | 30min |
| Cost → PostgreSQL | Voltar para in-memory Array | MÉDIO | 30min |
| Analytics → PostgreSQL | Voltar para in-memory Array | MÉDIO | 30min |
| Connection pooling | Remover Pool, usar client direto | BAIXO | 10min |
| Pagination | Remover offset/limit | BAIXO | 5min |
| Compression | Remover middleware | BAIXO | 2min |

**Rollback de Migração de Dados:**
```bash
# Antes de migrar auth para PostgreSQL:
# 1. Backup do estado atual
cp -r packages/services/auth-service/data ./backup-auth-$(date +%Y%m%d)

# 2. Migrations reversíveis
pnpm db:rollback --to=001

# 3. Revert código
git revert <commit-hash>
```

### Fase 4 — Escalabilidade

| Ação | Rollback | Risco | Tempo |
|------|----------|-------|-------|
| Agent → PostgreSQL | Voltar para in-memory | MÉDIO | 30min |
| Skill → PostgreSQL | Voltar para in-memory | MÉDIO | 30min |
| Prompt → PostgreSQL | Voltar para in-memory | MÉDIO | 30min |
| RLS fix | Reverter policies | BAIXO | 10min |
| Migrations 002-005 | pnpm db:rollback | MÉDIO | 15min |
| Event bus | Remover event bus | BAIXO | 10min |

### Fases 5-8 — Qualidade, Docs, Testes, RC1

| Ação | Rollback | Risco | Tempo |
|------|----------|-------|-------|
| ESLint config | Remover .eslintrc | BAIXO | 2min |
| Coverage thresholds | Reverter vitest.config | BAIXO | 2min |
| Testes | Remover arquivos de teste | BAIXO | 2min |
| CI/CD | Remover workflow | BAIXO | 2min |
| Docs | Remover arquivos | BAIXO | 2min |

---

## 3. PLANO DE BACKUP

### Antes de Cada Fase

| Fase | O que backup | Método | Retenção |
|------|-------------|--------|----------|
| Fase 1 | .env, config | git stash | 30 dias |
| Fase 2 | .env, config | git stash | 30 dias |
| Fase 3 | PostgreSQL dump | pg_dump | 90 dias |
| Fase 4 | PostgreSQL dump | pg_dump | 90 dias |
| Fase 5-8 | Git tags | git tag | Permanente |

### Scripts de Backup

```bash
# Backup completo antes de cada fase
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)

# 1. Git backup
git stash push -m "pre-phase-backup-$DATE"

# 2. Database backup
pg_dump -U jarbas jarbas_db > backup-$DATE.sql

# 3. Config backup
cp .env .env.backup-$DATE

# 4. Criar tag
git tag -a "pre-phase-$DATE" -m "Backup before phase"
```

---

## 4. DEPLOY ESTRATÉGIA

### Blue-Green Deploy

```
┌─────────────┐     ┌─────────────┐
│   BLUE      │     │   GREEN     │
│  (current)  │     │  (new)      │
│  Port 3000  │     │  Port 3001  │
└──────┬──────┘     └──────┬──────┘
       │                    │
       └────────┬───────────┘
                │
         ┌──────▼──────┐
         │   Load      │
         │  Balancer   │
         └─────────────┘
```

**Procedimento:**
1. Deploy nova versão em GREEN (port 3001)
2. Rodar smoke tests em GREEN
3. Switch load balancer para GREEN
4. Monitorar por 15min
5. Se OK, BLUE vira standby
6. Se NOK, switch de volta para BLUE

### Rollback via Load Balancer

```bash
# Switch de volta para BLUE
curl -X POST http://lb:8080/switch --data '{"target": "blue"}'

# Verificar
curl http://lb:8080/health
```

---

## 5. CRITÉRIOS DE ROLLBACK

### Automático (Trigger)

| Condição | Ação | Notificação |
|----------|------|-------------|
| Error rate > 5% | Rollback automático | Slack + PagerDuty |
| Response time p95 > 1s | Rollback automático | Slack |
| Memory usage > 80% | Alert + rollback manual | Slack |
| Health check fail 3x | Rollback automático | Slack + PagerDuty |

### Manual (Decisão CTO)

| Condição | Decisão |
|----------|---------|
| Bug funcional reportado | Investigar → Hotfix ou Rollback |
| Performance degradada | Investigar → Otimizar ou Rollback |
| Segurança comprometida | Rollback imediato |

---

## 6. COMUNICAÇÃO DURANTE ROLLBACK

### Template de Notificação

```
🔴 ROLLBACK INICIADO
Fase: [Fase X]
Motivo: [Descrição]
Impacto: [Usuários afetados]
ETA para resolução: [Tempo estimado]
Responsável: [Nome]
Status: [Em andamento / Concluído]
```

### Canais

| Canal | Audiência | Quando |
|-------|-----------|--------|
| Slack #incidents | Time técnico | Imediato |
| Email stakeholders | Management | Após 15min |
| Status page | Usuários | Após 30min |

---

## 7. CHECKLIST PRÉ-ROLLBACK

- [ ] Confirmar que o problema é real (não é falso positivo)
- [ ] Verificar se hotfix é possível em < 30min
- [ ] Se hotfix não é possível, decidir rollback
- [ ] Notificar time no Slack #incidents
- [ ] Criar backup do estado atual
- [ ] Executar rollback
- [ ] Verificar health checks
- [ ] Monitorar por 15min
- [ ] Documentar incidente
-   Fazer post-mortem se necessário

---

*Rollback Plan — CTO Enterprise Mode*
