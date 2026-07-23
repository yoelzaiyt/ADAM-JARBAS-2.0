import type {
  ReportTemplate,
  GeneratedReport,
  ReportFormat,
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

export interface ReportGeneratorConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export class ReportGenerator {
  private logger = new DefaultLogger('report-generator');
  private templates = new Map<string, ReportTemplate>();
  private reports = new Map<string, GeneratedReport>();
  private config: ReportGeneratorConfig;

  constructor(config?: ReportGeneratorConfig) {
    this.config = config ?? {};
  }

  // ─── Templates ────────────────────────────────────────────────────────────

  async createTemplate(data: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate> {
    const now = new Date();
    const template: ReportTemplate = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.templates.set(template.id, template);
    await this.logger.info('Report template created', { id: template.id, name: template.name });
    return template;
  }

  async getTemplateById(id: string): Promise<ReportTemplate | undefined> {
    return this.templates.get(id);
  }

  async listTemplates(companyId: string, filters?: { category?: string; format?: ReportFormat }): Promise<ReportTemplate[]> {
    let results = Array.from(this.templates.values()).filter(t => t.companyId === companyId);
    if (filters?.category) results = results.filter(t => t.category === filters.category);
    if (filters?.format) results = results.filter(t => t.format === filters.format);
    return results;
  }

  async updateTemplate(id: string, data: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const existing = this.templates.get(id);
    if (!existing) throw new Error(`ReportTemplate ${id} not found`);
    const updated: ReportTemplate = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.templates.set(id, updated);
    await this.logger.info('Report template updated', { id });
    return updated;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const deleted = this.templates.delete(id);
    if (deleted) await this.logger.info('Report template deleted', { id });
    return deleted;
  }

  // ─── Generated Reports ────────────────────────────────────────────────────

  async generateReport(templateId: string, companyId: string, parameters: Record<string, unknown>, generatedBy: string, format?: ReportFormat): Promise<GeneratedReport> {
    const template = this.templates.get(templateId);
    if (!template) throw new Error(`ReportTemplate ${templateId} not found`);
    if (!template.isActive) throw new Error(`ReportTemplate ${templateId} is not active`);

    const usedFormat = format ?? template.format;
    const fileUrl = `reports/${companyId}/${templateId}/${crypto.randomUUID()}.${usedFormat}`;
    const now = new Date();

    const report: GeneratedReport = {
      id: crypto.randomUUID(),
      templateId,
      companyId,
      parameters,
      format: usedFormat,
      fileUrl,
      fileSize: Math.floor(Math.random() * 100000) + 1000,
      generatedBy,
      generatedAt: now,
    };
    this.reports.set(report.id, report);
    await this.logger.info('Report generated', { id: report.id, templateId, format: usedFormat });
    return report;
  }

  async getReportById(id: string): Promise<GeneratedReport | undefined> {
    return this.reports.get(id);
  }

  async listReports(companyId: string, filters?: { templateId?: string; format?: ReportFormat; generatedBy?: string }): Promise<GeneratedReport[]> {
    let results = Array.from(this.reports.values()).filter(r => r.companyId === companyId);
    if (filters?.templateId) results = results.filter(r => r.templateId === filters.templateId);
    if (filters?.format) results = results.filter(r => r.format === filters.format);
    if (filters?.generatedBy) results = results.filter(r => r.generatedBy === filters.generatedBy);
    return results.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  async deleteReport(id: string): Promise<boolean> {
    const deleted = this.reports.delete(id);
    if (deleted) await this.logger.info('Generated report deleted', { id });
    return deleted;
  }

  async getStats(companyId: string): Promise<{ totalTemplates: number; totalReports: number; byFormat: Record<string, number> }> {
    const templates = Array.from(this.templates.values()).filter(t => t.companyId === companyId);
    const reports = Array.from(this.reports.values()).filter(r => r.companyId === companyId);
    const byFormat: Record<string, number> = {};
    for (const r of reports) {
      byFormat[r.format] = (byFormat[r.format] ?? 0) + 1;
    }
    return { totalTemplates: templates.length, totalReports: reports.length, byFormat };
  }
}

export { ReportGenerator as default };
