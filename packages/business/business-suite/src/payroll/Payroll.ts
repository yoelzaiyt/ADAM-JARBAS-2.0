import type {
  PayrollRecord,
  Benefit,
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

export interface PayrollConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
  overtimeRate?: number;
}

export interface PayrollSummary {
  period: string;
  totalEmployees: number;
  totalBaseSalary: number;
  totalOvertimePay: number;
  totalBonuses: number;
  totalDeductions: number;
  totalNetPay: number;
}

export interface BenefitSummary {
  employeeId: string;
  totalEmployerContribution: number;
  totalEmployeeContribution: number;
  activeBenefits: number;
}

export class Payroll {
  private logger = new DefaultLogger('payroll');
  private records = new Map<string, PayrollRecord>();
  private benefits = new Map<string, Benefit>();
  private config: PayrollConfig;

  constructor(config?: PayrollConfig) {
    this.config = config ?? {};
  }

  // ─── PayrollRecord ─────────────────────────────────────────────────────────

  async createRecord(data: Omit<PayrollRecord, 'id' | 'createdAt' | 'updatedAt' | 'netPay'>): Promise<PayrollRecord> {
    const now = new Date();
    const netPay = data.baseSalary + data.overtimePay + data.bonuses - data.deductions;
    const record: PayrollRecord = { ...data, id: crypto.randomUUID(), netPay, createdAt: now, updatedAt: now };
    this.records.set(record.id, record);
    await this.logger.info('Payroll record created', { id: record.id, employeeId: record.employeeId, netPay });
    return record;
  }

  async getRecordById(id: string): Promise<PayrollRecord | undefined> {
    return this.records.get(id);
  }

  async listRecords(companyId: string, filters?: { employeeId?: string; period?: string; status?: PayrollRecord['status'] }): Promise<PayrollRecord[]> {
    let results = Array.from(this.records.values()).filter(r => r.companyId === companyId);
    if (filters?.employeeId) results = results.filter(r => r.employeeId === filters.employeeId);
    if (filters?.period) results = results.filter(r => r.period === filters.period);
    if (filters?.status) results = results.filter(r => r.status === filters.status);
    return results;
  }

  async updateRecord(id: string, data: Partial<PayrollRecord>): Promise<PayrollRecord> {
    const existing = this.records.get(id);
    if (!existing) throw new Error(`PayrollRecord ${id} not found`);
    const merged = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    merged.netPay = merged.baseSalary + merged.overtimePay + merged.bonuses - merged.deductions;
    this.records.set(id, merged);
    await this.logger.info('Payroll record updated', { id });
    return merged;
  }

  async deleteRecord(id: string): Promise<boolean> {
    const deleted = this.records.delete(id);
    if (deleted) await this.logger.info('Payroll record deleted', { id });
    return deleted;
  }

  async approveRecord(id: string): Promise<PayrollRecord> {
    const record = this.records.get(id);
    if (!record) throw new Error(`PayrollRecord ${id} not found`);
    if (record.status !== 'draft') throw new Error(`PayrollRecord ${id} is not a draft`);
    record.status = 'approved';
    record.updatedAt = new Date();
    this.records.set(id, record);
    await this.logger.info('Payroll record approved', { id });
    return record;
  }

  async payRecord(id: string): Promise<PayrollRecord> {
    const record = this.records.get(id);
    if (!record) throw new Error(`PayrollRecord ${id} not found`);
    if (record.status !== 'approved') throw new Error(`PayrollRecord ${id} is not approved`);
    record.status = 'paid';
    record.updatedAt = new Date();
    this.records.set(id, record);
    await this.logger.info('Payroll record paid', { id });
    return record;
  }

  async calculateOvertime(baseSalary: number, hoursWorked: number, standardHours: number = 220): Promise<{ overtimeHours: number; overtimePay: number }> {
    const overtimeHours = Math.max(0, hoursWorked - standardHours);
    const hourlyRate = baseSalary / standardHours;
    const overtimePay = overtimeHours * hourlyRate * 1.5;
    return { overtimeHours, overtimePay };
  }

  async getPayrollSummary(companyId: string, period: string): Promise<PayrollSummary> {
    const records = Array.from(this.records.values()).filter(r => r.companyId === companyId && r.period === period);
    return {
      period,
      totalEmployees: records.length,
      totalBaseSalary: records.reduce((s, r) => s + r.baseSalary, 0),
      totalOvertimePay: records.reduce((s, r) => s + r.overtimePay, 0),
      totalBonuses: records.reduce((s, r) => s + r.bonuses, 0),
      totalDeductions: records.reduce((s, r) => s + r.deductions, 0),
      totalNetPay: records.reduce((s, r) => s + r.netPay, 0),
    };
  }

  // ─── Benefit ───────────────────────────────────────────────────────────────

  async createBenefit(data: Omit<Benefit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Benefit> {
    const now = new Date();
    const benefit: Benefit = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.benefits.set(benefit.id, benefit);
    await this.logger.info('Benefit created', { id: benefit.id, employeeId: benefit.employeeId, type: benefit.type });
    return benefit;
  }

  async getBenefitById(id: string): Promise<Benefit | undefined> {
    return this.benefits.get(id);
  }

  async listBenefits(companyId: string, filters?: { employeeId?: string; type?: Benefit['type']; isActive?: boolean }): Promise<Benefit[]> {
    let results = Array.from(this.benefits.values()).filter(b => b.companyId === companyId);
    if (filters?.employeeId) results = results.filter(b => b.employeeId === filters.employeeId);
    if (filters?.type) results = results.filter(b => b.type === filters.type);
    if (filters?.isActive !== undefined) results = results.filter(b => b.isActive === filters.isActive);
    return results;
  }

  async updateBenefit(id: string, data: Partial<Benefit>): Promise<Benefit> {
    const existing = this.benefits.get(id);
    if (!existing) throw new Error(`Benefit ${id} not found`);
    const updated: Benefit = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.benefits.set(id, updated);
    await this.logger.info('Benefit updated', { id });
    return updated;
  }

  async deleteBenefit(id: string): Promise<boolean> {
    const deleted = this.benefits.delete(id);
    if (deleted) await this.logger.info('Benefit deleted', { id });
    return deleted;
  }

  async deactivateBenefit(id: string): Promise<Benefit> {
    const benefit = this.benefits.get(id);
    if (!benefit) throw new Error(`Benefit ${id} not found`);
    benefit.isActive = false;
    benefit.endDate = new Date();
    benefit.updatedAt = new Date();
    this.benefits.set(id, benefit);
    await this.logger.info('Benefit deactivated', { id });
    return benefit;
  }

  async getEmployeeBenefitSummary(companyId: string, employeeId: string): Promise<BenefitSummary> {
    const active = Array.from(this.benefits.values()).filter(
      b => b.companyId === companyId && b.employeeId === employeeId && b.isActive
    );
    return {
      employeeId,
      totalEmployerContribution: active.reduce((s, b) => s + b.employerContribution, 0),
      totalEmployeeContribution: active.reduce((s, b) => s + b.employeeContribution, 0),
      activeBenefits: active.length,
    };
  }
}

export { Payroll as default };
