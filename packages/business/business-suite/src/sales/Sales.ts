import type {
  SalesTarget,
  Commission,
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

export interface SalesConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface SalesKPIs {
  totalTarget: number;
  totalAchieved: number;
  achievementRate: number;
  totalCommissions: number;
  paidCommissions: number;
  pendingCommissions: number;
  topPerformers: { salesPersonId: string; totalSales: number; totalCommission: number }[];
}

export class Sales {
  private logger = new DefaultLogger('sales');
  private targets = new Map<string, SalesTarget>();
  private commissions = new Map<string, Commission>();
  private config: SalesConfig;

  constructor(config?: SalesConfig) {
    this.config = config ?? {};
  }

  // ─── Sales Target ─────────────────────────────────────────────────────────

  async createTarget(data: Omit<SalesTarget, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalesTarget> {
    const now = new Date();
    const target: SalesTarget = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.targets.set(target.id, target);
    await this.logger.info('Sales target created', { id: target.id, name: target.name });
    return target;
  }

  async getTargetById(id: string): Promise<SalesTarget | undefined> {
    return this.targets.get(id);
  }

  async listTargets(companyId: string, filters?: { period?: string; assignedTo?: string; teamId?: string }): Promise<SalesTarget[]> {
    let results = Array.from(this.targets.values()).filter(t => t.companyId === companyId);
    if (filters?.period) results = results.filter(t => t.period === filters.period);
    if (filters?.assignedTo) results = results.filter(t => t.assignedTo === filters.assignedTo);
    if (filters?.teamId) results = results.filter(t => t.teamId === filters.teamId);
    return results;
  }

  async updateTarget(id: string, data: Partial<SalesTarget>): Promise<SalesTarget> {
    const existing = this.targets.get(id);
    if (!existing) throw new Error(`SalesTarget ${id} not found`);
    const updated: SalesTarget = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.targets.set(id, updated);
    await this.logger.info('Sales target updated', { id });
    return updated;
  }

  async deleteTarget(id: string): Promise<boolean> {
    const deleted = this.targets.delete(id);
    if (deleted) await this.logger.info('Sales target deleted', { id });
    return deleted;
  }

  async addSaleToTarget(targetId: string, amount: number): Promise<SalesTarget> {
    const target = this.targets.get(targetId);
    if (!target) throw new Error(`SalesTarget ${targetId} not found`);
    target.currentAmount += amount;
    target.updatedAt = new Date();
    this.targets.set(targetId, target);
    await this.logger.info('Sale added to target', { targetId, amount, currentAmount: target.currentAmount });
    return target;
  }

  // ─── Commission ───────────────────────────────────────────────────────────

  async createCommission(data: Omit<Commission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Commission> {
    const now = new Date();
    const comm: Commission = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.commissions.set(comm.id, comm);
    await this.logger.info('Commission created', { id: comm.id, amount: comm.commissionAmount });
    return comm;
  }

  async getCommissionById(id: string): Promise<Commission | undefined> {
    return this.commissions.get(id);
  }

  async listCommissions(companyId: string, filters?: { salesPersonId?: string; period?: string; status?: Commission['status'] }): Promise<Commission[]> {
    let results = Array.from(this.commissions.values()).filter(c => c.companyId === companyId);
    if (filters?.salesPersonId) results = results.filter(c => c.salesPersonId === filters.salesPersonId);
    if (filters?.period) results = results.filter(c => c.period === filters.period);
    if (filters?.status) results = results.filter(c => c.status === filters.status);
    return results;
  }

  async updateCommission(id: string, data: Partial<Commission>): Promise<Commission> {
    const existing = this.commissions.get(id);
    if (!existing) throw new Error(`Commission ${id} not found`);
    const updated: Commission = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.commissions.set(id, updated);
    await this.logger.info('Commission updated', { id });
    return updated;
  }

  async deleteCommission(id: string): Promise<boolean> {
    const deleted = this.commissions.delete(id);
    if (deleted) await this.logger.info('Commission deleted', { id });
    return deleted;
  }

  async approveCommission(id: string): Promise<Commission> {
    const comm = this.commissions.get(id);
    if (!comm) throw new Error(`Commission ${id} not found`);
    if (comm.status !== 'pending') throw new Error(`Commission ${id} is not pending`);
    comm.status = 'approved';
    comm.updatedAt = new Date();
    this.commissions.set(id, comm);
    await this.logger.info('Commission approved', { id });
    return comm;
  }

  async payCommission(id: string): Promise<Commission> {
    const comm = this.commissions.get(id);
    if (!comm) throw new Error(`Commission ${id} not found`);
    if (comm.status !== 'approved') throw new Error(`Commission ${id} is not approved`);
    comm.status = 'paid';
    comm.updatedAt = new Date();
    this.commissions.set(id, comm);
    await this.logger.info('Commission paid', { id });
    return comm;
  }

  // ─── KPIs ─────────────────────────────────────────────────────────────────

  async getSalesKPIs(companyId: string, period?: string): Promise<SalesKPIs> {
    let targets = Array.from(this.targets.values()).filter(t => t.companyId === companyId);
    if (period) targets = targets.filter(t => t.period === period);

    let comms = Array.from(this.commissions.values()).filter(c => c.companyId === companyId);
    if (period) comms = comms.filter(c => c.period === period);

    const totalTarget = targets.reduce((s, t) => s + t.targetAmount, 0);
    const totalAchieved = targets.reduce((s, t) => s + t.currentAmount, 0);
    const achievementRate = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0;
    const totalCommissions = comms.reduce((s, c) => s + c.commissionAmount, 0);
    const paidCommissions = comms.filter(c => c.status === 'paid').reduce((s, c) => s + c.commissionAmount, 0);
    const pendingCommissions = comms.filter(c => c.status === 'pending').reduce((s, c) => s + c.commissionAmount, 0);

    const perfMap = new Map<string, { totalSales: number; totalCommission: number }>();
    for (const c of comms) {
      const entry = perfMap.get(c.salesPersonId) ?? { totalSales: 0, totalCommission: 0 };
      entry.totalSales += c.saleAmount;
      entry.totalCommission += c.commissionAmount;
      perfMap.set(c.salesPersonId, entry);
    }

    const topPerformers = Array.from(perfMap.entries())
      .map(([salesPersonId, v]) => ({ salesPersonId, ...v }))
      .sort((a, b) => b.totalSales - a.totalSales);

    return { totalTarget, totalAchieved, achievementRate, totalCommissions, paidCommissions, pendingCommissions, topPerformers };
  }
}

export { Sales as default };
