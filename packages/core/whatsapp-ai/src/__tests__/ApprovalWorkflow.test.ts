import { describe, it, expect, beforeEach } from 'vitest';
import { ApprovalWorkflow } from '../ApprovalWorkflow.js';

describe('ApprovalWorkflow', () => {
  let workflow: ApprovalWorkflow;

  beforeEach(() => {
    workflow = new ApprovalWorkflow();
  });

  it('creates request', async () => {
    const req = await workflow.createRequest({
      conversationId: 'conv1', messageId: 'm1',
      proposedResponse: 'Hello there',
    });
    expect(req.id).toBeDefined();
    expect(req.status).toBe('pendente');
    expect(req.createdAt).toBeDefined();
  });

  it('approves request', async () => {
    const req = await workflow.createRequest({
      conversationId: 'conv1', messageId: 'm1',
      proposedResponse: 'text',
    });
    const approved = await workflow.approve(req.id, 'looks good');
    expect(approved.status).toBe('aprovado');
    expect(approved.reviewerNotes).toBe('looks good');
  });

  it('rejects request', async () => {
    const req = await workflow.createRequest({
      conversationId: 'conv1', messageId: 'm1',
      proposedResponse: 'text',
    });
    const rejected = await workflow.reject(req.id, 'nope');
    expect(rejected.status).toBe('rejeitado');
  });

  it('getPending returns pending requests', async () => {
    await workflow.createRequest({ conversationId: 'conv1', messageId: 'm1', proposedResponse: 'a' });
    await workflow.createRequest({ conversationId: 'conv2', messageId: 'm2', proposedResponse: 'b' });
    const first = (await workflow.createRequest({ conversationId: 'conv3', messageId: 'm3', proposedResponse: 'c' }));
    await workflow.approve(first.id);
    expect(workflow.getPending().length).toBe(2);
  });

  it('getByConversation returns matching', async () => {
    await workflow.createRequest({ conversationId: 'conv1', messageId: 'm1', proposedResponse: 'a' });
    await workflow.createRequest({ conversationId: 'conv2', messageId: 'm2', proposedResponse: 'b' });
    expect(workflow.getByConversation('conv1').length).toBe(1);
  });

  it('getRequest returns null for nonexistent', () => {
    expect(workflow.getRequest('bad')).toBeNull();
  });
});
