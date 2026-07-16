import type {
  CustomerSuccessRecord,
  OnboardingRecord,
  OnboardingStep,
  CSHealth,
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

export interface CustomerSuccessConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface HealthSummary {
  total: number;
  healthy: number;
  atRisk: number;
  critical: number;
  churned: number;
  averageNps: number;
  averageSatisfaction: number;
}

export class CustomerSuccess {
  private logger = new DefaultLogger('customer-success');
  private records = new Map<string, CustomerSuccessRecord>();
  private onboardings = new Map<string, OnboardingRecord>();
  private config: CustomerSuccessConfig;

  constructor(config?: CustomerSuccessConfig) {
    this.config = config ?? {};
  }

  async createCustomerSuccessRecord(data: Omit<CustomerSuccessRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerSuccessRecord> {
    const now = new Date();
    const record: CustomerSuccessRecord = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.records.set(record.id, record);
    await this.logger.info('Customer success record created', { id: record.id });
    return record;
  }

  async getCustomerSuccessRecordById(id: string): Promise<CustomerSuccessRecord | undefined> {
    return this.records.get(id);
  }

  async listCustomerSuccessRecords(companyId: string, filters?: { health?: CSHealth; assignedTo?: string }): Promise<CustomerSuccessRecord[]> {
    let results = Array.from(this.records.values()).filter(r => r.companyId === companyId);
    if (filters?.health) results = results.filter(r => r.health === filters.health);
    if (filters?.assignedTo) results = results.filter(r => r.assignedTo === filters.assignedTo);
    return results;
  }

  async updateCustomerSuccessRecord(id: string, data: Partial<CustomerSuccessRecord>): Promise<CustomerSuccessRecord> {
    const existing = this.records.get(id);
    if (!existing) throw new Error(`CustomerSuccessRecord ${id} not found`);
    const updated: CustomerSuccessRecord = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.records.set(id, updated);
    await this.logger.info('Customer success record updated', { id });
    return updated;
  }

  async deleteCustomerSuccessRecord(id: string): Promise<boolean> {
    const deleted = this.records.delete(id);
    if (deleted) await this.logger.info('Customer success record deleted', { id });
    return deleted;
  }

  async updateNpsScore(id: string, score: number): Promise<CustomerSuccessRecord> {
    const record = this.records.get(id);
    if (!record) throw new Error(`CustomerSuccessRecord ${id} not found`);
    if (score < 0 || score > 10) throw new Error('NPS score must be between 0 and 10');
    record.npsScore = score;
    record.updatedAt = new Date();
    this.records.set(id, record);
    await this.logger.info('NPS score updated', { id, score });
    return record;
  }

  async updateSatisfactionScore(id: string, score: number): Promise<CustomerSuccessRecord> {
    const record = this.records.get(id);
    if (!record) throw new Error(`CustomerSuccessRecord ${id} not found`);
    if (score < 0 || score > 100) throw new Error('Satisfaction score must be between 0 and 100');
    record.satisfactionScore = score;
    record.updatedAt = new Date();
    this.records.set(id, record);
    await this.logger.info('Satisfaction score updated', { id, score });
    return record;
  }

  async updateHealth(id: string, health: CSHealth): Promise<CustomerSuccessRecord> {
    const record = this.records.get(id);
    if (!record) throw new Error(`CustomerSuccessRecord ${id} not found`);
    record.health = health;
    record.updatedAt = new Date();
    this.records.set(id, record);
    await this.logger.info('Health status updated', { id, health });
    return record;
  }

  async getHealthSummary(companyId: string): Promise<HealthSummary> {
    const all = Array.from(this.records.values()).filter(r => r.companyId === companyId);
    const npsScores = all.filter(r => r.npsScore !== undefined).map(r => r.npsScore!);
    const satScores = all.filter(r => r.satisfactionScore !== undefined).map(r => r.satisfactionScore!);
    return {
      total: all.length,
      healthy: all.filter(r => r.health === 'healthy').length,
      atRisk: all.filter(r => r.health === 'at_risk').length,
      critical: all.filter(r => r.health === 'critical').length,
      churned: all.filter(r => r.health === 'churned').length,
      averageNps: npsScores.length > 0 ? npsScores.reduce((a, b) => a + b, 0) / npsScores.length : 0,
      averageSatisfaction: satScores.length > 0 ? satScores.reduce((a, b) => a + b, 0) / satScores.length : 0,
    };
  }

  async createOnboarding(data: Omit<OnboardingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<OnboardingRecord> {
    const now = new Date();
    const onboarding: OnboardingRecord = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.onboardings.set(onboarding.id, onboarding);
    await this.logger.info('Onboarding created', { id: onboarding.id });
    return onboarding;
  }

  async getOnboardingById(id: string): Promise<OnboardingRecord | undefined> {
    return this.onboardings.get(id);
  }

  async listOnboardings(companyId: string, filters?: { status?: OnboardingRecord['status']; assignedTo?: string }): Promise<OnboardingRecord[]> {
    let results = Array.from(this.onboardings.values()).filter(o => o.companyId === companyId);
    if (filters?.status) results = results.filter(o => o.status === filters.status);
    if (filters?.assignedTo) results = results.filter(o => o.assignedTo === filters.assignedTo);
    return results;
  }

  async updateOnboarding(id: string, data: Partial<OnboardingRecord>): Promise<OnboardingRecord> {
    const existing = this.onboardings.get(id);
    if (!existing) throw new Error(`OnboardingRecord ${id} not found`);
    const updated: OnboardingRecord = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.onboardings.set(id, updated);
    await this.logger.info('Onboarding updated', { id });
    return updated;
  }

  async deleteOnboarding(id: string): Promise<boolean> {
    const deleted = this.onboardings.delete(id);
    if (deleted) await this.logger.info('Onboarding deleted', { id });
    return deleted;
  }

  async startOnboarding(id: string): Promise<OnboardingRecord> {
    const onboarding = this.onboardings.get(id);
    if (!onboarding) throw new Error(`OnboardingRecord ${id} not found`);
    if (onboarding.status !== 'not_started') throw new Error(`Onboarding ${id} already started`);
    onboarding.status = 'in_progress';
    onboarding.startDate = new Date();
    onboarding.updatedAt = new Date();
    this.onboardings.set(id, onboarding);
    await this.logger.info('Onboarding started', { id });
    return onboarding;
  }

  async completeOnboardingStep(onboardingId: string, stepId: string): Promise<OnboardingRecord> {
    const onboarding = this.onboardings.get(onboardingId);
    if (!onboarding) throw new Error(`OnboardingRecord ${onboardingId} not found`);
    const step = onboarding.steps.find(s => s.id === stepId);
    if (!step) throw new Error(`Step ${stepId} not found in onboarding ${onboardingId}`);
    if (step.completed) throw new Error(`Step ${stepId} already completed`);
    step.completed = true;
    step.completedAt = new Date();
    onboarding.currentStep += 1;
    if (onboarding.currentStep >= onboarding.totalSteps) {
      onboarding.status = 'completed';
      onboarding.completedDate = new Date();
    }
    onboarding.updatedAt = new Date();
    this.onboardings.set(onboardingId, onboarding);
    await this.logger.info('Onboarding step completed', { onboardingId, stepId });
    return onboarding;
  }
}

export { CustomerSuccess as default };
