import { describe, it, expect, beforeEach } from 'vitest';
import { ApprovalEngine } from '../approval-engine/ApprovalEngine.js';

const CID = 'comp-1';

function requestData(overrides = {}) {
  return {
    companyId: CID,
    type: 'financial' as const,
    title: 'Budget Approval',
    requesterId: 'user-1',
    entityId: 'budget-1',
    entityType: 'budget',
    amount: 50000,
    currency: 'BRL',
    ...overrides,
  };
}

describe('ApprovalEngine', () => {
  let engine: ApprovalEngine;

  beforeEach(() => {
    engine = new ApprovalEngine();
  });

  it('creates and retrieves a request', async () => {
    const r = await engine.createRequest(requestData());
    expect(r.id).toBeDefined();
    expect(r.status).toBe('pending');
    const found = await engine.getRequestById(r.id);
    expect(found?.title).toBe('Budget Approval');
  });

  it('adds steps and approves single-step request', async () => {
    const r = await engine.createRequest(requestData());
    const step = await engine.addStep(r.id, { approverId: 'mgr-1', level: 1 });
    const result = await engine.approveStep(r.id, step.id, 'mgr-1', 'Looks good');
    expect(result.status).toBe('approved');
    expect(result.approvals[0].status).toBe('approved');
  });

  it('rejects a step and marks request rejected', async () => {
    const r = await engine.createRequest(requestData());
    const step = await engine.addStep(r.id, { approverId: 'mgr-1', level: 1 });
    const result = await engine.rejectStep(r.id, step.id, 'mgr-1', 'Over budget');
    expect(result.status).toBe('rejected');
  });

  it('handles multi-level approval flow', async () => {
    const r = await engine.createRequest(requestData({ amount: 200000 }));
    const step1 = await engine.addStep(r.id, { approverId: 'mgr-1', level: 1 });
    const step2 = await engine.addStep(r.id, { approverId: 'dir-1', level: 2 });
    const afterFirst = await engine.approveStep(r.id, step1.id, 'mgr-1');
    expect(afterFirst.status).toBe('pending');
    expect(afterFirst.currentApproverId).toBe('dir-1');
    const afterSecond = await engine.approveStep(r.id, step2.id, 'dir-1');
    expect(afterSecond.status).toBe('approved');
  });

  it('cancels a pending request', async () => {
    const r = await engine.createRequest(requestData());
    await engine.addStep(r.id, { approverId: 'mgr-1', level: 1 });
    const cancelled = await engine.cancelRequest(r.id);
    expect(cancelled.status).toBe('cancelled');
  });

  it('throws when approving already approved request', async () => {
    const r = await engine.createRequest(requestData());
    const step = await engine.addStep(r.id, { approverId: 'mgr-1', level: 1 });
    await engine.approveStep(r.id, step.id, 'mgr-1');
    await expect(engine.approveStep(r.id, step.id, 'mgr-1')).rejects.toThrow('approved');
  });

  it('computes stats', async () => {
    await engine.createRequest(requestData());
    const r2 = await engine.createRequest(requestData({ title: 'Second' }));
    const step = await engine.addStep(r2.id, { approverId: 'mgr-1', level: 1 });
    await engine.approveStep(r2.id, step.id, 'mgr-1');
    const stats = await engine.getStats(CID);
    expect(stats.total).toBe(2);
    expect(stats.pending).toBe(1);
    expect(stats.approved).toBe(1);
  });
});
