import { describe, it, expect, beforeEach } from 'vitest';
import { ApprovalWorkflow } from '../ApprovalWorkflow.js';

describe('ApprovalWorkflow', () => {
  let wf: ApprovalWorkflow;

  beforeEach(() => { wf = new ApprovalWorkflow(); });

  it('creates workflow', () => { expect(wf).toBeDefined(); });

  it('creates request', async () => {
    const req = await wf.createRequest({
      emailId: 'e1', draftId: 'd1', proposedResponse: 'Hello',
      proposedActions: [],
    });
    expect(req.id).toBeDefined();
    expect(req.status).toBe('pendente');
  });

  it('approve marks approved', async () => {
    const req = await wf.createRequest({ emailId: 'e1', draftId: 'd1', proposedResponse: 'x', proposedActions: [] });
    const approved = await wf.approve(req.id, 'ok');
    expect(approved.status).toBe('aprovado');
  });

  it('reject marks rejected', async () => {
    const req = await wf.createRequest({ emailId: 'e1', draftId: 'd1', proposedResponse: 'x', proposedActions: [] });
    const rejected = await wf.reject(req.id, 'no');
    expect(rejected.status).toBe('rejeitado');
  });

  it('getPending returns pending', async () => {
    await wf.createRequest({ emailId: 'e1', draftId: 'd1', proposedResponse: 'a', proposedActions: [] });
    await wf.createRequest({ emailId: 'e2', draftId: 'd2', proposedResponse: 'b', proposedActions: [] });
    expect(wf.getPending().length).toBe(2);
  });

  it('getRequest returns null for nonexistent', () => {
    expect(wf.getRequest('bad')).toBeNull();
  });
});
