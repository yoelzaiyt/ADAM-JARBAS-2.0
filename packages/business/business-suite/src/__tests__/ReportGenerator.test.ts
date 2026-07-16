import { describe, it, expect, beforeEach } from 'vitest';
import { ReportGenerator } from '../report-generator/ReportGenerator.js';

const CID = 'comp-1';

function templateData(overrides = {}) {
  return {
    companyId: CID,
    name: 'Sales Report',
    category: 'sales',
    format: 'pdf' as const,
    dataSource: 'crm.opportunities',
    template: '<h1>Sales</h1>',
    parameters: [
      { name: 'period', type: 'date' as const, label: 'Period', required: true },
    ],
    isActive: true,
    ...overrides,
  };
}

describe('ReportGenerator', () => {
  let rg: ReportGenerator;

  beforeEach(() => {
    rg = new ReportGenerator();
  });

  it('creates and retrieves a template', async () => {
    const t = await rg.createTemplate(templateData());
    expect(t.id).toBeDefined();
    expect(t.name).toBe('Sales Report');
    const found = await rg.getTemplateById(t.id);
    expect(found?.category).toBe('sales');
  });

  it('lists templates with filters', async () => {
    await rg.createTemplate(templateData({ name: 'A', format: 'pdf' }));
    await rg.createTemplate(templateData({ name: 'B', format: 'xlsx', category: 'finance' }));
    const pdfs = await rg.listTemplates(CID, { format: 'pdf' });
    expect(pdfs).toHaveLength(1);
    const finance = await rg.listTemplates(CID, { category: 'finance' });
    expect(finance).toHaveLength(1);
  });

  it('generates a report from a template', async () => {
    const t = await rg.createTemplate(templateData());
    const r = await rg.generateReport(t.id, CID, { period: '2025-01' }, 'admin');
    expect(r.id).toBeDefined();
    expect(r.format).toBe('pdf');
    expect(r.fileUrl).toContain('.pdf');
  });

  it('generates a report with custom format override', async () => {
    const t = await rg.createTemplate(templateData({ format: 'pdf' }));
    const r = await rg.generateReport(t.id, CID, {}, 'admin', 'xlsx');
    expect(r.format).toBe('xlsx');
    expect(r.fileUrl).toContain('.xlsx');
  });

  it('throws when generating from inactive template', async () => {
    const t = await rg.createTemplate(templateData({ isActive: false }));
    await expect(rg.generateReport(t.id, CID, {}, 'admin')).rejects.toThrow('not active');
  });

  it('lists generated reports', async () => {
    const t = await rg.createTemplate(templateData());
    await rg.generateReport(t.id, CID, { period: '1' }, 'admin');
    await rg.generateReport(t.id, CID, { period: '2' }, 'admin');
    const reports = await rg.listReports(CID, { templateId: t.id });
    expect(reports).toHaveLength(2);
  });

  it('updates and deletes templates', async () => {
    const t = await rg.createTemplate(templateData());
    const updated = await rg.updateTemplate(t.id, { name: 'Updated' });
    expect(updated.name).toBe('Updated');
    expect(await rg.deleteTemplate(t.id)).toBe(true);
  });

  it('computes stats', async () => {
    const t = await rg.createTemplate(templateData());
    await rg.generateReport(t.id, CID, {}, 'admin');
    const stats = await rg.getStats(CID);
    expect(stats.totalTemplates).toBe(1);
    expect(stats.totalReports).toBe(1);
    expect(stats.byFormat['pdf']).toBe(1);
  });
});
