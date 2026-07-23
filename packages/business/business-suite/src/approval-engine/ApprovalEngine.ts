import type {
  ApprovalRequest,
  ApprovalStep,
  ApprovalComment,
  ApprovalType,
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

export interface ApprovalEngineConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export class ApprovalEngine {
  private logger = new DefaultLogger('approval-engine');
  private requests = new Map<string, ApprovalRequest>();
  private config: ApprovalEngineConfig;

  constructor(config?: ApprovalEngineConfig) {
    this.config = config ?? {};
  }

  async createRequest(data: Omit<ApprovalRequest, 'id' | 'createdAt' | 'updatedAt' | 'approvals' | 'comments' | 'status'>): Promise<ApprovalRequest> {
    const now = new Date();
    const request: ApprovalRequest = {
      ...data,
      id: crypto.randomUUID(),
      status: 'pending',
      approvals: [],
      comments: [],
      createdAt: now,
      updatedAt: now,
    };
    this.requests.set(request.id, request);
    await this.logger.info('Approval request created', { id: request.id });
    return request;
  }

  async getRequestById(id: string): Promise<ApprovalRequest | undefined> {
    return this.requests.get(id);
  }

  async listRequests(companyId: string, filters?: { type?: ApprovalType; status?: ApprovalRequest['status']; requesterId?: string }): Promise<ApprovalRequest[]> {
    let results = Array.from(this.requests.values()).filter(r => r.companyId === companyId);
    if (filters?.type) results = results.filter(r => r.type === filters.type);
    if (filters?.status) results = results.filter(r => r.status === filters.status);
    if (filters?.requesterId) results = results.filter(r => r.requesterId === filters.requesterId);
    return results;
  }

  async updateRequest(id: string, data: Partial<ApprovalRequest>): Promise<ApprovalRequest> {
    const existing = this.requests.get(id);
    if (!existing) throw new Error(`ApprovalRequest ${id} not found`);
    if (existing.status === 'approved' || existing.status === 'rejected' || existing.status === 'cancelled') {
      throw new Error(`ApprovalRequest ${id} is already ${existing.status}`);
    }
    const updated: ApprovalRequest = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.requests.set(id, updated);
    await this.logger.info('Approval request updated', { id });
    return updated;
  }

  async deleteRequest(id: string): Promise<boolean> {
    const deleted = this.requests.delete(id);
    if (deleted) await this.logger.info('Approval request deleted', { id });
    return deleted;
  }

  async addStep(requestId: string, data: Omit<ApprovalStep, 'id' | 'status'>): Promise<ApprovalStep> {
    const request = this.requests.get(requestId);
    if (!request) throw new Error(`ApprovalRequest ${requestId} not found`);
    const step: ApprovalStep = { ...data, id: crypto.randomUUID(), status: 'pending' };
    request.approvals.push(step);
    request.approvals.sort((a, b) => a.level - b.level);
    if (!request.currentApproverId && step.level === 1) {
      request.currentApproverId = step.approverId;
    }
    request.updatedAt = new Date();
    this.requests.set(requestId, request);
    await this.logger.info('Approval step added', { requestId, stepId: step.id });
    return step;
  }

  async approveStep(requestId: string, stepId: string, approverId: string, comment?: string): Promise<ApprovalRequest> {
    const request = this.requests.get(requestId);
    if (!request) throw new Error(`ApprovalRequest ${requestId} not found`);
    if (request.status !== 'pending') throw new Error(`ApprovalRequest ${requestId} is ${request.status}`);
    const step = request.approvals.find(s => s.id === stepId);
    if (!step) throw new Error(`ApprovalStep ${stepId} not found`);
    if (step.approverId !== approverId) throw new Error(`User ${approverId} is not the approver for step ${stepId}`);
    if (step.status !== 'pending') throw new Error(`ApprovalStep ${stepId} is ${step.status}`);

    step.status = 'approved';
    step.processedAt = new Date();
    if (comment) step.comment = comment;

    const allApproved = request.approvals.every(s => s.status === 'approved');
    if (allApproved) {
      request.status = 'approved';
      request.currentApproverId = undefined;
    } else {
      const nextStep = request.approvals.find(s => s.status === 'pending');
      request.currentApproverId = nextStep?.approverId;
    }

    request.updatedAt = new Date();
    this.requests.set(requestId, request);
    await this.logger.info('Step approved', { requestId, stepId, approverId });
    return request;
  }

  async rejectStep(requestId: string, stepId: string, approverId: string, comment?: string): Promise<ApprovalRequest> {
    const request = this.requests.get(requestId);
    if (!request) throw new Error(`ApprovalRequest ${requestId} not found`);
    if (request.status !== 'pending') throw new Error(`ApprovalRequest ${requestId} is ${request.status}`);
    const step = request.approvals.find(s => s.id === stepId);
    if (!step) throw new Error(`ApprovalStep ${stepId} not found`);
    if (step.approverId !== approverId) throw new Error(`User ${approverId} is not the approver for step ${stepId}`);
    if (step.status !== 'pending') throw new Error(`ApprovalStep ${stepId} is ${step.status}`);

    step.status = 'rejected';
    step.processedAt = new Date();
    if (comment) step.comment = comment;

    request.status = 'rejected';
    request.currentApproverId = undefined;
    request.updatedAt = new Date();
    this.requests.set(requestId, request);
    await this.logger.info('Step rejected', { requestId, stepId, approverId });
    return request;
  }

  async cancelRequest(requestId: string): Promise<ApprovalRequest> {
    const request = this.requests.get(requestId);
    if (!request) throw new Error(`ApprovalRequest ${requestId} not found`);
    if (request.status !== 'pending') throw new Error(`ApprovalRequest ${requestId} is ${request.status}`);
    request.status = 'cancelled';
    request.currentApproverId = undefined;
    request.updatedAt = new Date();
    this.requests.set(requestId, request);
    await this.logger.info('Request cancelled', { requestId });
    return request;
  }

  async addComment(requestId: string, data: Omit<ApprovalComment, 'id' | 'createdAt'>): Promise<ApprovalComment> {
    const request = this.requests.get(requestId);
    if (!request) throw new Error(`ApprovalRequest ${requestId} not found`);
    const comment: ApprovalComment = { ...data, id: crypto.randomUUID(), createdAt: new Date() };
    request.comments.push(comment);
    request.updatedAt = new Date();
    this.requests.set(requestId, request);
    await this.logger.info('Comment added', { requestId, commentId: comment.id });
    return comment;
  }

  async getStats(companyId: string): Promise<{ total: number; pending: number; approved: number; rejected: number; cancelled: number }> {
    const all = Array.from(this.requests.values()).filter(r => r.companyId === companyId);
    return {
      total: all.length,
      pending: all.filter(r => r.status === 'pending').length,
      approved: all.filter(r => r.status === 'approved').length,
      rejected: all.filter(r => r.status === 'rejected').length,
      cancelled: all.filter(r => r.status === 'cancelled').length,
    };
  }
}

export { ApprovalEngine as default };
