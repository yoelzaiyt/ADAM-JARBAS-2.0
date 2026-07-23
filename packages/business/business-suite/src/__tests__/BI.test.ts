import { describe, it, expect, beforeEach } from 'vitest';
import { BI } from '../bi/BI.js';

const CID = 'comp-1';

function dashboardData(overrides = {}) {
  return {
    companyId: CID,
    name: 'Executive Dashboard',
    type: 'executive' as const,
    profileRole: 'admin' as const,
    layout: { columns: 12, rows: 8 },
    isDefault: true,
    ...overrides,
  };
}

function kpiData(overrides = {}) {
  return {
    companyId: CID,
    name: 'Revenue',
    category: 'finance',
    value: 100000,
    target: 120000,
    unit: 'BRL',
    currency: 'BRL',
    trend: 'up' as const,
    trendPercentage: 5.2,
    period: '2025-01',
    dataSource: 'finance.transactions',
    ...overrides,
  };
}

describe('BI', () => {
  let bi: BI;

  beforeEach(() => {
    bi = new BI();
  });

  it('creates and retrieves a dashboard', async () => {
    const d = await bi.createDashboard(dashboardData());
    expect(d.id).toBeDefined();
    expect(d.name).toBe('Executive Dashboard');
    const found = await bi.getDashboardById(d.id);
    expect(found?.name).toBe('Executive Dashboard');
  });

  it('lists dashboards with filters', async () => {
    await bi.createDashboard(dashboardData({ type: 'finance' }));
    await bi.createDashboard(dashboardData({ type: 'crm' }));
    const finance = await bi.listDashboards(CID, { type: 'finance' });
    expect(finance).toHaveLength(1);
  });

  it('updates and deletes a dashboard', async () => {
    const d = await bi.createDashboard(dashboardData());
    const updated = await bi.updateDashboard(d.id, { name: 'Renamed' });
    expect(updated.name).toBe('Renamed');
    expect(await bi.deleteDashboard(d.id)).toBe(true);
    expect(await bi.getDashboardById(d.id)).toBeUndefined();
  });

  it('adds, updates, and removes widgets', async () => {
    const d = await bi.createDashboard(dashboardData());
    const w = await bi.addWidget(d.id, {
      type: 'kpi', title: 'Revenue KPI', dataSource: 'kpi.revenue',
      config: {}, position: { x: 0, y: 0, width: 3, height: 2 },
    });
    expect(w.id).toBeDefined();
    const updated = await bi.updateWidget(d.id, w.id, { title: 'Updated KPI' });
    expect(updated.title).toBe('Updated KPI');
    expect(await bi.removeWidget(d.id, w.id)).toBe(true);
  });

  it('creates and retrieves a KPI', async () => {
    const kpi = await bi.createKPI(kpiData());
    expect(kpi.id).toBeDefined();
    const found = await bi.getKPIById(kpi.id);
    expect(found?.value).toBe(100000);
  });

  it('updates KPI value and computes trend', async () => {
    const kpi = await bi.createKPI(kpiData({ value: 100 }));
    const updated = await bi.updateKPIValue(kpi.id, 120);
    expect(updated.value).toBe(120);
    expect(updated.trend).toBe('up');
    expect(updated.trendPercentage).toBeGreaterThan(0);
  });

  it('computes KPI summary by category', async () => {
    await bi.createKPI(kpiData({ category: 'finance', value: 100, target: 80 }));
    await bi.createKPI(kpiData({ category: 'sales', value: 50, target: 100, name: 'Leads' }));
    const summary = await bi.getKPISummary(CID);
    expect(summary.total).toBe(2);
    expect(summary.onTarget).toBe(1);
    expect(summary.offTarget).toBe(1);
    expect(summary.byCategory).toHaveLength(2);
  });

  it('throws on updating nonexistent dashboard', async () => {
    await expect(bi.updateDashboard('fake-id', { name: 'x' })).rejects.toThrow('not found');
  });
});
