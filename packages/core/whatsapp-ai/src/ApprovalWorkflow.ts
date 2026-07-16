import { randomUUID } from 'node:crypto';
import type {
  ApprovalWorkflow as IApprovalWorkflow,
  ApprovalRequest,
  ApprovalStatus,
} from './interfaces.js';

export class ApprovalWorkflow implements IApprovalWorkflow {
  private requests: Map<string, ApprovalRequest> = new Map();

  async createRequest(request: Omit<ApprovalRequest, 'id' | 'createdAt' | 'expiresAt' | 'status'>): Promise<ApprovalRequest> {
    const id = randomUUID();
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 60 * 1000);
    const full: ApprovalRequest = {
      ...request, id, createdAt: now, expiresAt: expires, status: 'pendente',
    };
    this.requests.set(id, full);
    return full;
  }

  async approve(requestId: string, notes?: string): Promise<ApprovalRequest> {
    const req = this.requests.get(requestId);
    if (!req) throw new Error(`Request not found: ${requestId}`);
    req.status = 'aprovado';
    req.reviewedAt = new Date();
    req.reviewerNotes = notes;
    return req;
  }

  async reject(requestId: string, notes?: string): Promise<ApprovalRequest> {
    const req = this.requests.get(requestId);
    if (!req) throw new Error(`Request not found: ${requestId}`);
    req.status = 'rejeitado';
    req.reviewedAt = new Date();
    req.reviewerNotes = notes;
    return req;
  }

  getPending(): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter(r => r.status === 'pendente');
  }

  getByConversation(conversationId: string): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter(r => r.conversationId === conversationId);
  }

  getRequest(requestId: string): ApprovalRequest | null {
    return this.requests.get(requestId) ?? null;
  }
}
