# JARBAS 2.0 — SECURITY ACTION PLAN

**Data:** 2026-07-13
**Classification:** CONFIDENTIAL — Security Critical
**Auditor:** Security Architect + Cyber Security Specialist

---

## 1. RESUMO DE SEGURANÇA

| Métrica | Valor |
|---------|-------|
| Score de Segurança | 3.0/10 |
| Vulnerabilidades CRÍTICAS | 8 |
| Vulnerabilidades ALTAS | 10 |
| Vulnerabilidades MÉDIAS | 8 |
| OWASP Top 10 Coberto | 3/10 |
| Compliance LGPD | NÃO IMPLEMENTADO |
| Pen Testing | NÃO REALIZADO |

---

## 2. VULNERABILIDADES CRÍTICAS — DETALHAMENTO

### SEC-01: Chaves de API Expostas
- **Localização:** .env, shared/config/src/index.ts:95-96
- **Descrição:** Supabase URL e anon key hardcoded como defaults no config
- **CVSS:** 9.8 (Critical)
- **OWASP:** A02:2021 Cryptographic Failures
- **Evidência:** `SUPABASE_URL` defaults to real project URL, `SUPABASE_ANON_KEY` defaults to real key
- **Remediação:**
  1. Rotacionar todas as chaves de API imediatamente
  2. Remover defaults hardcoded do config
  3. Obrigar todas as chaves via variáveis de ambiente
  4. Implementar vault para secrets (HashiCorp Vault ou AWS Secrets Manager)
- **Arquivos:** shared/config/src/index.ts, .env
- **Esforço:** 1h
- **Rollback:** Revert do commit

### SEC-02: Senhas SHA-256
- **Localização:** packages/services/auth-service/src/index.ts:141-142
- **Descrição:** `hashPassword()` usa `crypto.createHash('sha256')` com salt global compartilhado
- **CVSS:** 9.1 (Critical)
- **OWASP:** A02:2021 Cryptographic Failures
- **Evidência:** SHA-256 é hash genérico, não password hashing. GPU pode testar bilhões/s
- **Remediação:**
  1. Instalar bcrypt (npm install bcrypt @types/bcrypt)
  2. Migrar `hashPassword()` para bcrypt com cost 12+
  3. Migrar `verifyPassword()` para bcrypt.compare()
  4. Implementar migration de senhas existentes (re-hash no próximo login)
- **Arquivos:** auth-service/src/index.ts, package.json
- **Esforço:** 2h
- **Rollback:** Manter SHA-256 como fallback temporário

### SEC-03: JWT Timing Attack
- **Localização:** packages/services/auth-service/src/index.ts:133
- **Descrição:** `if (signature !== expectedSig)` — comparação JavaScript padrão, não constante-tempo
- **CVSS:** 8.1 (High)
- **OWASP:** A02:2021 Cryptographic Failures
- **Evidência:** Atacante pode inferir assinatura byte-a-byte via timing
- **Remediação:**
  1. Importar `crypto` do Node.js
  2. Substituir `!==` por `crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))`
- **Arquivos:** auth-service/src/index.ts
- **Esforço:** 1h
- **Rollback:** Revert do commit

### SEC-04: JWT Secret Hardcoded
- **Localização:** packages/shared/config/src/index.ts:33
- **Descrição:** `env('JWT_SECRET', 'dev-secret-change-me')` — fallback previsível
- **CVSS:** 9.8 (Critical)
- **OWASP:** A07:2021 Identification and Authentication Failures
- **Evidência:** Qualquer pessoa que leia o código pode forjar tokens
- **Remediação:**
  1. Remover o default: `env('JWT_SECRET')` sem fallback
  2. Adicionar validação no startup: se JWT_SECRET não existe, throw Error
  3. Gerar secret aleatório ≥ 256 bits
- **Arquivos:** shared/config/src/index.ts
- **Esforço:** 1h
- **Rollback:** Revert do commit

### SEC-05: CORS Wide Open
- **Localização:** packages/services/api-gateway/src/index.ts:16
- **Descrição:** `app.use(cors())` sem configuração — permite qualquer origem
- **CVSS:** 8.0 (High)
- **OWASP:** A05:2021 Security Misconfiguration
- **Evidência:** Site malicioso pode fazer requests autenticados em nome do usuário
- **Remediação:**
  1. Configurar `cors({ origin: ['https://jarbas.app', 'https://staging.jarbas.app'], credentials: true })`
  2. Adicionar CORS como variável de ambiente para flexibilidade
- **Arquivos:** api-gateway/src/index.ts, shared/config/src/index.ts
- **Esforço:** 1h
- **Rollback:** Revert do commit

### SEC-06: Zero Rate Limiting
- **Localização:** packages/services/api-gateway/src/index.ts (ausente)
- **Descrição:** Nenhum middleware de rate limiting em nenhum endpoint
- **CVSS:** 7.5 (High)
- **OWASP:** A04:2021 Insecure Design
- **Evidência:** Config define rateLimit mas nunca é usado. Login pode ser brute-forceado
- **Remediação:**
  1. `npm install express-rate-limit`
  2. Configurar rate limit global: 100 req/min por IP
  3. Rate limit mais restritivo em /auth/login: 5 req/min
  4. Rate limit em /auth/register: 3 req/min
- **Arquivos:** api-gateway/src/index.ts, package.json
- **Esforço:** 2h
- **Rollback:** Revert do commit

### SEC-07: JWT 7 Dias
- **Localização:** packages/services/auth-service/src/index.ts:89-96
- **Descrição:** Access token expira em 7 dias, refresh token em 30 dias
- **CVSS:** 7.0 (High)
- **OWASP:** A07:2021 Identification and Authentication Failures
- **Evidência:** Janela de ataque de 7 dias para token roubado
- **Remediação:**
  1. Access token: 15 minutos
  2. Refresh token: 7 dias
  3. Implementar refresh token rotation
- **Arquivos:** auth-service/src/index.ts
- **Esforço:** 2h
- **Rollback:** Revert do commit

### SEC-08: Sem Helmet
- **Localização:** packages/services/api-gateway/src/index.ts (ausente)
- **Descrição:** Sem headers de segurança (X-Content-Type-Options, X-Frame-Options, HSTS, CSP)
- **CVSS:** 6.5 (Medium)
- **OWASP:** A05:2021 Security Misconfiguration
- **Remediação:**
  1. `npm install helmet`
  2. `app.use(helmet())` antes de todas as rotas
- **Arquivos:** api-gateway/src/index.ts, package.json
- **Esforço:** 1h
- **Rollback:** Revert do commit

---

## 3. VULNERABILIDADES ALTAS

| ID | Vulnerabilidade | Local | Remediação | Tempo |
|----|-----------------|-------|------------|-------|
| SEC-09 | Auth in-memory | auth-service | Migrar para PostgreSQL | 8h |
| SEC-10 | Sem MFA | auth-service | Implementar TOTP | 16h |
| SEC-11 | RBAC não enforce | api-gateway | Middleware de autorização | 8h |
| SEC-12 | Encrypt/decrypt fake | whatsapp-ai, email-ai | Usar AES-256-GCM real | 4h |
| SEC-13 | Sem HTTPS | api-gateway, docker | TLS termination + redirect | 4h |
| SEC-14 | Input validation ausente | api-gateway | Zod em todas as rotas | 4h |
| SEC-15 | Erros leakam detalhes | api-gateway | Generic error handler | 4h |
| SEC-16 | Container como root | Dockerfile | USER node | 1h |
| SEC-17 | Redis/Qdrant sem auth | docker-compose | Adicionar passwords | 2h |
| SEC-18 | SQL injection risk | supabase-client | Parameterized queries | 4h |

---

## 4. VULNERABILIDADES MÉDIAS

| ID | Vulnerabilidade | Local | Remediação | Tempo |
|----|-----------------|-------|------------|-------|
| SEC-19 | Rate limit in-memory | whatsapp-ai, email-ai | Migrar para Redis | 8h |
| SEC-20 | Sem audit trail | api-gateway | Tabela audit_logs | 8h |
| SEC-21 | Body limit 10MB | api-gateway | Reduzir para 1MB | 0.5h |
| SEC-22 | Sem ABAC | Todo | Policy engine | 16h |
| SEC-23 | HTTP em producao | config | Forçar HTTPS | 2h |
| SEC-24 | Sem Content Security Policy | api-gateway | Helmet CSP | 2h |
| SEC-25 | Sem X-Frame-Options | api-gateway | Helmet | 0.5h |
| SEC-26 | Cookies sem flags | auth-service | Secure, HttpOnly, SameSite | 2h |

---

## 5. PLANO DE MIGRAÇÃO DE SENHAS

### Critérios
- Bcrypt cost ≥ 12
- Per-user salt (bcrypt gera automaticamente)
- Migration gradual (re-hash no login)

### Fluxo
```
1. Usuário faz login com senha antiga (SHA-256)
2. Sistema verifica com SHA-256 (legado)
3. Se OK, re-hash com bcrypt e salva no DB
4. Próximo login usa bcrypt
5. Após 30 dias, remover suporte SHA-256
```

### Scripts Necessários
- `scripts/migrate-passwords.ts` — re-hash em lote
- `scripts/verify-migration.ts` — validar migração

---

## 6. PLANO DE AUDITORIA DE SEGURANÇA

### Pre-Deployment
- [ ] SAST scan (Semgrep ou CodeQL)
- [ ] Dependency audit (npm audit)
- [ ] Secret scan (gitleaks)
- [ ] Container scan (Trivy)

### Post-Deployment
- [ ] Pen testing externo (terceirizado)
- [ ] Bug bounty program (HackerOne)
- [ ] Monitoramento de intrusão (WAF + IDS)

---

## 7. CHECKLIST DE SEGURANÇA PARA PRODUÇÃO

- [ ] Todas as chaves de API rotacionadas
- [ ] bcrypt implementado e testado
- [ ] JWT secret ≥ 256 bits, obrigatório
- [ ] JWT lifetime ≤ 15min
- [ ] CORS restrito a origens conhecidas
- [ ] Rate limiting em todos os endpoints
- [ ] Helmet com todos os headers
- [ ] HTTPS forçado
- [ ] Containers non-root
- [ ] Redis/Qdrant com autenticação
- [ ] Input validation em todas as rotas
- [ ] Error handler genérico
- [ ] Audit trail funcional
- [ ] SAST scan sem findings CRÍTICOS
- [ ] npm audit sem vulnerabilities HIGH+

---

*Security Action Plan — CTO Enterprise Mode*
