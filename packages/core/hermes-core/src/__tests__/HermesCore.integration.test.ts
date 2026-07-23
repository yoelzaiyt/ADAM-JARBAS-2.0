import { describe, it, expect, beforeEach } from 'vitest';
import { HermesCore } from '../HermesCore.js';

describe('HermesCore Integration', () => {
  let core: HermesCore;

  beforeEach(() => {
    core = new HermesCore({ logLevel: 'error' });
  });

  describe('lifecycle', () => {
    it('initializes with default config', () => {
      expect(core.config).toBeDefined();
      expect(core.config.defaultStrategy).toBe('balanced');
      expect(core.config.telemetryEnabled).toBe(true);
    });

    it('accepts partial config overrides', () => {
      const custom = new HermesCore({ logLevel: 'debug', maxConcurrentTasks: 5 });
      expect(custom.config.logLevel).toBe('debug');
      expect(custom.config.maxConcurrentTasks).toBe(5);
    });

    it('starts and shuts down cleanly', async () => {
      await core.start();
      const stats1 = core.getStats();
      expect(stats1.uptime).toBeGreaterThanOrEqual(0);

      await core.shutdown();
      const stats2 = core.getStats();
      expect(stats2.uptime).toBe(0);
    });

    it('emits events on start and shutdown', async () => {
      const events: string[] = [];
      core.eventBus.subscribe('pipeline:started', () => events.push('started'));
      core.eventBus.subscribe('pipeline:completed', () => events.push('completed'));

      await core.start();
      await core.shutdown();
      expect(events).toEqual(['started', 'completed']);
    });
  });

  describe('decide', () => {
    it('selects a provider for a decision request', async () => {
      const result = await core.decide({
        request: { messages: [{ role: 'user', content: 'hello' }], model: 'test' } as any,
        criteria: { strategy: 'balanced' },
        tenantId: 'test-tenant',
      });

      expect(result.provider).toBeDefined();
      expect(result.model).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(result.alternatives).toBeInstanceOf(Array);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('reasoning', () => {
    it('runs chain-of-thought reasoning', async () => {
      const result = await core.reason({
        query: 'What is the best approach to optimize a database query?',
        context: ['Database optimization involves indexing and query planning'],
        mode: 'chain-of-thought',
        tenantId: 'test-tenant',
      });

      expect(result.conclusion).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.mode).toBe('chain-of-thought');
      expect(result.tokensUsed).toBeGreaterThan(0);
    });
  });

  describe('context assembly', () => {
    it('assembles context from multiple sources', async () => {
      const result = await core.assembleContext({
        sessionId: 'session-1',
        tenantId: 'test-tenant',
        query: 'Tell me about AI',
        maxTokens: 1000,
        sources: [
          { type: 'memory', content: 'AI is artificial intelligence', priority: 10, tokensEstimate: 10 },
          { type: 'knowledge', content: 'Machine learning is a subset of AI', priority: 5, tokensEstimate: 12 },
          { type: 'conversation', content: 'User asked about AI', priority: 1, tokensEstimate: 8 },
        ],
      });

      expect(result.window).toBeDefined();
      expect(result.window.messages).toBeInstanceOf(Array);
      expect(result.truncated).toBe(false);
      expect(result.sourcesUsed.length).toBeGreaterThan(0);
    });
  });

  describe('goals and tasks', () => {
    it('creates and completes a goal', async () => {
      const goal = await core.createGoal({
        title: 'Build feature X',
        description: 'Implement the new feature',
        status: 'active',
        priority: 'high',
        tenantId: 'test-tenant',
        userId: 'user-1',
        successCriteria: ['Feature works correctly'],
      });

      expect(goal.id).toBeDefined();
      expect(goal.title).toBe('Build feature X');
      expect(goal.progress).toBe(0);

      const completed = await core.completeGoal(goal.id);
      expect(completed.status).toBe('completed');
      expect(completed.progress).toBe(100);
    });

    it('creates and completes a task', async () => {
      const task = await core.createTask({
        name: 'Write tests',
        description: 'Write unit tests for feature X',
        status: 'pending',
        priority: 'medium',
        tenantId: 'test-tenant',
        userId: 'user-1',
        type: 'ai-call',
        inputs: {},
        dependencies: [],
      });

      expect(task.id).toBeDefined();
      expect(task.name).toBe('Write tests');

      const completed = await core.completeTask(task.id, { output: 'Tests written' });
      expect(completed.status).toBe('completed');
    });
  });

  describe('workflow', () => {
    it('registers and executes a workflow', async () => {
      await core.registerWorkflow({
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A test workflow',
        steps: [
          {
            id: 'step-1',
            name: 'Step 1',
            type: 'sequential',
            handler: 'mock-handler',
            inputs: {},
            dependencies: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await core.executeWorkflow('test-workflow', { input: 'test' });
      expect(result.id).toBeDefined();
      expect(result.status).toBe('completed');
      expect(result.outputs).toBeDefined();
    });
  });

  describe('pipeline', () => {
    it('registers and executes a pipeline', async () => {
      core.registerPipeline({
        id: 'test-pipeline',
        name: 'Test Pipeline',
        stages: [
          { name: 'stage-1', handler: 'mock-handler', config: {} },
          { name: 'stage-2', handler: 'mock-handler', config: {} },
        ],
        onError: 'stop',
      });

      const result = await core.executePipeline('test-pipeline', { data: 'input' });
      expect(result.id).toBeDefined();
      expect(result.status).toBe('completed');
      expect(result.stages.length).toBe(2);
    });
  });

  describe('tools', () => {
    it('registers and executes a tool', async () => {
      core.registerTool({
        name: 'echo',
        description: 'Echo input',
        parameters: {
          message: { type: 'string', description: 'Message to echo', required: true },
        },
        handler: async (args) => `Echo: ${args.message}`,
      });

      const result = await core.executeTool({
        tool: 'echo',
        args: { message: 'hello' },
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe('Echo: hello');
      expect(result.tool).toBe('echo');
    });
  });

  describe('skills', () => {
    it('invokes a skill', async () => {
      const result = await core.invokeSkill({
        skillId: 'web-search',
        input: 'latest AI news',
        tenantId: 'test-tenant',
      });

      expect(result.skillId).toBe('web-search');
      expect(result.output).toBeDefined();
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('agent dispatch', () => {
    it('dispatches an agent', async () => {
      const result = await core.dispatchAgent({
        agentId: 'research-agent',
        input: 'Research quantum computing',
        tenantId: 'test-tenant',
        userId: 'user-1',
      });

      expect(result.dispatchId).toBeDefined();
      expect(result.agentId).toBe('research-agent');
      expect(result.iterations).toBeGreaterThan(0);
    });
  });

  describe('memory', () => {
    it('stores and retrieves memory', async () => {
      await core.storeMemory({
        content: 'User prefers dark mode',
        tenantId: 'test-tenant',
        sessionId: 'session-1',
        type: 'conversation',
      });

      const result = await core.getMemoryContext({
        sessionId: 'session-1',
        tenantId: 'test-tenant',
        query: 'user prefers dark mode',
        threshold: 0.3,
      });

      expect(result.entries.length).toBeGreaterThan(0);
      expect(result.totalTokens).toBeGreaterThan(0);
    });
  });

  describe('provider selection', () => {
    it('selects a provider', async () => {
      const result = await core.selectProvider({
        request: { messages: [{ role: 'user', content: 'hello' }], model: 'test' } as any,
        tenantId: 'test-tenant',
        strategy: 'balanced',
      });

      expect(result.provider).toBeDefined();
      expect(result.model).toBeDefined();
      expect(result.estimatedCostUsd).toBeGreaterThanOrEqual(0);
    });
  });

  describe('stats', () => {
    it('returns correct stats structure', async () => {
      await core.start();
      const stats = core.getStats();

      expect(stats).toHaveProperty('uptime');
      expect(stats).toHaveProperty('decisions');
      expect(stats).toHaveProperty('goals');
      expect(stats).toHaveProperty('tasks');
      expect(stats).toHaveProperty('workflows');
      expect(stats).toHaveProperty('pipelines');
      expect(stats).toHaveProperty('tools');
      expect(stats.pipelines).toBe(0);
      expect(stats.tools).toBe(0);
    });
  });
});
