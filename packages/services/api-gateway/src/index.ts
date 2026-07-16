import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '@jarbas/config';
import { createRegistry, type RegistryConfig } from '@jarbas/ai-registry';
import { HermesRouter } from '@jarbas/hermes-router';
import { AuthService } from '@jarbas/auth-service';
import { MemoryManager } from '@jarbas/memory-manager';
import { SkillManager } from '@jarbas/skill-manager';
import { AgentManager } from '@jarbas/agent-manager';
import { PromptEngine } from '@jarbas/prompt-engine';
import { CostOptimizer } from '@jarbas/cost-optimizer';
import { AnalyticsEngine } from '@jarbas/analytics-engine';
import { SupabaseClient } from '@jarbas/supabase-client';

const app = express();

// --- Security Headers ---
app.use(helmet());

// --- CORS ---
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- Rate Limiting ---
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later' },
});

app.use(express.json({ limit: '1mb' }));

// --- Initialize Services ---
const registryConfig: RegistryConfig = {
  openrouter: config.providers.openrouter.apiKey
    ? { apiKey: config.providers.openrouter.apiKey, baseUrl: config.providers.openrouter.baseUrl }
    : undefined,
  deepseek: config.providers.deepseek.apiKey
    ? { apiKey: config.providers.deepseek.apiKey, baseUrl: config.providers.deepseek.baseUrl }
    : undefined,
  nvidia: config.providers.nvidia.apiKey
    ? { apiKey: config.providers.nvidia.apiKey, baseUrl: config.providers.nvidia.baseUrl }
    : undefined,
  ollama: { baseUrl: config.providers.ollama.baseUrl },
  opencode: { baseUrl: config.providers.opencode.baseUrl },
  zhipuai: { apiKey: config.providers.zhipuai.apiKey, baseUrl: config.providers.zhipuai.baseUrl },
  hermes: { apiKey: config.providers.hermes.apiKey, baseUrl: config.providers.hermes.baseUrl },
};

const registry = createRegistry(registryConfig);
const router = new HermesRouter(registry, { strategy: 'cost-optimized' });
const authService = new AuthService({
  jwtSecret: config.jwt.secret,
  jwtExpiresIn: config.jwt.expiresIn,
  apiKeySalt: config.apiKeySalt,
});
const memoryManager = new MemoryManager({
  url: config.qdrant.url,
  apiKey: config.qdrant.apiKey,
  collection: config.memory.collection,
  vectorSize: config.memory.vectorSize,
});
const skillManager = new SkillManager();
const agentManager = new AgentManager();
const promptEngine = new PromptEngine();
const costOptimizer = new CostOptimizer();
const analyticsEngine = new AnalyticsEngine();
const supabase = new SupabaseClient({
  url: config.supabase.url,
  anonKey: config.supabase.anonKey,
});

// --- Auth Middleware ---
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }
  const token = authHeader.slice(7);
  if (token.startsWith('jb_')) {
    try {
      const keyData = await authService.validateApiKey(token);
      (req as any).userId = keyData.userId;
      (req as any).tenantId = keyData.tenantId;
      next();
      return;
    } catch {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }
  }
  try {
    const user = await authService.validateToken(token);
    (req as any).userId = user.id;
    (req as any).tenantId = user.tenantId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============================================================
// ROUTES
// ============================================================

// --- Health ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0', uptime: process.uptime() });
});

// --- Providers ---
app.get('/api/v1/providers', (_req, res) => {
  res.json({ providers: registry.getAvailableProviders() });
});

app.get('/api/v1/providers/health', async (_req, res) => {
  try {
    const health = await registry.checkHealth();
    res.json({ providers: health });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// --- Auth (stricter rate limit) ---
app.post('/api/v1/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name, tenantId } = req.body;
    const tokens = await authService.register(email, password, name, tenantId ?? 'default');
    // Persist to Supabase
    try {
      await supabase.createUser({
        email,
        name,
        tenant_id: tenantId ?? 'default',
        role: 'user',
      });
    } catch { /* Supabase optional */ }
    res.json(tokens);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post('/api/v1/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
});

// --- Chat ---
app.post('/api/v1/chat', authMiddleware, async (req, res) => {
  try {
    const { messages, model, temperature, maxTokens, provider, stream } = req.body;
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      const streamGen = router.streamRoute({ messages, model, temperature, maxTokens, provider, stream: true });
      for await (const chunk of streamGen) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const response = await router.route({ messages, model, temperature, maxTokens, provider });
      // Log to Supabase
      try {
        await supabase.logChat({
          user_id: (req as any).userId ?? 'anonymous',
          tenant_id: (req as any).tenantId ?? 'default',
          provider: response.provider,
          model: response.model,
          messages,
          response: response.content,
          tokens_used: response.usage.totalTokens,
          cost_usd: response.usage.estimatedCostUsd,
          latency_ms: response.latencyMs,
        });
      } catch { /* Supabase optional */ }
      res.json(response);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// --- Embeddings ---
app.post('/api/v1/embeddings', authMiddleware, async (req, res) => {
  try {
    const { input, model, provider } = req.body;
    const response = await registry.embed({ input, model }, provider);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// --- Rerank ---
app.post('/api/v1/rerank', authMiddleware, async (req, res) => {
  try {
    const { query, documents, model } = req.body;
    if (!query || !documents?.length) {
      res.status(400).json({ error: 'query and documents[] required' });
      return;
    }
    const nvidiaProvider = registry.getProvider('nvidia') as any;
    const results = await nvidiaProvider.rerank(query, documents, model);
    res.json({ results, model: model ?? 'nvidia/llama-nemotron-rerank-vl-1b-v2' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// --- Router Stats ---
app.get('/api/v1/router/stats', authMiddleware, (_req, res) => {
  res.json(router.getStats());
});

// ============================================================
// SKILLS
// ============================================================
app.post('/api/v1/skills', authMiddleware, async (req, res) => {
  try {
    const skill = await skillManager.registerSkill(req.body);
    res.status(201).json(skill);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/skills', authMiddleware, async (req, res) => {
  try {
    const skills = await skillManager.listSkills(req.query as any);
    res.json({ skills });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/skills/:id', authMiddleware, async (req, res) => {
  try {
    const skill = await skillManager.getSkill(req.params.id);
    if (!skill) { res.status(404).json({ error: 'Skill not found' }); return; }
    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/v1/skills/:id', authMiddleware, async (req, res) => {
  try {
    const skill = await skillManager.updateSkill(req.params.id, req.body);
    res.json(skill);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.delete('/api/v1/skills/:id', authMiddleware, async (req, res) => {
  try {
    await skillManager.deleteSkill(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/skills/search/:query', authMiddleware, async (req, res) => {
  try {
    const skills = await skillManager.searchSkills(req.params.query);
    res.json({ skills });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================
// AGENTS
// ============================================================
app.post('/api/v1/agents', authMiddleware, async (req, res) => {
  try {
    const agent = await agentManager.createAgent(req.body);
    res.status(201).json(agent);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/agents', authMiddleware, async (req, res) => {
  try {
    const agents = await agentManager.listAgents();
    res.json({ agents });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/agents/:id', authMiddleware, async (req, res) => {
  try {
    const agent = await agentManager.getAgent(req.params.id);
    if (!agent) { res.status(404).json({ error: 'Agent not found' }); return; }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/v1/agents/:id', authMiddleware, async (req, res) => {
  try {
    const agent = await agentManager.updateAgent(req.params.id, req.body);
    res.json(agent);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.delete('/api/v1/agents/:id', authMiddleware, async (req, res) => {
  try {
    await agentManager.deleteAgent(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post('/api/v1/agents/:id/chat', authMiddleware, async (req, res) => {
  try {
    const agent = await agentManager.getAgent(req.params.id);
    if (!agent) { res.status(404).json({ error: 'Agent not found' }); return; }
    const { input, sessionId } = req.body;
    const messages = agentManager.buildAgentMessages(agent, input, sessionId);
    const response = await router.route({ messages, provider: agent.provider, model: agent.model, temperature: agent.temperature });
    if (sessionId) {
      agentManager.addSessionMessage(sessionId, { role: 'user', content: input, timestamp: new Date(), tokenCount: 0 });
      agentManager.addSessionMessage(sessionId, { role: 'assistant', content: response.content, timestamp: new Date(), tokenCount: response.usage.totalTokens });
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================
// PROMPTS
// ============================================================
app.post('/api/v1/prompts', authMiddleware, async (req, res) => {
  try {
    const template = await promptEngine.createTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/prompts', authMiddleware, async (req, res) => {
  try {
    const templates = await promptEngine.listTemplates(req.query as any);
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/prompts/:id', authMiddleware, async (req, res) => {
  try {
    const template = await promptEngine.getTemplate(req.params.id);
    if (!template) { res.status(404).json({ error: 'Template not found' }); return; }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/v1/prompts/:id', authMiddleware, async (req, res) => {
  try {
    const template = await promptEngine.updateTemplate(req.params.id, req.body);
    res.json(template);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.delete('/api/v1/prompts/:id', authMiddleware, async (req, res) => {
  try {
    await promptEngine.deleteTemplate(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post('/api/v1/prompts/:id/render', authMiddleware, (req, res) => {
  try {
    const rendered = promptEngine.render(req.params.id, req.body.variables ?? {});
    res.json(rendered);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// ============================================================
// COSTS
// ============================================================
app.post('/api/v1/costs/record', authMiddleware, async (req, res) => {
  try {
    const entry = await costOptimizer.recordCost(req.body);
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/costs/summary/:tenantId', authMiddleware, async (req, res) => {
  try {
    const summary = await costOptimizer.getSummary(req.params.tenantId, req.query.period as string);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/costs/history/:tenantId', authMiddleware, async (req, res) => {
  try {
    const history = await costOptimizer.getCostHistory(req.params.tenantId, parseInt(req.query.days as string) || 30);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/v1/costs/budget', authMiddleware, async (req, res) => {
  try {
    await costOptimizer.setBudget(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/costs/alerts/:tenantId', authMiddleware, async (req, res) => {
  try {
    const alerts = await costOptimizer.getAlerts(req.params.tenantId);
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/costs/suggest/:provider/:model', authMiddleware, async (req, res) => {
  try {
    const suggestion = await costOptimizer.suggestCheaperProvider(req.params.provider as any, req.params.model);
    res.json({ suggestion });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================
// ANALYTICS
// ============================================================
app.post('/api/v1/analytics/record', authMiddleware, async (req, res) => {
  try {
    const metric = await analyticsEngine.recordMetric(req.body);
    res.status(201).json(metric);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/analytics/summary', authMiddleware, async (req, res) => {
  try {
    const summary = await analyticsEngine.getSummary(req.query.period as string);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/analytics/providers', authMiddleware, async (req, res) => {
  try {
    const stats = await analyticsEngine.getProviderStats(req.query.provider as any);
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/analytics/slowest', authMiddleware, async (req, res) => {
  try {
    const slowest = await analyticsEngine.getSlowestRequests(parseInt(req.query.limit as string) || 10);
    res.json({ requests: slowest });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================
// MEMORY
// ============================================================
app.post('/api/v1/memory/store', authMiddleware, async (req, res) => {
  try {
    const entry = await memoryManager.store(req.body);
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post('/api/v1/memory/search', authMiddleware, async (req, res) => {
  try {
    const results = await memoryManager.search(req.body);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================
// SUPABASE
// ============================================================
app.get('/api/v1/supabase/health', async (_req, res) => {
  try {
    const health = await supabase.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/supabase/users', authMiddleware, async (req, res) => {
  try {
    const users = await supabase.listUsers(req.query.tenantId as string);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/supabase/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await supabase.getUser(req.params.id);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/v1/supabase/tenants', authMiddleware, async (req, res) => {
  try {
    const tenant = await supabase.createTenant(req.body);
    res.status(201).json(tenant);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/supabase/tenants/:id', authMiddleware, async (req, res) => {
  try {
    const tenant = await supabase.getTenant(req.params.id);
    if (!tenant) { res.status(404).json({ error: 'Tenant not found' }); return; }
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/v1/supabase/api-keys', authMiddleware, async (req, res) => {
  try {
    const key = await supabase.createAPIKey(req.body);
    res.status(201).json(key);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/supabase/api-keys/:userId', authMiddleware, async (req, res) => {
  try {
    const keys = await supabase.listAPIKeys(req.params.userId);
    res.json({ keys });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/v1/supabase/api-keys/:id', authMiddleware, async (req, res) => {
  try {
    await supabase.deleteAPIKey(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/supabase/chat-logs/:tenantId', authMiddleware, async (req, res) => {
  try {
    const logs = await supabase.getChatLogsByTenant(req.params.tenantId, parseInt(req.query.limit as string) || 100);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/supabase/chat-stats/:tenantId', authMiddleware, async (req, res) => {
  try {
    const stats = await supabase.getChatStats(req.params.tenantId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/v1/supabase/skills', authMiddleware, async (req, res) => {
  try {
    const skill = await supabase.saveSkill(req.body);
    res.status(201).json(skill);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/supabase/skills', authMiddleware, async (_req, res) => {
  try {
    const skills = await supabase.listSkills();
    res.json({ skills });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// --- Error Handler ---
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Gateway] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// --- Start ---
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`[API Gateway] Running on port ${PORT}`);
  console.log(`[API Gateway] Providers: ${registry.getAvailableProviders().join(', ')}`);
  console.log(`[API Gateway] Router: cost-optimized | Auth: JWT + API Key`);
  console.log(`[API Gateway] Security: helmet + rate-limit + CORS restricted`);
  console.log(`[API Gateway] Endpoints: /chat, /embeddings, /rerank, /skills, /agents, /prompts, /costs, /analytics, /memory, /supabase`);
});

export default app;
