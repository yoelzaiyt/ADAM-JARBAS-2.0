import type {
  Contract,
  ContractAlert,
  ContractStatus,
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

export interface ContractsConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface ContractSummary {
  total: number;
  byStatus: { status: ContractStatus; count: number }[];
  byType: { type: string; count: number }[];
  expiringSoon: Contract[];
  pendingAlerts: number;
}

export class Contracts {
  private logger = new DefaultLogger('contracts');
  private contracts = new Map<string, Contract>();
  private config: ContractsConfig;

  constructor(config?: ContractsConfig) {
    this.config = config ?? {};
  }

  // ─── Contract ──────────────────────────────────────────────────────────────

  async createContract(data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'alerts'>): Promise<Contract> {
    const now = new Date();
    const contract: Contract = { ...data, id: crypto.randomUUID(), alerts: [], createdAt: now, updatedAt: now };
    this.contracts.set(contract.id, contract);
    await this.logger.info('Contract created', { id: contract.id, title: contract.title });
    return contract;
  }

  async getContractById(id: string): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async listContracts(companyId: string, filters?: { status?: ContractStatus; type?: Contract['type']; counterparty?: string }): Promise<Contract[]> {
    let results = Array.from(this.contracts.values()).filter(c => c.companyId === companyId);
    if (filters?.status) results = results.filter(c => c.status === filters.status);
    if (filters?.type) results = results.filter(c => c.type === filters.type);
    if (filters?.counterparty) results = results.filter(c => c.counterparty === filters.counterparty);
    return results;
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    const existing = this.contracts.get(id);
    if (!existing) throw new Error(`Contract ${id} not found`);
    const updated: Contract = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.contracts.set(id, updated);
    await this.logger.info('Contract updated', { id });
    return updated;
  }

  async deleteContract(id: string): Promise<boolean> {
    const deleted = this.contracts.delete(id);
    if (deleted) await this.logger.info('Contract deleted', { id });
    return deleted;
  }

  async activateContract(id: string): Promise<Contract> {
    const contract = this.contracts.get(id);
    if (!contract) throw new Error(`Contract ${id} not found`);
    if (contract.status !== 'draft') throw new Error(`Contract ${id} is not a draft`);
    contract.status = 'active';
    contract.updatedAt = new Date();
    this.contracts.set(id, contract);
    await this.logger.info('Contract activated', { id });
    return contract;
  }

  async suspendContract(id: string): Promise<Contract> {
    const contract = this.contracts.get(id);
    if (!contract) throw new Error(`Contract ${id} not found`);
    contract.status = 'suspended';
    contract.updatedAt = new Date();
    this.contracts.set(id, contract);
    await this.logger.info('Contract suspended', { id });
    return contract;
  }

  async terminateContract(id: string): Promise<Contract> {
    const contract = this.contracts.get(id);
    if (!contract) throw new Error(`Contract ${id} not found`);
    contract.status = 'terminated';
    contract.updatedAt = new Date();
    this.contracts.set(id, contract);
    await this.logger.info('Contract terminated', { id });
    return contract;
  }

  async renewContract(id: string, newEndDate: Date): Promise<Contract> {
    const contract = this.contracts.get(id);
    if (!contract) throw new Error(`Contract ${id} not found`);
    contract.endDate = newEndDate;
    contract.status = 'active';
    contract.updatedAt = new Date();
    // Acknowledge renewal alerts
    for (const alert of contract.alerts) {
      if (alert.type === 'renewal' && !alert.acknowledged) alert.acknowledged = true;
    }
    this.contracts.set(id, contract);
    await this.logger.info('Contract renewed', { id, newEndDate });
    return contract;
  }

  async autoRenewContracts(): Promise<Contract[]> {
    const now = new Date();
    const renewed: Contract[] = [];
    for (const contract of this.contracts.values()) {
      if (contract.autoRenew && contract.status === 'active' && contract.renewalDate && contract.renewalDate <= now) {
        const oneYearLater = new Date(contract.endDate ?? now);
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        contract.endDate = oneYearLater;
        contract.renewalDate = new Date(oneYearLater);
        contract.renewalDate.setMonth(contract.renewalDate.getMonth() - 1);
        contract.updatedAt = now;
        this.contracts.set(contract.id, contract);
        renewed.push(contract);
        await this.logger.info('Contract auto-renewed', { id: contract.id });
      }
    }
    return renewed;
  }

  // ─── ContractAlert ─────────────────────────────────────────────────────────

  async addAlert(contractId: string, data: Omit<ContractAlert, 'id' | 'acknowledged'>): Promise<ContractAlert> {
    const contract = this.contracts.get(contractId);
    if (!contract) throw new Error(`Contract ${contractId} not found`);
    const alert: ContractAlert = { ...data, id: crypto.randomUUID(), acknowledged: false };
    contract.alerts.push(alert);
    contract.updatedAt = new Date();
    this.contracts.set(contractId, contract);
    await this.logger.info('Contract alert added', { contractId, alertId: alert.id, type: alert.type });
    return alert;
  }

  async acknowledgeAlert(contractId: string, alertId: string): Promise<ContractAlert> {
    const contract = this.contracts.get(contractId);
    if (!contract) throw new Error(`Contract ${contractId} not found`);
    const alert = contract.alerts.find(a => a.id === alertId);
    if (!alert) throw new Error(`Alert ${alertId} not found in contract ${contractId}`);
    alert.acknowledged = true;
    contract.updatedAt = new Date();
    this.contracts.set(contractId, contract);
    await this.logger.info('Contract alert acknowledged', { contractId, alertId });
    return alert;
  }

  async getExpiringContracts(companyId: string, withinDays: number = 30): Promise<Contract[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return Array.from(this.contracts.values()).filter(
      c => c.companyId === companyId && c.status === 'active' && c.endDate !== undefined && c.endDate <= cutoff
    );
  }

  async getPendingAlerts(companyId: string): Promise<{ contractId: string; alert: ContractAlert }[]> {
    const results: { contractId: string; alert: ContractAlert }[] = [];
    for (const contract of this.contracts.values()) {
      if (contract.companyId === companyId) {
        for (const alert of contract.alerts) {
          if (!alert.acknowledged) results.push({ contractId: contract.id, alert });
        }
      }
    }
    return results;
  }

  async getContractSummary(companyId: string): Promise<ContractSummary> {
    const all = Array.from(this.contracts.values()).filter(c => c.companyId === companyId);
    const statusMap = new Map<ContractStatus, number>();
    for (const c of all) statusMap.set(c.status, (statusMap.get(c.status) ?? 0) + 1);
    const typeMap = new Map<string, number>();
    for (const c of all) typeMap.set(c.type, (typeMap.get(c.type) ?? 0) + 1);

    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    return {
      total: all.length,
      byStatus: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
      byType: Array.from(typeMap.entries()).map(([type, count]) => ({ type, count })),
      expiringSoon: all.filter(c => c.status === 'active' && c.endDate !== undefined && c.endDate <= thirtyDays),
      pendingAlerts: all.reduce((sum, c) => sum + c.alerts.filter(a => !a.acknowledged).length, 0),
    };
  }
}

export { Contracts as default };
