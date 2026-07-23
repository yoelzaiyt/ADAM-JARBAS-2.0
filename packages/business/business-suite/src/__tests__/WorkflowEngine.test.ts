import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowEngine } from '../workflow-engine/WorkflowEngine.js';

const CID = 'comp-1';

function workflowData(overrides = {}) {
  return {
    companyId: CID,
    name: 'Approval Flow',
    triggerType: 'manual' as const,
    triggerConfig: {},
    isActive: true,
    createdBy: 'user-1',
    ...overrides,
  };
}

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  it('creates and retrieves a workflow', async () => {
    const w = await engine.createWorkflow(workflowData());
    expect(w.id).toBeDefined();
    expect(w.executionCount).toBe(0);
    const found = await engine.getWorkflowById(w.id);
    expect(found?.name).toBe('Approval Flow');
  });

  it('lists workflows with filters', async () => {
    await engine.createWorkflow(workflowData({ triggerType: 'event' }));
    await engine.createWorkflow(workflowData({ triggerType: 'schedule', isActive: false }));
    const active = await engine.listWorkflows(CID, { isActive: true });
    expect(active).toHaveLength(1);
    const event = await engine.listWorkflows(CID, { triggerType: 'event' });
    expect(event).toHaveLength(1);
  });

  it('adds steps and executes a workflow', async () => {
    const w = await engine.createWorkflow(workflowData());
    await engine.addStep(w.id, { name: 'Validate', type: 'condition', config: {}, order: 1 });
    await engine.addStep(w.id, { name: 'Notify', type: 'notification', config: {}, order: 2 });
    const exec = await engine.executeWorkflow(w.id, { orderId: '123' });
    expect(exec.status).toBe('completed');
    expect(exec.steps).toHaveLength(2);
    expect(exec.steps[0].status).toBe('completed');
    const updated = await engine.getWorkflowById(w.id);
    expect(updated?.executionCount).toBe(1);
  });

  it('rejects execution of inactive workflow', async () => {
    const w = await engine.createWorkflow(workflowData({ isActive: false }));
    await engine.addStep(w.id, { name: 'S1', type: 'action', config: {}, order: 1 });
    await expect(engine.executeWorkflow(w.id)).rejects.toThrow('not active');
  });

  it('toggles workflow active state', async () => {
    const w = await engine.createWorkflow(workflowData({ isActive: true }));
    const toggled = await engine.toggleWorkflow(w.id, false);
    expect(toggled.isActive).toBe(false);
  });

  it('updates and deletes workflow', async () => {
    const w = await engine.createWorkflow(workflowData());
    const updated = await engine.updateWorkflow(w.id, { name: 'Updated Flow' });
    expect(updated.name).toBe('Updated Flow');
    expect(await engine.deleteWorkflow(w.id)).toBe(true);
    expect(await engine.getWorkflowById(w.id)).toBeUndefined();
  });

  it('computes workflow stats', async () => {
    const w = await engine.createWorkflow(workflowData());
    await engine.addStep(w.id, { name: 'S1', type: 'action', config: {}, order: 1 });
    await engine.executeWorkflow(w.id);
    const stats = await engine.getWorkflowStats(CID);
    expect(stats.totalWorkflows).toBe(1);
    expect(stats.activeWorkflows).toBe(1);
    expect(stats.totalExecutions).toBe(1);
    expect(stats.completedExecutions).toBe(1);
  });
});
