import { describe, it, expect, beforeEach } from 'vitest';
import { Analytics } from '../analytics/Analytics.js';

const CID = 'comp-1';

describe('Analytics', () => {
  let analytics: Analytics;

  beforeEach(() => {
    analytics = new Analytics();
  });

  it('creates and retrieves a dashboard', async () => {
    const d = await analytics.createDashboard({ companyId: CID, name: 'Sales Analytics', refreshInterval: 60 });
    expect(d.id).toBeDefined();
    const found = await analytics.getDashboardById(d.id);
    expect(found?.name).toBe('Sales Analytics');
  });

  it('lists dashboards by company', async () => {
    await analytics.createDashboard({ companyId: CID, name: 'D1', refreshInterval: 30 });
    await analytics.createDashboard({ companyId: CID, name: 'D2', refreshInterval: 60 });
    await analytics.createDashboard({ companyId: 'other', name: 'Other', refreshInterval: 30 });
    expect(await analytics.listDashboards(CID)).toHaveLength(2);
  });

  it('adds modules to a dashboard', async () => {
    const d = await analytics.createDashboard({ companyId: CID, name: 'Dash', refreshInterval: 30 });
    const m = await analytics.addModule(d.id, 'Revenue');
    expect(m.name).toBe('Revenue');
    const found = await analytics.getDashboardById(d.id);
    expect(found?.modules).toHaveLength(1);
  });

  it('adds metrics and charts to a module', async () => {
    const d = await analytics.createDashboard({ companyId: CID, name: 'Dash', refreshInterval: 30 });
    const m = await analytics.addModule(d.id, 'Sales');
    const metric = await analytics.addMetric(d.id, m.id, { name: 'MRR', value: 50000, unit: 'BRL' });
    expect(metric.id).toBeDefined();
    const chart = await analytics.addChart(d.id, m.id, { type: 'line', title: 'Revenue Trend', data: [{ month: 'Jan', value: 1000 }] });
    expect(chart.type).toBe('line');
  });

  it('updates and removes metrics', async () => {
    const d = await analytics.createDashboard({ companyId: CID, name: 'Dash', refreshInterval: 30 });
    const m = await analytics.addModule(d.id, 'Mod');
    const metric = await analytics.addMetric(d.id, m.id, { name: 'M1', value: 10, unit: 'count' });
    const updated = await analytics.updateMetric(d.id, m.id, metric.id, { value: 20 });
    expect(updated.value).toBe(20);
    expect(await analytics.removeMetric(d.id, m.id, metric.id)).toBe(true);
  });

  it('computes dashboard stats', async () => {
    const d = await analytics.createDashboard({ companyId: CID, name: 'Dash', refreshInterval: 30 });
    const m = await analytics.addModule(d.id, 'M');
    await analytics.addMetric(d.id, m.id, { name: 'A', value: 1, unit: 'x' });
    await analytics.addMetric(d.id, m.id, { name: 'B', value: 2, unit: 'y' });
    const stats = await analytics.getDashboardStats(CID);
    expect(stats.totalDashboards).toBe(1);
    expect(stats.totalModules).toBe(1);
    expect(stats.totalMetrics).toBe(2);
    expect(stats.averageMetricsPerModule).toBe(2);
  });

  it('updates and deletes dashboards', async () => {
    const d = await analytics.createDashboard({ companyId: CID, name: 'Dash', refreshInterval: 30 });
    const updated = await analytics.updateDashboard(d.id, { name: 'Updated' });
    expect(updated.name).toBe('Updated');
    expect(await analytics.deleteDashboard(d.id)).toBe(true);
  });

  it('throws on missing entity', async () => {
    await expect(analytics.updateDashboard('fake', {})).rejects.toThrow('not found');
  });
});
