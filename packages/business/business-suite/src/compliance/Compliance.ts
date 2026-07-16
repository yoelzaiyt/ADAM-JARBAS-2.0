import type {
  ComplianceRecord,
  AuditRecord,
  AuditFinding,
  ComplianceType,
  ComplianceStatus,
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

export interface ComplianceConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface ComplianceDashboard {
  totalRecords: number;
  compliant: number;
  nonCompliant: number;
  partial: number;
  pendingReview: number;
  byType: { type: ComplianceType; total: number; compliant: number }[];
}

export interface AuditDashboard {
  totalAudits: number;
  passed: number;
  failed: number;
  partial: number;
  openFindings: number;
  criticalFindings: number;
}

export class Compliance {
  private logger = new DefaultLogger('compliance');
  private records = new Map<string, ComplianceRecord>();
  private audits = new Map<string, AuditRecord>();
  private config: ComplianceConfig;

  constructor(config?: ComplianceConfig) {
    this.config = config ?? {};
  }

  // ─── ComplianceRecord ──────────────────────────────────────────────────────

  async createRecord(data: Omit<ComplianceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComplianceRecord> {
    const now = new Date();
    const record: ComplianceRecord = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.records.set(record.id, record);
    await this.logger.info('Compliance record created', { id: record.id, type: record.type, requirement: record.requirement });
    return record;
  }

  async getRecordById(id: string): Promise<ComplianceRecord | undefined> {
    return this.records.get(id);
  }

  async listRecords(companyId: string, filters?: { type?: ComplianceType; status?: ComplianceStatus }): Promise<ComplianceRecord[]> {
    let results = Array.from(this.records.values()).filter(r => r.companyId === companyId);
    if (filters?.type) results = results.filter(r => r.type === filters.type);
    if (filters?.status) results = results.filter(r => r.status === filters.status);
    return results;
  }

  async updateRecord(id: string, data: Partial<ComplianceRecord>): Promise<ComplianceRecord> {
    const existing = this.records.get(id);
    if (!existing) throw new Error(`ComplianceRecord ${id} not found`);
    const updated: ComplianceRecord = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.records.set(id, updated);
    await this.logger.info('Compliance record updated', { id });
    return updated;
  }

  async deleteRecord(id: string): Promise<boolean> {
    const deleted = this.records.delete(id);
    if (deleted) await this.logger.info('Compliance record deleted', { id });
    return deleted;
  }

  async markCompliant(id: string): Promise<ComplianceRecord> {
    const record = this.records.get(id);
    if (!record) throw new Error(`ComplianceRecord ${id} not found`);
    record.status = 'compliant';
    record.lastAuditDate = new Date();
    record.updatedAt = new Date();
    this.records.set(id, record);
    await this.logger.info('Compliance record marked compliant', { id });
    return record;
  }

  async markNonCompliant(id: string): Promise<ComplianceRecord> {
    const record = this.records.get(id);
    if (!record) throw new Error(`ComplianceRecord ${id} not found`);
    record.status = 'non_compliant';
    record.lastAuditDate = new Date();
    record.updatedAt = new Date();
    this.records.set(id, record);
    await this.logger.info('Compliance record marked non-compliant', { id });
    return record;
  }

  async getComplianceDashboard(companyId: string): Promise<ComplianceDashboard> {
    const all = Array.from(this.records.values()).filter(r => r.companyId === companyId);
    const typeMap = new Map<ComplianceType, { total: number; compliant: number }>();
    for (const r of all) {
      const entry = typeMap.get(r.type) ?? { total: 0, compliant: 0 };
      entry.total++;
      if (r.status === 'compliant') entry.compliant++;
      typeMap.set(r.type, entry);
    }
    return {
      totalRecords: all.length,
      compliant: all.filter(r => r.status === 'compliant').length,
      nonCompliant: all.filter(r => r.status === 'non_compliant').length,
      partial: all.filter(r => r.status === 'partial').length,
      pendingReview: all.filter(r => r.status === 'pending_review').length,
      byType: Array.from(typeMap.entries()).map(([type, v]) => ({ type, ...v })),
    };
  }

  // ─── AuditRecord ───────────────────────────────────────────────────────────

  async createAudit(data: Omit<AuditRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AuditRecord> {
    const now = new Date();
    const audit: AuditRecord = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.audits.set(audit.id, audit);
    await this.logger.info('Audit record created', { id: audit.id, title: audit.title });
    return audit;
  }

  async getAuditById(id: string): Promise<AuditRecord | undefined> {
    return this.audits.get(id);
  }

  async listAudits(companyId: string, filters?: { type?: string; overallResult?: AuditRecord['overallResult'] }): Promise<AuditRecord[]> {
    let results = Array.from(this.audits.values()).filter(a => a.companyId === companyId);
    if (filters?.type) results = results.filter(a => a.type === filters.type);
    if (filters?.overallResult) results = results.filter(a => a.overallResult === filters.overallResult);
    return results;
  }

  async updateAudit(id: string, data: Partial<AuditRecord>): Promise<AuditRecord> {
    const existing = this.audits.get(id);
    if (!existing) throw new Error(`AuditRecord ${id} not found`);
    const updated: AuditRecord = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.audits.set(id, updated);
    await this.logger.info('Audit record updated', { id });
    return updated;
  }

  async deleteAudit(id: string): Promise<boolean> {
    const deleted = this.audits.delete(id);
    if (deleted) await this.logger.info('Audit record deleted', { id });
    return deleted;
  }

  async addFinding(auditId: string, data: Omit<AuditFinding, 'id'>): Promise<AuditFinding> {
    const audit = this.audits.get(auditId);
    if (!audit) throw new Error(`AuditRecord ${auditId} not found`);
    const finding: AuditFinding = { ...data, id: crypto.randomUUID() };
    audit.findings.push(finding);
    audit.updatedAt = new Date();
    this.audits.set(auditId, audit);
    await this.logger.info('Audit finding added', { auditId, findingId: finding.id, severity: finding.severity });
    return finding;
  }

  async resolveFinding(auditId: string, findingId: string): Promise<AuditFinding> {
    const audit = this.audits.get(auditId);
    if (!audit) throw new Error(`AuditRecord ${auditId} not found`);
    const finding = audit.findings.find(f => f.id === findingId);
    if (!finding) throw new Error(`Finding ${findingId} not found in audit ${auditId}`);
    finding.status = 'resolved';
    audit.updatedAt = new Date();
    this.audits.set(auditId, audit);
    await this.logger.info('Audit finding resolved', { auditId, findingId });
    return finding;
  }

  async completeAudit(id: string, result: AuditRecord['overallResult']): Promise<AuditRecord> {
    const audit = this.audits.get(id);
    if (!audit) throw new Error(`AuditRecord ${id} not found`);
    audit.overallResult = result;
    audit.endDate = new Date();
    audit.updatedAt = new Date();
    this.audits.set(id, audit);
    await this.logger.info('Audit completed', { id, result });
    return audit;
  }

  async getAuditDashboard(companyId: string): Promise<AuditDashboard> {
    const all = Array.from(this.audits.values()).filter(a => a.companyId === companyId);
    const allFindings = all.flatMap(a => a.findings);
    return {
      totalAudits: all.length,
      passed: all.filter(a => a.overallResult === 'pass').length,
      failed: all.filter(a => a.overallResult === 'fail').length,
      partial: all.filter(a => a.overallResult === 'partial').length,
      openFindings: allFindings.filter(f => f.status === 'open').length,
      criticalFindings: allFindings.filter(f => f.severity === 'critical' && f.status !== 'resolved').length,
    };
  }
}

export { Compliance as default };
