import type {
  Dashboard,
  DashboardWidget,
  KPI,
  WidgetPosition,
  UserRole,
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

export interface BIConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface KpiSummary {
  total: number;
  onTarget: number;
  offTarget: number;
  averageTrendPercentage: number;
  byCategory: { category: string; count: number; averageValue: number }[];
}

export class BI {
  private logger = new DefaultLogger('bi');
  private dashboards = new Map<string, Dashboard>();
  private kpis = new Map<string, KPI>();
  private config: BIConfig;

  constructor(config?: BIConfig) {
    this.config = config ?? {};
  }

  async createDashboard(data: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt' | 'widgets'>): Promise<Dashboard> {
    const now = new Date();
    const dashboard: Dashboard = { ...data, id: crypto.randomUUID(), widgets: [], createdAt: now, updatedAt: now };
    this.dashboards.set(dashboard.id, dashboard);
    await this.logger.info('Dashboard created', { id: dashboard.id, name: dashboard.name });
    return dashboard;
  }

  async getDashboardById(id: string): Promise<Dashboard | undefined> {
    return this.dashboards.get(id);
  }

  async listDashboards(companyId: string, filters?: { type?: Dashboard['type']; profileRole?: UserRole }): Promise<Dashboard[]> {
    let results = Array.from(this.dashboards.values()).filter(d => d.companyId === companyId);
    if (filters?.type) results = results.filter(d => d.type === filters.type);
    if (filters?.profileRole) results = results.filter(d => d.profileRole === filters.profileRole);
    return results;
  }

  async updateDashboard(id: string, data: Partial<Dashboard>): Promise<Dashboard> {
    const existing = this.dashboards.get(id);
    if (!existing) throw new Error(`Dashboard ${id} not found`);
    const updated: Dashboard = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.dashboards.set(id, updated);
    await this.logger.info('Dashboard updated', { id });
    return updated;
  }

  async deleteDashboard(id: string): Promise<boolean> {
    const deleted = this.dashboards.delete(id);
    if (deleted) await this.logger.info('Dashboard deleted', { id });
    return deleted;
  }

  async addWidget(dashboardId: string, data: Omit<DashboardWidget, 'id'>): Promise<DashboardWidget> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`Dashboard ${dashboardId} not found`);
    const widget: DashboardWidget = { ...data, id: crypto.randomUUID() };
    dashboard.widgets.push(widget);
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);
    await this.logger.info('Widget added', { dashboardId, widgetId: widget.id });
    return widget;
  }

  async updateWidget(dashboardId: string, widgetId: string, data: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`Dashboard ${dashboardId} not found`);
    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) throw new Error(`DashboardWidget ${widgetId} not found`);
    Object.assign(widget, data, { id: widget.id });
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);
    await this.logger.info('Widget updated', { dashboardId, widgetId });
    return widget;
  }

  async removeWidget(dashboardId: string, widgetId: string): Promise<boolean> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`Dashboard ${dashboardId} not found`);
    const idx = dashboard.widgets.findIndex(w => w.id === widgetId);
    if (idx === -1) throw new Error(`DashboardWidget ${widgetId} not found`);
    dashboard.widgets.splice(idx, 1);
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);
    await this.logger.info('Widget removed', { dashboardId, widgetId });
    return true;
  }

  async createKPI(data: Omit<KPI, 'id' | 'createdAt' | 'updatedAt'>): Promise<KPI> {
    const now = new Date();
    const kpi: KPI = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.kpis.set(kpi.id, kpi);
    await this.logger.info('KPI created', { id: kpi.id, name: kpi.name });
    return kpi;
  }

  async getKPIById(id: string): Promise<KPI | undefined> {
    return this.kpis.get(id);
  }

  async listKPIs(companyId: string, filters?: { category?: string }): Promise<KPI[]> {
    let results = Array.from(this.kpis.values()).filter(k => k.companyId === companyId);
    if (filters?.category) results = results.filter(k => k.category === filters.category);
    return results;
  }

  async updateKPI(id: string, data: Partial<KPI>): Promise<KPI> {
    const existing = this.kpis.get(id);
    if (!existing) throw new Error(`KPI ${id} not found`);
    const updated: KPI = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.kpis.set(id, updated);
    await this.logger.info('KPI updated', { id });
    return updated;
  }

  async deleteKPI(id: string): Promise<boolean> {
    const deleted = this.kpis.delete(id);
    if (deleted) await this.logger.info('KPI deleted', { id });
    return deleted;
  }

  async updateKPIValue(id: string, value: number): Promise<KPI> {
    const kpi = this.kpis.get(id);
    if (!kpi) throw new Error(`KPI ${id} not found`);
    const previousValue = kpi.value;
    kpi.value = value;
    if (previousValue !== 0) {
      kpi.trendPercentage = ((value - previousValue) / Math.abs(previousValue)) * 100;
    }
    kpi.trend = value > previousValue ? 'up' : value < previousValue ? 'down' : 'stable';
    kpi.updatedAt = new Date();
    this.kpis.set(id, kpi);
    await this.logger.info('KPI value updated', { id, value });
    return kpi;
  }

  async getKPISummary(companyId: string): Promise<KpiSummary> {
    const all = Array.from(this.kpis.values()).filter(k => k.companyId === companyId);
    const onTarget = all.filter(k => k.target !== undefined && k.value >= k.target).length;
    const offTarget = all.length - onTarget;
    const trendPercentages = all.map(k => Math.abs(k.trendPercentage));
    const categoryMap = new Map<string, { count: number; totalValue: number }>();
    for (const k of all) {
      const entry = categoryMap.get(k.category) ?? { count: 0, totalValue: 0 };
      entry.count += 1;
      entry.totalValue += k.value;
      categoryMap.set(k.category, entry);
    }
    return {
      total: all.length,
      onTarget,
      offTarget,
      averageTrendPercentage: trendPercentages.length > 0 ? trendPercentages.reduce((a, b) => a + b, 0) / trendPercentages.length : 0,
      byCategory: Array.from(categoryMap.entries()).map(([category, { count, totalValue }]) => ({
        category,
        count,
        averageValue: totalValue / count,
      })),
    };
  }
}

export { BI as default };
