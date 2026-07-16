import type {
  PlannerEngine as IPlannerEngine,
  ExecutionPlan,
  PlanGoal,
  PlanStep,
  PlanStatus,
  PlanResult,
  PlanError,
  TaskStepType,
  RetryPolicy,
  Logger,
} from './interfaces.js';
import { generateId } from '@jarbas/utils';

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  backoffMs: 1000,
  backoffMultiplier: 2,
};

export class PlannerEngine implements IPlannerEngine {
  private plans = new Map<string, ExecutionPlan>();
  private logger?: Logger;

  constructor(logger?: Logger) {
    this.logger = logger;
  }

  async createPlan(goal: PlanGoal, context?: Record<string, unknown>): Promise<ExecutionPlan> {
    const id = generateId();
    const steps = this.decomposeGoalSync(goal.description, context);

    const plan: ExecutionPlan = {
      id,
      goal,
      steps,
      status: 'draft',
      context: context ?? {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.plans.set(id, plan);
    this.logger?.info(`Created plan ${id} with ${steps.length} steps`);

    return plan;
  }

  async updatePlan(
    planId: string,
    updates: Partial<ExecutionPlan>,
  ): Promise<ExecutionPlan> {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    const updated: ExecutionPlan = {
      ...plan,
      ...updates,
      id: plan.id,
      createdAt: plan.createdAt,
      updatedAt: new Date(),
    };

    this.plans.set(planId, updated);
    this.logger?.info(`Updated plan ${planId}`);

    return updated;
  }

  async getPlan(planId: string): Promise<ExecutionPlan | null> {
    return this.plans.get(planId) ?? null;
  }

  async listPlans(status?: PlanStatus): Promise<ExecutionPlan[]> {
    const all = Array.from(this.plans.values());
    if (status !== undefined) {
      return all.filter((plan) => plan.status === status);
    }
    return all;
  }

  async cancelPlan(planId: string): Promise<void> {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    plan.status = 'cancelled';
    plan.updatedAt = new Date();
    this.plans.set(planId, plan);
    this.logger?.info(`Cancelled plan ${planId}`);
  }

  async decomposeGoal(goal: string, context?: Record<string, unknown>): Promise<PlanStep[]> {
    return this.decomposeGoalSync(goal, context);
  }

  private decomposeGoalSync(goalDescription: string, context?: Record<string, unknown>): PlanStep[] {
    const text = goalDescription.toLowerCase();
    const steps: PlanStep[] = [];
    let stepIndex = 0;

    const addStep = (
      type: TaskStepType,
      name: string,
      description: string,
      deps: string[],
    ): PlanStep => {
      const id = generateId();
      const step: PlanStep = {
        id,
        name,
        type,
        description,
        inputs: { context },
        dependencies: deps,
        retryPolicy: { ...DEFAULT_RETRY_POLICY },
      };
      steps.push(step);
      stepIndex++;
      return step;
    };

    const hasResearch = ['research', 'search', 'find', 'lookup', 'investigate', 'discover'].some(
      (kw) => text.includes(kw),
    );
    const hasWrite = ['write', 'create', 'generate', 'draft', 'compose', 'build'].some((kw) =>
      text.includes(kw),
    );
    const hasAnalysis = ['analyze', 'review', 'evaluate', 'assess', 'examine', 'inspect'].some(
      (kw) => text.includes(kw),
    );

    let prevId = '';

    if (hasResearch) {
      const step = addStep('ai-call', 'Research', 'Gather relevant data and information for the task', []);
      prevId = step.id;
    }

    if (hasAnalysis) {
      const deps = prevId ? [prevId] : [];
      const step = addStep('ai-call', 'Analyze', 'Examine gathered data and extract insights', deps);
      prevId = step.id;
    }

    if (hasWrite) {
      const deps = prevId ? [prevId] : [];
      const step = addStep('tool-call', 'Create', 'Produce the requested output based on analysis', deps);
      prevId = step.id;
    }

    if (!hasResearch && !hasWrite && !hasAnalysis) {
      const deps = prevId ? [prevId] : [];
      const step = addStep('ai-call', 'Execute', 'Perform the core operations required by the goal', deps);
      prevId = step.id;
    }

    const validateStep = addStep('condition', 'Validate', 'Verify that the output meets the requirements', prevId ? [prevId] : []);
    prevId = validateStep.id;

    addStep('ai-call', 'Summarize', 'Compile a summary of actions taken and results achieved', prevId ? [prevId] : []);

    return steps;
  }
}
