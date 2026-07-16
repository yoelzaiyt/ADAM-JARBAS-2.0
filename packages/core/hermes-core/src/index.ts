// ─── Types (re-export interfaces that don't conflict with class names) ───────
export type {
  HermesEventName,
  HermesEvent,
  EventHandler,
  LogLevel,
  TelemetryMetric,
  DecisionStrategy,
  DecisionCriteria,
  DecisionWeights,
  DecisionInput,
  DecisionResult,
  ProviderScore,
  DecisionStats,
  PlanStatus,
  PlanGoal,
  PlanStep,
  RetryPolicy,
  StepCondition,
  ExecutionPlan,
  PlanResult,
  PlanError,
  ReasoningMode,
  ReasoningInput,
  ReasoningStep,
  ReasoningResult,
  ReasoningChain,
  ContextWindow,
  ContextSource,
  ContextAssemblyRequest,
  ContextAssemblyResult,
  WorkflowStatus,
  WorkflowStepType,
  WorkflowStepDef,
  WorkflowBranch,
  WorkflowDef,
  WorkflowExecution,
  WorkflowError,
  GoalStatus,
  Goal,
  GoalProgress,
  TaskStatus,
  TaskPriority,
  Task,
  PipelineStageStatus,
  PipelineStage,
  PipelineStageResult,
  PipelineDefinition,
  PipelineExecution,
  MemoryContextRequest,
  MemoryContextResult,
  MemoryContextEntry,
  MemoryStoreRequest,
  ProviderSelectionRequest,
  ProviderSelectionResult,
  SkillInvocationRequest,
  SkillInvocationResult,
  AgentDispatchStatus,
  AgentDispatchRequest,
  AgentDispatchResult,
  ToolHandler,
  ToolDefinition,
  ToolCallRequest,
  ToolCallResult,
  HermesCoreConfig,
} from './interfaces.js';

// ─── Implementations ─────────────────────────────────────────────────────────
export { EventBus } from './EventBus.js';
export { Logger } from './Logger.js';
export { Telemetry } from './Telemetry.js';
export { DecisionEngine } from './DecisionEngine.js';
export { PlannerEngine } from './PlannerEngine.js';
export { ReasoningEngine } from './ReasoningEngine.js';
export { ContextEngine } from './ContextEngine.js';
export { GoalManager } from './GoalManager.js';
export { TaskManager } from './TaskManager.js';
export { WorkflowEngine } from './WorkflowEngine.js';
export { ExecutionPipeline } from './ExecutionPipeline.js';
export { MemoryIntegration } from './MemoryIntegration.js';
export { AIProviderSelection } from './AIProviderSelection.js';
export { SkillInvocation } from './SkillInvocation.js';
export { AgentDispatch } from './AgentDispatch.js';
export { ToolDispatcher } from './ToolDispatcher.js';

// ─── Core Orchestrator ───────────────────────────────────────────────────────
export { HermesCore } from './HermesCore.js';

// ─── Interface types for consumers who need them ─────────────────────────────
export type {
  DecisionEngine as DecisionEngineInterface,
  PlannerEngine as PlannerEngineInterface,
  ReasoningEngine as ReasoningEngineInterface,
  ContextEngine as ContextEngineInterface,
  GoalManager as GoalManagerInterface,
  TaskManager as TaskManagerInterface,
  WorkflowEngine as WorkflowEngineInterface,
  ExecutionPipeline as ExecutionPipelineInterface,
  MemoryIntegration as MemoryIntegrationInterface,
  AIProviderSelection as AIProviderSelectionInterface,
  SkillInvocation as SkillInvocationInterface,
  AgentDispatch as AgentDispatchInterface,
  ToolDispatcher as ToolDispatcherInterface,
  Logger as LoggerInterface,
} from './interfaces.js';
