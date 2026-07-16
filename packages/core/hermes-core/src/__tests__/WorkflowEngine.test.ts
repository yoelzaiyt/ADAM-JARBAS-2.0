import { describe, it, expect, vi } from 'vitest';
import { WorkflowEngine } from '../WorkflowEngine.js';
import type { WorkflowDef, WorkflowStepDef } from '../interfaces.js';

function makeStep(overrides: Partial<WorkflowStepDef> = {}): WorkflowStepDef {
  return {
    id: 'step1',
    name: 'Step 1',
    type: 'sequential',
    handler: 'handler1',
    inputs: {},
    dependencies: [],
    ...overrides,
  };
}

function makeWorkflow(overrides: Partial<WorkflowDef> = {}): WorkflowDef {
  return {
    id: 'wf1',
    name: 'Test Workflow',
    description: 'test',
    steps: [makeStep()],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('WorkflowEngine', () => {
  it('registerWorkflow: registers a workflow', async () => {
    const engine = new WorkflowEngine();
    const wf = makeWorkflow();
    await engine.registerWorkflow(wf);
    const fetched = await engine.getWorkflow('wf1');
    expect(fetched).toEqual(wf);
  });

  it('getWorkflow: returns workflow by id', async () => {
    const engine = new WorkflowEngine();
    await engine.registerWorkflow(makeWorkflow());
    const result = await engine.getWorkflow('wf1');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Test Workflow');
  });

  it('getWorkflow: returns null if not found', async () => {
    const engine = new WorkflowEngine();
    expect(await engine.getWorkflow('nonexistent')).toBeNull();
  });

  it('listWorkflows: returns all workflows', async () => {
    const engine = new WorkflowEngine();
    await engine.registerWorkflow(makeWorkflow());
    await engine.registerWorkflow(makeWorkflow({ id: 'wf2', name: 'WF2' }));
    const list = await engine.listWorkflows();
    expect(list).toHaveLength(2);
  });

  it('execute: runs a workflow and returns completed execution', async () => {
    const engine = new WorkflowEngine();
    await engine.registerWorkflow(makeWorkflow());
    const exec = await engine.execute('wf1', { key: 'value' });
    expect(exec.id).toBeTruthy();
    expect(exec.workflowId).toBe('wf1');
    expect(exec.status).toBe('completed');
    expect(exec.completedSteps).toContain('step1');
    expect(exec.outputs).toHaveProperty('step1_result');
    expect(exec.errors).toHaveLength(0);
    expect(exec.completedAt).toBeInstanceOf(Date);
  });

  it('execute: throws for nonexistent workflow', async () => {
    const engine = new WorkflowEngine();
    await expect(engine.execute('nope', {})).rejects.toThrow('Workflow not found');
  });

  it('execute: handles step failures (no retry policy -> stop)', async () => {
    const engine = new WorkflowEngine();
    const badStep = makeStep({ id: 'bad', name: 'Bad Step' });
    const wf = makeWorkflow({ id: 'wf_fail', steps: [badStep] });
    await engine.registerWorkflow(wf);

    const simulateSpy = vi.spyOn(
      engine as unknown as { simulateStepExecution: (step: WorkflowStepDef) => Promise<void> },
      'simulateStepExecution',
    );
    simulateSpy.mockRejectedValueOnce(new Error('step boom'));

    const exec = await engine.execute('wf_fail', {});
    expect(exec.status).toBe('failed');
    expect(exec.errors).toHaveLength(1);
    expect(exec.errors[0].stepId).toBe('bad');
    expect(exec.errors[0].message).toBe('step boom');
  });

  it('execute: completes workflow with multiple sequential steps', async () => {
    const engine = new WorkflowEngine();
    const step1 = makeStep({ id: 's1', name: 'S1' });
    const step2 = makeStep({ id: 's2', name: 'S2', dependencies: ['s1'] });
    await engine.registerWorkflow(makeWorkflow({ id: 'wf_seq', steps: [step1, step2] }));
    const exec = await engine.execute('wf_seq', {});
    expect(exec.status).toBe('completed');
    expect(exec.completedSteps).toContain('s1');
    expect(exec.completedSteps).toContain('s2');
  });

  it('getExecution: returns execution by id', async () => {
    const engine = new WorkflowEngine();
    await engine.registerWorkflow(makeWorkflow());
    const exec = await engine.execute('wf1', {});
    const fetched = await engine.getExecution(exec.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(exec.id);
  });

  it('getExecution: returns null if not found', async () => {
    const engine = new WorkflowEngine();
    expect(await engine.getExecution('nope')).toBeNull();
  });

  it('cancelExecution: sets execution to failed', async () => {
    const engine = new WorkflowEngine();
    await engine.registerWorkflow(makeWorkflow());
    const exec = await engine.execute('wf1', {});
    await engine.cancelExecution(exec.id);
    const fetched = await engine.getExecution(exec.id);
    expect(fetched!.status).toBe('failed');
    expect(fetched!.completedAt).toBeInstanceOf(Date);
  });

  it('cancelExecution: throws for nonexistent execution', async () => {
    const engine = new WorkflowEngine();
    await expect(engine.cancelExecution('nope')).rejects.toThrow('Execution not found');
  });
});
