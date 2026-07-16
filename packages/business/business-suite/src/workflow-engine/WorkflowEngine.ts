import type {
  Workflow,
  WorkflowStep,
  WorkflowExecution,
  WorkflowStepExecution,
  WorkflowTriggerType,
  BusinessSuiteConfig,
} from '../interfaces.js';

class DefaultLogger {
  private context: string;
  constructor(context: string) { this.context = context; }
  async debug(msg: string, data?: unknown) { console.debug(`[${this.context}] DEBUG`, msg, data ?? ''); }
  async info(msg: string, data?: unknown) { console.log(`[${this.context}] INFO`, msg, data ?? ''); }
  async warn(msg: string, data?: unknown) { console.warn(`[${this.context}] WARN`, msg, data ?? ''); }
  async error(msg: string, data?: unknown) { console.error(`[${this.context}] ERROR`, msg, data ?? ''); }
}

export interface WorkflowEngineConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  runningExecutions: number;
  completedExecutions: number;
  failedExecutions: number;
  averageExecutionTimeMs: number;
}

export class WorkflowEngine {
  private logger = new DefaultLogger('workflow-engine');
  private workflows = new Map<string, Workflow>();
  private executions = new Map<string, WorkflowExecution>();
  private config: WorkflowEngineConfig;

  constructor(config?: WorkflowEngineConfig) {
    this.config = config ?? {};
  }

  async createWorkflow(data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'steps' | 'executionCount'>): Promise<Workflow> {
    const now = new Date();
    const workflow: Workflow = { ...data, id: crypto.randomUUID(), steps: [], executionCount: 0, createdAt: now, updatedAt: now };
    this.workflows.set(workflow.id, workflow);
    await this.logger.info('Workflow created', { id: workflow.id, name: workflow.name });
    return workflow;
  }

  async getWorkflowById(id: string): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async listWorkflows(companyId: string, filters?: { triggerType?: WorkflowTriggerType; isActive?: boolean }): Promise<Workflow[]> {
    let results = Array.from(this.workflows.values()).filter(w => w.companyId === companyId);
    if (filters?.triggerType) results = results.filter(w => w.triggerType === filters.triggerType);
    if (filters?.isActive !== undefined) results = results.filter(w => w.isActive === filters.isActive);
    return results;
  }

  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<Workflow> {
    const existing = this.workflows.get(id);
    if (!existing) throw new Error(`Workflow ${id} not found`);
    const updated: Workflow = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.workflows.set(id, updated);
    await this.logger.info('Workflow updated', { id });
    return updated;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    const deleted = this.workflows.delete(id);
    if (deleted) {
      for (const [execId, exec] of this.executions) {
        if (exec.workflowId === id) this.executions.delete(execId);
      }
      await this.logger.info('Workflow deleted', { id });
    }
    return deleted;
  }

  async addStep(workflowId: string, data: Omit<WorkflowStep, 'id'>): Promise<WorkflowStep> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);
    const step: WorkflowStep = { ...data, id: crypto.randomUUID() };
    workflow.steps.push(step);
    workflow.steps.sort((a, b) => a.order - b.order);
    workflow.updatedAt = new Date();
    this.workflows.set(workflowId, workflow);
    await this.logger.info('Step added', { workflowId, stepId: step.id });
    return step;
  }

  async updateStep(workflowId: string, stepId: string, data: Partial<WorkflowStep>): Promise<WorkflowStep> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);
    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) throw new Error(`WorkflowStep ${stepId} not found`);
    Object.assign(step, data, { id: step.id });
    workflow.updatedAt = new Date();
    this.workflows.set(workflowId, workflow);
    await this.logger.info('Step updated', { workflowId, stepId });
    return step;
  }

  async removeStep(workflowId: string, stepId: string): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);
    const idx = workflow.steps.findIndex(s => s.id === stepId);
    if (idx === -1) throw new Error(`WorkflowStep ${stepId} not found`);
    workflow.steps.splice(idx, 1);
    workflow.updatedAt = new Date();
    this.workflows.set(workflowId, workflow);
    await this.logger.info('Step removed', { workflowId, stepId });
    return true;
  }

  async toggleWorkflow(id: string, isActive: boolean): Promise<Workflow> {
    const workflow = this.workflows.get(id);
    if (!workflow) throw new Error(`Workflow ${id} not found`);
    workflow.isActive = isActive;
    workflow.updatedAt = new Date();
    this.workflows.set(id, workflow);
    await this.logger.info('Workflow toggled', { id, isActive });
    return workflow;
  }

  async executeWorkflow(workflowId: string, triggerData: Record<string, unknown> = {}): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);
    if (!workflow.isActive) throw new Error(`Workflow ${workflowId} is not active`);
    if (workflow.steps.length === 0) throw new Error(`Workflow ${workflowId} has no steps`);

    const now = new Date();
    const firstStep = workflow.steps.sort((a, b) => a.order - b.order)[0];
    const stepExecutions: WorkflowStepExecution[] = workflow.steps.map(s => ({
      stepId: s.id,
      status: 'pending' as const,
    }));

    const execution: WorkflowExecution = {
      id: crypto.randomUUID(),
      workflowId,
      companyId: workflow.companyId,
      triggerData,
      status: 'running',
      currentStepId: firstStep.id,
      steps: stepExecutions,
      startedAt: now,
    };

    workflow.executionCount += 1;
    workflow.lastExecutedAt = now;
    workflow.updatedAt = now;
    this.workflows.set(workflowId, workflow);

    const stepResult = await this.executeStep(firstStep, triggerData);
    const firstStepExec = execution.steps.find(s => s.stepId === firstStep.id);
    if (firstStepExec) {
      firstStepExec.status = stepResult.success ? 'completed' : 'failed';
      firstStepExec.input = triggerData;
      firstStepExec.output = stepResult.output;
      firstStepExec.startedAt = now;
      firstStepExec.completedAt = new Date();
      if (!stepResult.success) firstStepExec.error = stepResult.error;
    }

    execution.status = stepResult.success ? 'completed' : 'failed';
    execution.completedAt = new Date();
    if (!stepResult.success) execution.error = stepResult.error;

    this.executions.set(execution.id, execution);
    await this.logger.info('Workflow executed', { workflowId, executionId: execution.id, status: execution.status });
    return execution;
  }

  private async executeStep(step: WorkflowStep, input: Record<string, unknown>): Promise<{ success: boolean; output?: Record<string, unknown>; error?: string }> {
    try {
      const output: Record<string, unknown> = { ...input, stepType: step.type, stepName: step.name, processedAt: new Date().toISOString() };
      if (step.type === 'delay') {
        const delayMs = (step.config['delayMs'] as number) ?? 1000;
        await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 5000)));
      }
      return { success: true, output };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async getExecutionById(id: string): Promise<WorkflowExecution | undefined> {
    return this.executions.get(id);
  }

  async listExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    return Array.from(this.executions.values()).filter(e => e.workflowId === workflowId);
  }

  async getWorkflowStats(companyId: string): Promise<WorkflowStats> {
    const workflows = Array.from(this.workflows.values()).filter(w => w.companyId === companyId);
    const executions = Array.from(this.executions.values()).filter(e => e.companyId === companyId);
    const completedExecs = executions.filter(e => e.status === 'completed' && e.completedAt);
    const totalExecTimeMs = completedExecs.reduce((sum, e) => sum + (e.completedAt!.getTime() - e.startedAt.getTime()), 0);
    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.isActive).length,
      totalExecutions: executions.length,
      runningExecutions: executions.filter(e => e.status === 'running').length,
      completedExecutions: executions.filter(e => e.status === 'completed').length,
      failedExecutions: executions.filter(e => e.status === 'failed').length,
      averageExecutionTimeMs: completedExecs.length > 0 ? totalExecTimeMs / completedExecs.length : 0,
    };
  }
}

export { WorkflowEngine as default };
