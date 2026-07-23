import { describe, it, expect } from 'vitest';
import { ApprovalEngine } from '../approvals/ApprovalEngine.js';

describe('ApprovalEngine', () => {
  const engine = new ApprovalEngine();

  it('creates ApprovalEngine', () => { expect(engine).toBeDefined(); });

  it('creates approval request', () => {
    const req = engine.createRequest({
      type: 'release', title: 'Release v1.1', description: 'New release',
      requester: 'dev', approvers: ['lead', 'qa'], requiredApprovals: 2, createdAt: new Date(), expiresAt: new Date(Date.now() + 86400000)
    });
    expect(req.title).toBe('Release v1.1');
    expect(req.status).toBe('pending');
  });

  it('approves request', () => {
    const req = engine.createRequest({
      type: 'change', title: 'Test', description: '',
      requester: 'dev', approvers: ['lead'], requiredApprovals: 1, createdAt: new Date(), expiresAt: new Date(Date.now() + 86400000)
    });
    engine.approve(req.id, { approver: 'lead', decision: 'approved', comment: 'LGTM', digitalSignature: 'sig123' });
    expect(engine.getById(req.id)!.status).toBe('approved');
  });

  it('rejects request', () => {
    const req = engine.createRequest({
      type: 'architecture', title: 'Test', description: '',
      requester: 'dev', approvers: ['architect'], requiredApprovals: 1, createdAt: new Date(), expiresAt: new Date(Date.now() + 86400000)
    });
    engine.approve(req.id, { approver: 'architect', decision: 'rejected', comment: 'Needs changes', digitalSignature: 'sig456' });
    expect(engine.getById(req.id)!.status).toBe('rejected');
  });

  it('gets pending requests', () => {
    const pending = engine.getPending();
    expect(Array.isArray(pending)).toBe(true);
  });

  it('gets stats', () => {
    const stats = engine.getStats();
    expect(stats.total).toBeGreaterThan(0);
  });
});
