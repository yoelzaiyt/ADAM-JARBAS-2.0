import type {
  LegalProcess,
  LegalOpinion,
  LegalProcessStatus,
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

export interface LegalConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface LegalDashboard {
  totalProcesses: number;
  activeProcesses: number;
  byStatus: { status: LegalProcessStatus; count: number }[];
  byRisk: { risk: string; count: number }[];
  upcomingHearings: LegalProcess[];
  overdueDeadlines: LegalProcess[];
}

export class Legal {
  private logger = new DefaultLogger('legal');
  private processes = new Map<string, LegalProcess>();
  private opinions = new Map<string, LegalOpinion>();
  private config: LegalConfig;

  constructor(config?: LegalConfig) {
    this.config = config ?? {};
  }

  // ─── LegalProcess ──────────────────────────────────────────────────────────

  async createProcess(data: Omit<LegalProcess, 'id' | 'createdAt' | 'updatedAt'>): Promise<LegalProcess> {
    const now = new Date();
    const process: LegalProcess = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.processes.set(process.id, process);
    await this.logger.info('Legal process created', { id: process.id, number: process.number });
    return process;
  }

  async getProcessById(id: string): Promise<LegalProcess | undefined> {
    return this.processes.get(id);
  }

  async listProcesses(companyId: string, filters?: { type?: LegalProcess['type']; status?: LegalProcessStatus; risk?: LegalProcess['risk'] }): Promise<LegalProcess[]> {
    let results = Array.from(this.processes.values()).filter(p => p.companyId === companyId);
    if (filters?.type) results = results.filter(p => p.type === filters.type);
    if (filters?.status) results = results.filter(p => p.status === filters.status);
    if (filters?.risk) results = results.filter(p => p.risk === filters.risk);
    return results;
  }

  async updateProcess(id: string, data: Partial<LegalProcess>): Promise<LegalProcess> {
    const existing = this.processes.get(id);
    if (!existing) throw new Error(`LegalProcess ${id} not found`);
    const updated: LegalProcess = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.processes.set(id, updated);
    await this.logger.info('Legal process updated', { id });
    return updated;
  }

  async deleteProcess(id: string): Promise<boolean> {
    const deleted = this.processes.delete(id);
    if (deleted) await this.logger.info('Legal process deleted', { id });
    return deleted;
  }

  async closeProcess(id: string): Promise<LegalProcess> {
    const process = this.processes.get(id);
    if (!process) throw new Error(`LegalProcess ${id} not found`);
    process.status = 'closed';
    process.updatedAt = new Date();
    this.processes.set(id, process);
    await this.logger.info('Legal process closed', { id });
    return process;
  }

  async suspendProcess(id: string): Promise<LegalProcess> {
    const process = this.processes.get(id);
    if (!process) throw new Error(`LegalProcess ${id} not found`);
    process.status = 'suspended';
    process.updatedAt = new Date();
    this.processes.set(id, process);
    await this.logger.info('Legal process suspended', { id });
    return process;
  }

  async appealProcess(id: string): Promise<LegalProcess> {
    const process = this.processes.get(id);
    if (!process) throw new Error(`LegalProcess ${id} not found`);
    process.status = 'appeal';
    process.updatedAt = new Date();
    this.processes.set(id, process);
    await this.logger.info('Legal process appealed', { id });
    return process;
  }

  async addDocumentToProcess(id: string, documentUrl: string): Promise<LegalProcess> {
    const process = this.processes.get(id);
    if (!process) throw new Error(`LegalProcess ${id} not found`);
    process.documents.push(documentUrl);
    process.updatedAt = new Date();
    this.processes.set(id, process);
    await this.logger.info('Document added to legal process', { id, documentUrl });
    return process;
  }

  async getUpcomingHearings(companyId: string, withinDays: number = 30): Promise<LegalProcess[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return Array.from(this.processes.values()).filter(
      p => p.companyId === companyId && p.status === 'active' && p.nextHearing !== undefined && p.nextHearing <= cutoff
    );
  }

  async getOverdueDeadlines(companyId: string): Promise<LegalProcess[]> {
    const now = new Date();
    return Array.from(this.processes.values()).filter(
      p => p.companyId === companyId && p.status === 'active' && p.deadline !== undefined && p.deadline < now
    );
  }

  async getLegalDashboard(companyId: string): Promise<LegalDashboard> {
    const all = Array.from(this.processes.values()).filter(p => p.companyId === companyId);
    const statusMap = new Map<LegalProcessStatus, number>();
    for (const p of all) statusMap.set(p.status, (statusMap.get(p.status) ?? 0) + 1);
    const riskMap = new Map<string, number>();
    for (const p of all) riskMap.set(p.risk, (riskMap.get(p.risk) ?? 0) + 1);

    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    return {
      totalProcesses: all.length,
      activeProcesses: all.filter(p => p.status === 'active').length,
      byStatus: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
      byRisk: Array.from(riskMap.entries()).map(([risk, count]) => ({ risk, count })),
      upcomingHearings: all.filter(p => p.status === 'active' && p.nextHearing !== undefined && p.nextHearing <= thirtyDays).sort((a, b) => (a.nextHearing!.getTime()) - (b.nextHearing!.getTime())),
      overdueDeadlines: all.filter(p => p.status === 'active' && p.deadline !== undefined && p.deadline < now),
    };
  }

  // ─── LegalOpinion ──────────────────────────────────────────────────────────

  async createOpinion(data: Omit<LegalOpinion, 'id' | 'createdAt' | 'updatedAt'>): Promise<LegalOpinion> {
    const now = new Date();
    const opinion: LegalOpinion = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.opinions.set(opinion.id, opinion);
    await this.logger.info('Legal opinion created', { id: opinion.id, title: opinion.title });
    return opinion;
  }

  async getOpinionById(id: string): Promise<LegalOpinion | undefined> {
    return this.opinions.get(id);
  }

  async listOpinions(companyId: string, filters?: { processId?: string; status?: LegalOpinion['status'] }): Promise<LegalOpinion[]> {
    let results = Array.from(this.opinions.values()).filter(o => o.companyId === companyId);
    if (filters?.processId) results = results.filter(o => o.processId === filters.processId);
    if (filters?.status) results = results.filter(o => o.status === filters.status);
    return results;
  }

  async updateOpinion(id: string, data: Partial<LegalOpinion>): Promise<LegalOpinion> {
    const existing = this.opinions.get(id);
    if (!existing) throw new Error(`LegalOpinion ${id} not found`);
    const updated: LegalOpinion = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.opinions.set(id, updated);
    await this.logger.info('Legal opinion updated', { id });
    return updated;
  }

  async deleteOpinion(id: string): Promise<boolean> {
    const deleted = this.opinions.delete(id);
    if (deleted) await this.logger.info('Legal opinion deleted', { id });
    return deleted;
  }

  async submitOpinion(id: string): Promise<LegalOpinion> {
    const opinion = this.opinions.get(id);
    if (!opinion) throw new Error(`LegalOpinion ${id} not found`);
    if (opinion.status !== 'draft') throw new Error(`Opinion ${id} is not a draft`);
    opinion.status = 'reviewed';
    opinion.updatedAt = new Date();
    this.opinions.set(id, opinion);
    await this.logger.info('Legal opinion submitted for review', { id });
    return opinion;
  }

  async approveOpinion(id: string): Promise<LegalOpinion> {
    const opinion = this.opinions.get(id);
    if (!opinion) throw new Error(`LegalOpinion ${id} not found`);
    if (opinion.status !== 'reviewed') throw new Error(`Opinion ${id} is not reviewed`);
    opinion.status = 'approved';
    opinion.updatedAt = new Date();
    this.opinions.set(id, opinion);
    await this.logger.info('Legal opinion approved', { id });
    return opinion;
  }
}

export { Legal as default };
