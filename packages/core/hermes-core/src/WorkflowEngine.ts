import type {
  WorkflowEngine as IWorkflowEngine,
  WorkflowDef,
  WorkflowStepDef,
  WorkflowExecution,
  WorkflowStatus,
  WorkflowError,
  WorkflowBranch,
  RetryPolicy,
  Logger,
} from './interfaces.js';
import { generateId } from '@jarbas/utils';

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  backoffMs: 1000,
  backoffMultiplier: 2,
};

export class WorkflowEngine implements IWorkflowEngine {
  private workflows = new Map<string, WorkflowDef>();
  private executions = new Map<string, WorkflowExecution>();
  private logger?: Logger;

  constructor(logger?: Logger) {
    this.logger = logger;
  }

  async registerWorkflow(def: WorkflowDef): Promise<void> {
    this.workflows.set(def.id, def);
    this.logger?.info(`Registered workflow: ${def.id} (${def.name})`);
  }

  async getWorkflow(workflowId: string): Promise<WorkflowDef | null> {
    return this.workflows.get(workflowId) ?? null;
  }

  async listWorkflows(): Promise<WorkflowDef[]> {
    return Array.from(this.workflows.values());
  }

  async execute(
    workflowId: string,
    inputs: Record<string, unknown>,
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const executionId = generateId();
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'running',
      inputs,
      outputs: {},
      completedSteps: [],
      errors: [],
      startedAt: new Date(),
    };

    this.executions.set(executionId, execution);
    this.logger?.info(`Started workflow execution: ${executionId}`);

    try {
      const stepOrder = this.resolveStepOrder(workflow.steps);

      for (const stepId of stepOrder) {
        const step = workflow.steps.find((s) => s.id === stepId);
        if (!step) continue;

        const depsCompleted = step.dependencies.every((dep) =>
          execution.completedSteps.includes(dep),
        );

        if (!depsCompleted) {
          this.logger?.warn(
            `Skipping step ${step.id}: dependencies not met`,
          );
          continue;
        }

        execution.currentStep = step.id;
        this.logger?.info(`Executing step: ${step.id} (${step.name})`);

        const result = await this.executeStep(step, execution);

        if (result.success) {
          execution.completedSteps.push(step.id);
          Object.assign(execution.outputs, result.output);
        } else {
          const error: WorkflowError = {
            stepId: step.id,
            message: result.error ?? 'Step execution failed',
            timestamp: new Date(),
            retryable: result.retryable,
          };
          execution.errors.push(error);

          const onError = step.retryPolicy
            ? 'retry'
            : 'stop';

          if (onError === 'stop') {
            execution.status = 'failed';
            execution.completedAt = new Date();
            this.logger?.error(
              `Workflow ${executionId} failed at step ${step.id}`,
            );
            return execution;
          }

          if (onError === 'retry' && step.retryPolicy) {
            const retried = this.retryStep(step, execution, step.retryPolicy);
            if (retried) {
              execution.completedSteps.push(step.id);
              Object.assign(execution.outputs, retried.output);
            } else {
              execution.status = 'failed';
              execution.completedAt = new Date();
              this.logger?.error(
                `Workflow ${executionId} failed after retries at step ${step.id}`,
              );
              return execution;
            }
          }
        }
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
      this.logger?.info(`Workflow execution completed: ${executionId}`);
    } catch (err) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.errors.push({
        stepId: execution.currentStep ?? 'unknown',
        message: err instanceof Error ? err.message : String(err),
        timestamp: new Date(),
        retryable: false,
      });
      this.logger?.error(`Workflow ${executionId} failed with error: ${err}`);
    }

    return execution;
  }

  async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    return this.executions.get(executionId) ?? null;
  }

  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    execution.status = 'failed';
    execution.completedAt = new Date();
    this.logger?.info(`Cancelled workflow execution: ${executionId}`);
  }

  private resolveStepOrder(steps: WorkflowStepDef[]): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (stepId: string) => {
      if (visited.has(stepId)) return;
      visited.add(stepId);

      const step = steps.find((s) => s.id === stepId);
      if (!step) return;

      for (const dep of step.dependencies) {
        visit(dep);
      }

      order.push(stepId);
    };

    for (const step of steps) {
      visit(step.id);
    }

    return order;
  }

  private async executeStep(
    step: WorkflowStepDef,
    execution: WorkflowExecution,
  ): Promise<{
    success: boolean;
    output: Record<string, unknown>;
    error?: string;
    retryable: boolean;
  }> {
    const start = Date.now();

    try {
      await this.simulateStepExecution(step);

      const output: Record<string, unknown> = {
        [`${step.id}_result`]: `mock_output_${step.id}`,
        [`${step.id}_duration`]: Date.now() - start,
        [`${step.id}_handler`]: step.handler,
      };

      this.logger?.info(
        `Step ${step.id} completed in ${Date.now() - start}ms`,
      );

      return { success: true, output, retryable: false };
    } catch (err) {
      return {
        success: false,
        output: {},
        error: err instanceof Error ? err.message : String(err),
        retryable: true,
      };
    }
  }

  private retryStep(
    step: WorkflowStepDef,
    execution: WorkflowExecution,
    policy: RetryPolicy,
  ): { success: boolean; output: Record<string, unknown> } | null {
    let lastError: string | undefined;

    for (let attempt = 0; attempt < policy.maxRetries; attempt++) {
      this.logger?.info(
        `Retrying step ${step.id} (attempt ${attempt + 1}/${policy.maxRetries})`,
      );

      try {
        const output: Record<string, unknown> = {
          [`${step.id}_result`]: `mock_output_${step.id}_retry_${attempt + 1}`,
          [`${step.id}_retry`]: attempt + 1,
        };

        return { success: true, output };
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (lastError) {
      execution.errors.push({
        stepId: step.id,
        message: lastError,
        timestamp: new Date(),
        retryable: false,
      });
    }

    return null;
  }

  private async simulateStepExecution(step: WorkflowStepDef): Promise<void> {
    const delay = Math.random() * 50 + 10;
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (step.type === 'conditional' && step.branches) {
      this.logger?.debug(`Evaluating branches for step ${step.id}`);
    }

    if (step.type === 'loop') {
      this.logger?.debug(`Executing loop for step ${step.id}`);
    }
  }
}
