import type { AIProviderName, ChatRequest, ChatResponse, ChatMessage } from '@jarbas/types';

// ─── Common ───────────────────────────────────────────────────────────────────

export type HermesEventName =
  | 'decision:made'
  | 'plan:created'
  | 'plan:updated'
  | 'plan:completed'
  | 'reasoning:started'
  | 'reasoning:completed'
  | 'context:assembled'
  | 'workflow:started'
  | 'workflow:step'
  | 'workflow:completed'
  | 'workflow:failed'
  | 'goal:created'
  | 'goal:updated'
  | 'goal:completed'
  | 'task:created'
  | 'task:started'
  | 'task:completed'
  | 'task:failed'
  | 'pipeline:started'
  | 'pipeline:stage'
  | 'pipeline:completed'
  | 'pipeline:failed'
  | 'agent:dispatched'
  | 'agent:completed'
  | 'agent:failed'
  | 'skill:invoked'
  | 'skill:completed'
  | 'tool:dispatched'
  | 'tool:completed'
  | 'tool:failed'
  | 'memory:context-loaded'
  | 'provider:selected'
  | 'provider:failed';

export interface HermesEvent {
  type: HermesEventName;
  timestamp: Date;
  source: string;
  tenantId?: string;
  userId?: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export type EventHandler = (event: HermesEvent) => void | Promise<void>;

export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface TelemetryMetric {
  id: string;
  name: string;
  value: number;
  type: 'counter' | 'gauge' | 'histogram';
  labels?: Record<string, string>;
  timestamp: Date;
}

// ─── Decision Engine ──────────────────────────────────────────────────────────

export type DecisionStrategy =
  | 'cost-optimized'
  | 'latency-optimized'
  | 'quality-first'
  | 'balanced'
  | 'round-robin'
  | 'custom';

export interface DecisionCriteria {
  strategy: DecisionStrategy;
  maxCost?: number;
  maxLatencyMs?: number;
  preferredProviders?: AIProviderName[];
  excludedProviders?: AIProviderName[];
  requiredCapabilities?: string[];
  weights?: DecisionWeights;
}

export interface DecisionWeights {
  cost: number;
  latency: number;
  quality: number;
  availability: number;
}

export interface DecisionInput {
  request: ChatRequest;
  criteria: DecisionCriteria;
  tenantId: string;
  sessionId?: string;
}

export interface DecisionResult {
  provider: AIProviderName;
  model: string;
  reason: string;
  score: number;
  alternatives: ProviderScore[];
  latencyMs: number;
}

export interface ProviderScore {
  provider: AIProviderName;
  model: string;
  score: number;
  costScore: number;
  latencyScore: number;
  qualityScore: number;
  availabilityScore: number;
  reason: string;
}

export interface DecisionEngine {
  decide(input: DecisionInput): Promise<DecisionResult>;
  getHistory(limit?: number): DecisionResult[];
  getStats(): DecisionStats;
}

export interface DecisionStats {
  totalDecisions: number;
  byProvider: Record<AIProviderName, number>;
  byStrategy: Record<DecisionStrategy, number>;
  avgDecisionTimeMs: number;
}

// ─── Planner Engine ───────────────────────────────────────────────────────────

export type PlanStatus = 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';

export type TaskStepType = 'ai-call' | 'tool-call' | 'condition' | 'parallel' | 'human-review';

export interface PlanGoal {
  id: string;
  description: string;
  successCriteria: string[];
  deadline?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PlanStep {
  id: string;
  name: string;
  type: TaskStepType;
  description: string;
  inputs: Record<string, unknown>;
  dependencies: string[];
  timeout?: number;
  retryPolicy?: RetryPolicy;
  condition?: StepCondition;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
}

export interface StepCondition {
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
  value: unknown;
}

export interface ExecutionPlan {
  id: string;
  goal: PlanGoal;
  steps: PlanStep[];
  status: PlanStatus;
  context: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: PlanResult;
}

export interface PlanResult {
  success: boolean;
  outputs: Record<string, unknown>;
  stepsCompleted: number;
  stepsTotal: number;
  errors: PlanError[];
  durationMs: number;
}

export interface PlanError {
  stepId: string;
  message: string;
  timestamp: Date;
  retryable: boolean;
}

export interface PlannerEngine {
  createPlan(goal: PlanGoal, context?: Record<string, unknown>): Promise<ExecutionPlan>;
  updatePlan(planId: string, updates: Partial<ExecutionPlan>): Promise<ExecutionPlan>;
  getPlan(planId: string): Promise<ExecutionPlan | null>;
  listPlans(status?: PlanStatus): Promise<ExecutionPlan[]>;
  cancelPlan(planId: string): Promise<void>;
  decomposeGoal(goal: string, context?: Record<string, unknown>): Promise<PlanStep[]>;
}

// ─── Reasoning Engine ─────────────────────────────────────────────────────────

export type ReasoningMode = 'chain-of-thought' | 'tree-of-thought' | 'reflective' | 'multi-perspective';

export interface ReasoningInput {
  query: string;
  context: string[];
  mode: ReasoningMode;
  maxSteps?: number;
  confidence_threshold?: number;
  tenantId: string;
}

export interface ReasoningStep {
  step: number;
  thought: string;
  confidence: number;
  evidence: string[];
  alternatives: string[];
}

export interface ReasoningResult {
  conclusion: string;
  confidence: number;
  steps: ReasoningStep[];
  mode: ReasoningMode;
  latencyMs: number;
  tokensUsed: number;
}

export interface ReasoningChain {
  id: string;
  input: ReasoningInput;
  steps: ReasoningStep[];
  conclusion: string;
  confidence: number;
  createdAt: Date;
}

export interface ReasoningEngine {
  reason(input: ReasoningInput): Promise<ReasoningResult>;
  getChain(chainId: string): Promise<ReasoningChain | null>;
  getHistory(limit?: number): ReasoningChain[];
}

// ─── Context Engine ───────────────────────────────────────────────────────────

export interface ContextWindow {
  maxTokens: number;
  currentTokens: number;
  messages: ChatMessage[];
  systemPrompt?: string;
  metadata: Record<string, unknown>;
}

export interface ContextSource {
  type: 'memory' | 'conversation' | 'knowledge' | 'system' | 'tool-result';
  content: string;
  priority: number;
  tokensEstimate: number;
  metadata?: Record<string, unknown>;
}

export interface ContextAssemblyRequest {
  sessionId: string;
  tenantId: string;
  query: string;
  maxTokens: number;
  sources: ContextSource[];
  systemPrompt?: string;
}

export interface ContextAssemblyResult {
  window: ContextWindow;
  sourcesUsed: ContextSource[];
  tokensSaved: number;
  truncated: boolean;
}

export interface ContextEngine {
  assemble(request: ContextAssemblyRequest): Promise<ContextAssemblyResult>;
  addSource(source: ContextSource): void;
  removeSource(sourceId: string): void;
  getSources(): ContextSource[];
  estimateTokens(text: string): number;
}

// ─── Workflow Engine ──────────────────────────────────────────────────────────

export type WorkflowStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export type WorkflowStepType = 'sequential' | 'parallel' | 'conditional' | 'loop';

export interface WorkflowStepDef {
  id: string;
  name: string;
  type: WorkflowStepType;
  handler: string;
  inputs: Record<string, unknown>;
  dependencies: string[];
  timeout?: number;
  retryPolicy?: RetryPolicy;
  branches?: WorkflowBranch[];
}

export interface WorkflowBranch {
  condition: StepCondition;
  stepIds: string[];
}

export interface WorkflowDef {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStepDef[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  currentStep?: string;
  completedSteps: string[];
  errors: WorkflowError[];
  startedAt: Date;
  completedAt?: Date;
}

export interface WorkflowError {
  stepId: string;
  message: string;
  timestamp: Date;
  retryable: boolean;
}

export interface WorkflowEngine {
  registerWorkflow(def: WorkflowDef): Promise<void>;
  getWorkflow(workflowId: string): Promise<WorkflowDef | null>;
  listWorkflows(): Promise<WorkflowDef[]>;
  execute(workflowId: string, inputs: Record<string, unknown>): Promise<WorkflowExecution>;
  getExecution(executionId: string): Promise<WorkflowExecution | null>;
  cancelExecution(executionId: string): Promise<void>;
}

// ─── Goal Manager ─────────────────────────────────────────────────────────────

export type GoalStatus = 'active' | 'completed' | 'failed' | 'paused' | 'cancelled';

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tenantId: string;
  userId: string;
  parentGoalId?: string;
  childGoalIds: string[];
  taskIds: string[];
  successCriteria: string[];
  deadline?: Date;
  progress: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface GoalProgress {
  goalId: string;
  progress: number;
  tasksCompleted: number;
  tasksTotal: number;
  subGoalsCompleted: number;
  subGoalsTotal: number;
  blockers: string[];
}

export interface GoalManager {
  create(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'childGoalIds' | 'taskIds' | 'progress'>): Promise<Goal>;
  get(goalId: string): Promise<Goal | null>;
  list(filters?: { status?: GoalStatus; tenantId?: string; userId?: string }): Promise<Goal[]>;
  update(goalId: string, updates: Partial<Goal>): Promise<Goal>;
  delete(goalId: string): Promise<void>;
  complete(goalId: string): Promise<Goal>;
  addChildGoal(parentId: string, childGoal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'childGoalIds' | 'taskIds' | 'progress' | 'parentGoalId'>): Promise<Goal>;
  addTask(goalId: string, taskId: string): Promise<void>;
  removeTask(goalId: string, taskId: string): Promise<void>;
  getProgress(goalId: string): Promise<GoalProgress>;
}

// ─── Task Manager ─────────────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tenantId: string;
  userId: string;
  goalId?: string;
  type: TaskStepType;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  dependencies: string[];
  assignedTo?: string;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  retryCount: number;
  maxRetries: number;
  error?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface TaskManager {
  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'retryCount' | 'maxRetries'>): Promise<Task>;
  get(taskId: string): Promise<Task | null>;
  list(filters?: { status?: TaskStatus; goalId?: string; tenantId?: string }): Promise<Task[]>;
  update(taskId: string, updates: Partial<Task>): Promise<Task>;
  delete(taskId: string): Promise<void>;
  start(taskId: string): Promise<Task>;
  complete(taskId: string, outputs: Record<string, unknown>): Promise<Task>;
  fail(taskId: string, error: string): Promise<Task>;
  cancel(taskId: string): Promise<Task>;
  retry(taskId: string): Promise<Task>;
  getReadyTasks(): Promise<Task[]>;
}

// ─── Execution Pipeline ───────────────────────────────────────────────────────

export type PipelineStageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface PipelineStage {
  name: string;
  handler: string;
  config: Record<string, unknown>;
  timeout?: number;
}

export interface PipelineStageResult {
  stage: string;
  status: PipelineStageStatus;
  output: unknown;
  durationMs: number;
  error?: string;
}

export interface PipelineDefinition {
  id: string;
  name: string;
  stages: PipelineStage[];
  onError: 'stop' | 'continue' | 'retry';
}

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  status: WorkflowStatus;
  input: unknown;
  output?: unknown;
  stages: PipelineStageResult[];
  startedAt: Date;
  completedAt?: Date;
}

export interface ExecutionPipeline {
  register(def: PipelineDefinition): void;
  execute(pipelineId: string, input: unknown): Promise<PipelineExecution>;
  getExecution(executionId: string): Promise<PipelineExecution | null>;
  listPipelines(): PipelineDefinition[];
}

// ─── Memory Integration ───────────────────────────────────────────────────────

export interface MemoryContextRequest {
  sessionId: string;
  tenantId: string;
  query: string;
  limit?: number;
  threshold?: number;
}

export interface MemoryContextResult {
  entries: MemoryContextEntry[];
  totalTokens: number;
  queryTimeMs: number;
}

export interface MemoryContextEntry {
  content: string;
  score: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface MemoryStoreRequest {
  content: string;
  tenantId: string;
  sessionId: string;
  userId?: string;
  type: 'conversation' | 'knowledge' | 'summary';
  metadata?: Record<string, unknown>;
}

export interface MemoryIntegration {
  getContext(request: MemoryContextRequest): Promise<MemoryContextResult>;
  store(request: MemoryStoreRequest): Promise<void>;
  search(query: string, tenantId: string, limit?: number): Promise<MemoryContextEntry[]>;
  delete(entryId: string): Promise<void>;
}

// ─── AI Provider Selection ────────────────────────────────────────────────────

export interface ProviderSelectionRequest {
  request: ChatRequest;
  tenantId: string;
  strategy: DecisionStrategy;
  budget?: { maxCostUsd: number; maxLatencyMs: number };
}

export interface ProviderSelectionResult {
  provider: AIProviderName;
  model: string;
  estimatedCostUsd: number;
  estimatedLatencyMs: number;
  reason: string;
}

export interface AIProviderSelection {
  select(request: ProviderSelectionRequest): Promise<ProviderSelectionResult>;
  getAvailableProviders(): AIProviderName[];
  getProviderHealth(provider: AIProviderName): Promise<{ status: string; latencyMs: number }>;
}

// ─── Skill Invocation ─────────────────────────────────────────────────────────

export interface SkillInvocationRequest {
  skillId: string;
  input: string;
  context?: Record<string, unknown>;
  tenantId: string;
}

export interface SkillInvocationResult {
  skillId: string;
  output: string;
  toolCalls: { tool: string; args: unknown; result: unknown }[];
  tokensUsed: number;
  latencyMs: number;
}

export interface SkillInvocation {
  invoke(request: SkillInvocationRequest): Promise<SkillInvocationResult>;
  listAvailable(): Promise<{ id: string; name: string; description: string }[]>;
}

// ─── Agent Dispatch ───────────────────────────────────────────────────────────

export type AgentDispatchStatus = 'dispatched' | 'running' | 'completed' | 'failed' | 'timeout';

export interface AgentDispatchRequest {
  agentId: string;
  input: string;
  tenantId: string;
  userId: string;
  sessionId?: string;
  timeout?: number;
  context?: Record<string, unknown>;
}

export interface AgentDispatchResult {
  dispatchId: string;
  agentId: string;
  status: AgentDispatchStatus;
  output?: string;
  iterations: number;
  toolCalls: { tool: string; args: unknown; result: unknown }[];
  totalTokens: number;
  totalCostUsd: number;
  latencyMs: number;
}

export interface AgentDispatch {
  dispatch(request: AgentDispatchRequest): Promise<AgentDispatchResult>;
  getStatus(dispatchId: string): Promise<AgentDispatchResult | null>;
  cancel(dispatchId: string): Promise<void>;
}

// ─── Tool Dispatcher ──────────────────────────────────────────────────────────

export type ToolHandler = (args: Record<string, unknown>, context?: Record<string, unknown>) => Promise<unknown>;

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required: boolean }>;
  handler: ToolHandler;
  timeout?: number;
}

export interface ToolCallRequest {
  tool: string;
  args: Record<string, unknown>;
  context?: Record<string, unknown>;
  timeout?: number;
}

export interface ToolCallResult {
  tool: string;
  result: unknown;
  success: boolean;
  durationMs: number;
  error?: string;
}

export interface ToolDispatcher {
  register(tool: ToolDefinition): void;
  unregister(toolName: string): void;
  execute(request: ToolCallRequest): Promise<ToolCallResult>;
  listTools(): ToolDefinition[];
  hasTool(toolName: string): boolean;
}

// ─── Hermes Core Config ───────────────────────────────────────────────────────

export interface HermesCoreConfig {
  defaultStrategy: DecisionStrategy;
  maxConcurrentTasks: number;
  defaultTaskTimeout: number;
  defaultRetryPolicy: RetryPolicy;
  logLevel: LogLevel;
  telemetryEnabled: boolean;
  memoryEnabled: boolean;
  contextWindowMaxTokens: number;
}
