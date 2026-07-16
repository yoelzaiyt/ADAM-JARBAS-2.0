import type {
  HermesCoreConfig,
  DecisionInput,
  DecisionResult,
  PlanGoal,
  ExecutionPlan,
  ReasoningInput,
  ReasoningResult,
  ContextAssemblyRequest,
  ContextAssemblyResult,
  Goal,
  Task,
  WorkflowDef,
  WorkflowExecution,
  PipelineDefinition,
  PipelineExecution,
  MemoryContextRequest,
  MemoryContextResult,
  MemoryStoreRequest,
  ProviderSelectionRequest,
  ProviderSelectionResult,
  SkillInvocationRequest,
  SkillInvocationResult,
  AgentDispatchRequest,
  AgentDispatchResult,
  ToolCallRequest,
  ToolCallResult,
  ToolDefinition,
  Logger,
} from './interfaces.js';
import { EventBus } from './EventBus.js';
import { Logger as DefaultLogger } from './Logger.js';
import { Telemetry } from './Telemetry.js';
import { DecisionEngine } from './DecisionEngine.js';
import { PlannerEngine } from './PlannerEngine.js';
import { ReasoningEngine } from './ReasoningEngine.js';
import { ContextEngine } from './ContextEngine.js';
import { GoalManager } from './GoalManager.js';
import { TaskManager } from './TaskManager.js';
import { WorkflowEngine } from './WorkflowEngine.js';
import { ExecutionPipeline } from './ExecutionPipeline.js';
import { MemoryIntegration } from './MemoryIntegration.js';
import { AIProviderSelection } from './AIProviderSelection.js';
import { SkillInvocation } from './SkillInvocation.js';
import { AgentDispatch } from './AgentDispatch.js';
import { ToolDispatcher } from './ToolDispatcher.js';

const DEFAULT_CONFIG: HermesCoreConfig = {
  defaultStrategy: 'balanced',
  maxConcurrentTasks: 10,
  defaultTaskTimeout: 300000,
  defaultRetryPolicy: {
    maxRetries: 3,
    backoffMs: 1000,
    backoffMultiplier: 2,
  },
  logLevel: 'info',
  telemetryEnabled: true,
  memoryEnabled: true,
  contextWindowMaxTokens: 8192,
};

export class HermesCore {
  readonly eventBus: EventBus;
  readonly logger: Logger;
  readonly telemetry: Telemetry;
  readonly decisionEngine: DecisionEngine;
  readonly plannerEngine: PlannerEngine;
  readonly reasoningEngine: ReasoningEngine;
  readonly contextEngine: ContextEngine;
  readonly goalManager: GoalManager;
  readonly taskManager: TaskManager;
  readonly workflowEngine: WorkflowEngine;
  readonly executionPipeline: ExecutionPipeline;
  readonly memoryIntegration: MemoryIntegration;
  readonly aiProviderSelection: AIProviderSelection;
  readonly skillInvocation: SkillInvocation;
  readonly agentDispatch: AgentDispatch;
  readonly toolDispatcher: ToolDispatcher;
  readonly config: HermesCoreConfig;

  private startedAt: Date | null = null;

  constructor(config?: Partial<HermesCoreConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.logger = new DefaultLogger('hermes-core', this.config.logLevel);
    this.eventBus = new EventBus();
    this.telemetry = new Telemetry();

    this.taskManager = new TaskManager(this.logger);
    this.goalManager = new GoalManager(this.logger, this.taskManager);

    this.decisionEngine = new DecisionEngine(this.logger);
    this.plannerEngine = new PlannerEngine(this.logger);
    this.reasoningEngine = new ReasoningEngine(this.logger);
    this.contextEngine = new ContextEngine(this.logger);
    this.workflowEngine = new WorkflowEngine(this.logger);
    this.executionPipeline = new ExecutionPipeline(this.logger);
    this.memoryIntegration = new MemoryIntegration(undefined, this.logger);
    this.aiProviderSelection = new AIProviderSelection(undefined, undefined, this.logger);
    this.skillInvocation = new SkillInvocation(undefined, this.logger);
    this.agentDispatch = new AgentDispatch(undefined, undefined, this.logger);
    this.toolDispatcher = new ToolDispatcher(this.logger);

    this.logger.info('[HermesCore] Initialized', { config: this.config });
  }

  async start(): Promise<void> {
    this.startedAt = new Date();
    this.logger.info('[HermesCore] Started');
    this.eventBus.emit({
      type: 'pipeline:started',
      timestamp: new Date(),
      source: 'hermes-core',
      data: { config: this.config },
    });
    this.telemetry.recordCounter('hermes.core.started', 1);
  }

  async shutdown(): Promise<void> {
    this.logger.info('[HermesCore] Shutting down');
    this.eventBus.emit({
      type: 'pipeline:completed',
      timestamp: new Date(),
      source: 'hermes-core',
      data: { uptime: this.startedAt ? Date.now() - this.startedAt.getTime() : 0 },
    });
    this.telemetry.recordCounter('hermes.core.shutdown', 1);
    this.startedAt = null;
  }

  // ─── Decision ─────────────────────────────────────────────────────────────

  async decide(input: DecisionInput): Promise<DecisionResult> {
    this.logger.info('[HermesCore] Processing decision', { strategy: input.criteria.strategy });
    const result = await this.decisionEngine.decide(input);
    this.eventBus.emit({
      type: 'decision:made',
      timestamp: new Date(),
      source: 'hermes-core',
      tenantId: input.tenantId,
      data: { provider: result.provider, model: result.model, score: result.score },
    });
    this.telemetry.recordCounter('hermes.decisions', 1, { provider: result.provider });
    return result;
  }

  // ─── Planning ─────────────────────────────────────────────────────────────

  async createPlan(goal: PlanGoal, context?: Record<string, unknown>): Promise<ExecutionPlan> {
    this.logger.info('[HermesCore] Creating plan', { goalId: goal.id });
    const plan = await this.plannerEngine.createPlan(goal, context);
    this.eventBus.emit({
      type: 'plan:created',
      timestamp: new Date(),
      source: 'hermes-core',
      data: { planId: plan.id, goalId: goal.id, steps: plan.steps.length },
    });
    this.telemetry.recordCounter('hermes.plans.created', 1);
    return plan;
  }

  async decomposeGoal(goal: string, context?: Record<string, unknown>): Promise<import('./interfaces.js').PlanStep[]> {
    this.logger.info('[HermesCore] Decomposing goal', { goal });
    return this.plannerEngine.decomposeGoal(goal, context);
  }

  // ─── Reasoning ────────────────────────────────────────────────────────────

  async reason(input: ReasoningInput): Promise<ReasoningResult> {
    this.logger.info('[HermesCore] Processing reasoning', { mode: input.mode });
    const result = await this.reasoningEngine.reason(input);
    this.eventBus.emit({
      type: 'reasoning:completed',
      timestamp: new Date(),
      source: 'hermes-core',
      tenantId: input.tenantId,
      data: { mode: input.mode, confidence: result.confidence, steps: result.steps.length },
    });
    this.telemetry.recordCounter('hermes.reasoning', 1, { mode: input.mode });
    return result;
  }

  // ─── Context ──────────────────────────────────────────────────────────────

  async assembleContext(request: ContextAssemblyRequest): Promise<ContextAssemblyResult> {
    this.logger.info('[HermesCore] Assembling context', { sessionId: request.sessionId });
    const result = await this.contextEngine.assemble(request);
    this.eventBus.emit({
      type: 'context:assembled',
      timestamp: new Date(),
      source: 'hermes-core',
      tenantId: request.tenantId,
      data: { tokensUsed: result.window.currentTokens, truncated: result.truncated },
    });
    this.telemetry.recordCounter('hermes.context.assembled', 1);
    return result;
  }

  // ─── Goals ────────────────────────────────────────────────────────────────

  async createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'childGoalIds' | 'taskIds' | 'progress'>): Promise<Goal> {
    this.logger.info('[HermesCore] Creating goal', { title: goal.title });
    const created = await this.goalManager.create(goal);
    this.eventBus.emit({
      type: 'goal:created',
      timestamp: new Date(),
      source: 'hermes-core',
      tenantId: goal.tenantId,
      data: { goalId: created.id, title: created.title },
    });
    this.telemetry.recordCounter('hermes.goals.created', 1);
    return created;
  }

  async completeGoal(goalId: string): Promise<Goal> {
    const goal = await this.goalManager.complete(goalId);
    this.eventBus.emit({
      type: 'goal:completed',
      timestamp: new Date(),
      source: 'hermes-core',
      tenantId: goal.tenantId,
      data: { goalId },
    });
    this.telemetry.recordCounter('hermes.goals.completed', 1);
    return goal;
  }

  // ─── Tasks ────────────────────────────────────────────────────────────────

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'retryCount' | 'maxRetries'>): Promise<Task> {
    this.logger.info('[HermesCore] Creating task', { name: task.name });
    const created = await this.taskManager.create(task);
    this.eventBus.emit({
      type: 'task:created',
      timestamp: new Date(),
      source: 'hermes-core',
      tenantId: task.tenantId,
      data: { taskId: created.id, name: created.name },
    });
    this.telemetry.recordCounter('hermes.tasks.created', 1);
    return created;
  }

  async completeTask(taskId: string, outputs: Record<string, unknown>): Promise<Task> {
    const task = await this.taskManager.complete(taskId, outputs);
    this.eventBus.emit({
      type: 'task:completed',
      timestamp: new Date(),
      source: 'hermes-core',
      tenantId: task.tenantId,
      data: { taskId, name: task.name },
    });
    this.telemetry.recordCounter('hermes.tasks.completed', 1);
    return task;
  }

  // ─── Workflow ─────────────────────────────────────────────────────────────

  async registerWorkflow(def: WorkflowDef): Promise<void> {
    await this.workflowEngine.registerWorkflow(def);
    this.logger.info('[HermesCore] Workflow registered', { workflowId: def.id });
  }

  async executeWorkflow(workflowId: string, inputs: Record<string, unknown>): Promise<WorkflowExecution> {
    this.logger.info('[HermesCore] Executing workflow', { workflowId });
    this.eventBus.emit({
      type: 'workflow:started',
      timestamp: new Date(),
      source: 'hermes-core',
      data: { workflowId },
    });
    const result = await this.workflowEngine.execute(workflowId, inputs);
    this.eventBus.emit({
      type: result.status === 'completed' ? 'workflow:completed' : 'workflow:failed',
      timestamp: new Date(),
      source: 'hermes-core',
      data: { workflowId, executionId: result.id, status: result.status },
    });
    this.telemetry.recordCounter(`hermes.workflows.${result.status}`, 1);
    return result;
  }

  // ─── Pipeline ─────────────────────────────────────────────────────────────

  registerPipeline(def: PipelineDefinition): void {
    this.executionPipeline.register(def);
    this.logger.info('[HermesCore] Pipeline registered', { pipelineId: def.id });
  }

  async executePipeline(pipelineId: string, input: unknown): Promise<PipelineExecution> {
    this.logger.info('[HermesCore] Executing pipeline', { pipelineId });
    this.eventBus.emit({
      type: 'pipeline:started',
      timestamp: new Date(),
      source: 'hermes-core',
      data: { pipelineId },
    });
    const result = await this.executionPipeline.execute(pipelineId, input);
    this.eventBus.emit({
      type: result.status === 'completed' ? 'pipeline:completed' : 'pipeline:failed',
      timestamp: new Date(),
      source: 'hermes-core',
      data: { pipelineId, executionId: result.id, status: result.status },
    });
    this.telemetry.recordCounter(`hermes.pipelines.${result.status}`, 1);
    return result;
  }

  // ─── Memory ───────────────────────────────────────────────────────────────

  async getMemoryContext(request: MemoryContextRequest): Promise<MemoryContextResult> {
    return this.memoryIntegration.getContext(request);
  }

  async storeMemory(request: MemoryStoreRequest): Promise<void> {
    await this.memoryIntegration.store(request);
    this.telemetry.recordCounter('hermes.memory.stored', 1);
  }

  // ─── Provider Selection ───────────────────────────────────────────────────

  async selectProvider(request: ProviderSelectionRequest): Promise<ProviderSelectionResult> {
    const result = await this.aiProviderSelection.select(request);
    this.eventBus.emit({
      type: 'provider:selected',
      timestamp: new Date(),
      source: 'hermes-core',
      tenantId: request.tenantId,
      data: { provider: result.provider, model: result.model },
    });
    this.telemetry.recordCounter('hermes.provider.selected', 1, { provider: result.provider });
    return result;
  }

  // ─── Skills ───────────────────────────────────────────────────────────────

  async invokeSkill(request: SkillInvocationRequest): Promise<SkillInvocationResult> {
    this.logger.info('[HermesCore] Invoking skill', { skillId: request.skillId });
    const result = await this.skillInvocation.invoke(request);
    this.eventBus.emit({
      type: 'skill:invoked',
      timestamp: new Date(),
      source: 'hermes-core',
      tenantId: request.tenantId,
      data: { skillId: request.skillId, latencyMs: result.latencyMs },
    });
    this.telemetry.recordCounter('hermes.skills.invoked', 1);
    return result;
  }

  // ─── Agent Dispatch ───────────────────────────────────────────────────────

  async dispatchAgent(request: AgentDispatchRequest): Promise<AgentDispatchResult> {
    this.logger.info('[HermesCore] Dispatching agent', { agentId: request.agentId });
    const result = await this.agentDispatch.dispatch(request);
    this.eventBus.emit({
      type: 'agent:dispatched',
      timestamp: new Date(),
      source: 'hermes-core',
      tenantId: request.tenantId,
      data: { dispatchId: result.dispatchId, agentId: request.agentId, status: result.status },
    });
    this.telemetry.recordCounter('hermes.agents.dispatched', 1);
    return result;
  }

  // ─── Tools ────────────────────────────────────────────────────────────────

  registerTool(tool: ToolDefinition): void {
    this.toolDispatcher.register(tool);
    this.logger.info('[HermesCore] Tool registered', { tool: tool.name });
  }

  async executeTool(request: ToolCallRequest): Promise<ToolCallResult> {
    const result = await this.toolDispatcher.execute(request);
    this.eventBus.emit({
      type: result.success ? 'tool:completed' : 'tool:failed',
      timestamp: new Date(),
      source: 'hermes-core',
      data: { tool: request.tool, success: result.success, durationMs: result.durationMs },
    });
    this.telemetry.recordCounter(result.success ? 'hermes.tools.success' : 'hermes.tools.failed', 1);
    return result;
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  getStats(): {
    uptime: number;
    decisions: ReturnType<DecisionEngine['getStats']>;
    goals: number;
    tasks: number;
    workflows: number;
    pipelines: number;
    tools: number;
  } {
    return {
      uptime: this.startedAt ? Date.now() - this.startedAt.getTime() : 0,
      decisions: this.decisionEngine.getStats(),
      goals: 0,
      tasks: 0,
      workflows: 0,
      pipelines: this.executionPipeline.listPipelines().length,
      tools: this.toolDispatcher.listTools().length,
    };
  }
}
