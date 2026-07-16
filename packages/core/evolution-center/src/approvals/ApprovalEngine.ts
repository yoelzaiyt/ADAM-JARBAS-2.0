import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { ApprovalRequest, ApprovalDecision, ApprovalType } from '../interfaces.js';

export class ApprovalEngine {
  private requests: Map<string, ApprovalRequest> = new Map();
  private decisions: Map<string, ApprovalDecision> = new Map();
  private log = createLogger('ApprovalEngine');

  createRequest(request: Omit<ApprovalRequest, 'id' | 'status' | 'currentApprovals' | 'createdAt'>): ApprovalRequest {
    const newReq: ApprovalRequest = {
      ...request,
      id: generateId(),
      status: 'pending',
      requiredApprovals: request.requiredApprovals,
      currentApprovals: 0,
      createdAt: new Date()
    };
    this.requests.set(newReq.id, newReq);
    this.log(`Approval request created: ${newReq.title}`);
    return newReq;
  }

  approve(requestId: string, decision: Omit<ApprovalDecision, 'id' | 'requestId' | 'timestamp'>): ApprovalDecision | null {
    const request = this.requests.get(requestId);
    if (!request || request.status !== 'pending') return null;

    const newDecision: ApprovalDecision = {
      ...decision,
      id: generateId(),
      requestId,
      timestamp: new Date()
    };
    this.decisions.set(newDecision.id, newDecision);

    if (decision.decision === 'approved') {
      request.currentApprovals++;
      if (request.currentApprovals >= request.requiredApprovals) {
        request.status = 'approved';
        request.resolvedAt = new Date();
      }
    } else {
      request.status = 'rejected';
      request.resolvedAt = new Date();
    }

    return newDecision;
  }

  getById(id: string): ApprovalRequest | undefined {
    return this.requests.get(id);
  }

  getAll(): ApprovalRequest[] {
    return Array.from(this.requests.values());
  }

  getPending(): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter(r => r.status === 'pending');
  }

  getByType(type: ApprovalType): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter(r => r.type === type);
  }

  getDecisionsForRequest(requestId: string): ApprovalDecision[] {
    return Array.from(this.decisions.values()).filter(d => d.requestId === requestId);
  }

  getStats(): { total: number; byStatus: Record<string, number>; byType: Record<string, number> } {
    const all = Array.from(this.requests.values());
    return {
      total: all.length,
      byStatus: all.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {} as Record<string, number>),
      byType: all.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {} as Record<string, number>)
    };
  }
}
