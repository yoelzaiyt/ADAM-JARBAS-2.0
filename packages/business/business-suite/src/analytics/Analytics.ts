import type {
  AnalyticsDashboard,
  AnalyticsModule,
  AnalyticsMetric,
  AnalyticsChart,
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

export interface AnalyticsConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface DashboardStats {
  totalDashboards: number;
  totalModules: number;
  totalMetrics: number;
  totalCharts: number;
  averageMetricsPerModule: number;
}

export class Analytics {
  private logger = new DefaultLogger('analytics');
  private dashboards = new Map<string, AnalyticsDashboard>();
  private config: AnalyticsConfig;

  constructor(config?: AnalyticsConfig) {
    this.config = config ?? {};
  }

  async createDashboard(data: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt' | 'modules'>): Promise<AnalyticsDashboard> {
    const now = new Date();
    const dashboard: AnalyticsDashboard = { ...data, id: crypto.randomUUID(), modules: [], createdAt: now, updatedAt: now };
    this.dashboards.set(dashboard.id, dashboard);
    await this.logger.info('Analytics dashboard created', { id: dashboard.id, name: dashboard.name });
    return dashboard;
  }

  async getDashboardById(id: string): Promise<AnalyticsDashboard | undefined> {
    return this.dashboards.get(id);
  }

  async listDashboards(companyId: string): Promise<AnalyticsDashboard[]> {
    return Array.from(this.dashboards.values()).filter(d => d.companyId === companyId);
  }

  async updateDashboard(id: string, data: Partial<AnalyticsDashboard>): Promise<AnalyticsDashboard> {
    const existing = this.dashboards.get(id);
    if (!existing) throw new Error(`AnalyticsDashboard ${id} not found`);
    const updated: AnalyticsDashboard = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.dashboards.set(id, updated);
    await this.logger.info('Analytics dashboard updated', { id });
    return updated;
  }

  async deleteDashboard(id: string): Promise<boolean> {
    const deleted = this.dashboards.delete(id);
    if (deleted) await this.logger.info('Analytics dashboard deleted', { id });
    return deleted;
  }

  async addModule(dashboardId: string, name: string): Promise<AnalyticsModule> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`AnalyticsDashboard ${dashboardId} not found`);
    const module_: AnalyticsModule = { id: crypto.randomUUID(), name, metrics: [], charts: [] };
    dashboard.modules.push(module_);
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);
    await this.logger.info('Module added', { dashboardId, moduleId: module_.id });
    return module_;
  }

  async updateModule(dashboardId: string, moduleId: string, data: Partial<AnalyticsModule>): Promise<AnalyticsModule> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`AnalyticsDashboard ${dashboardId} not found`);
    const module_ = dashboard.modules.find(m => m.id === moduleId);
    if (!module_) throw new Error(`AnalyticsModule ${moduleId} not found`);
    Object.assign(module_, data, { id: module_.id });
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);
    await this.logger.info('Module updated', { dashboardId, moduleId });
    return module_;
  }

  async removeModule(dashboardId: string, moduleId: string): Promise<boolean> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`AnalyticsDashboard ${dashboardId} not found`);
    const idx = dashboard.modules.findIndex(m => m.id === moduleId);
    if (idx === -1) throw new Error(`AnalyticsModule ${moduleId} not found`);
    dashboard.modules.splice(idx, 1);
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);
    await this.logger.info('Module removed', { dashboardId, moduleId });
    return true;
  }

  async addMetric(dashboardId: string, moduleId: string, data: Omit<AnalyticsMetric, 'id'>): Promise<AnalyticsMetric> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`AnalyticsDashboard ${dashboardId} not found`);
    const module_ = dashboard.modules.find(m => m.id === moduleId);
    if (!module_) throw new Error(`AnalyticsModule ${moduleId} not found`);
    const metric: AnalyticsMetric = { ...data, id: crypto.randomUUID() };
    module_.metrics.push(metric);
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);
    await this.logger.info('Metric added', { dashboardId, moduleId, metricId: metric.id });
    return metric;
  }

  async updateMetric(dashboardId: string, moduleId: string, metricId: string, data: Partial<AnalyticsMetric>): Promise<AnalyticsMetric> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`AnalyticsDashboard ${dashboardId} not found`);
    const module_ = dashboard.modules.find(m => m.id === moduleId);
    if (!module_) throw new Error(`AnalyticsModule ${moduleId} not found`);
    const metric = module_.metrics.find(m => m.id === metricId);
    if (!metric) throw new Error(`AnalyticsMetric ${metricId} not found`);
    Object.assign(metric, data, { id: metric.id });
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);
    await this.logger.info('Metric updated', { dashboardId, moduleId, metricId });
    return metric;
  }

  async removeMetric(dashboardId: string, moduleId: string, metricId: string): Promise<boolean> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`AnalyticsDashboard ${dashboardId} not found`);
    const module_ = dashboard.modules.find(m => m.id === moduleId);
    if (!module_) throw new Error(`AnalyticsModule ${moduleId} not found`);
    const idx = module_.metrics.findIndex(m => m.id === metricId);
    if (idx === -1) throw new Error(`AnalyticsMetric ${metricId} not found`);
    module_.metrics.splice(idx, 1);
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);
    await this.logger.info('Metric removed', { dashboardId, moduleId, metricId });
    return true;
  }

  async addChart(dashboardId: string, moduleId: string, data: Omit<AnalyticsChart, 'id'>): Promise<AnalyticsChart> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`AnalyticsDashboard ${dashboardId} not found`);
    const module_ = dashboard.modules.find(m => m.id === moduleId);
    if (!module_) throw new Error(`AnalyticsModule ${moduleId} not found`);
    const chart: AnalyticsChart = { ...data, id: crypto.randomUUID() };
    module_.charts.push(chart);
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);
    await this.logger.info('Chart added', { dashboardId, moduleId, chartId: chart.id });
    return chart;
  }

  async updateChart(dashboardId: string, moduleId: string, chartId: string, data: Partial<AnalyticsChart>): Promise<AnalyticsChart> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`AnalyticsDashboard ${dashboardId} not found`);
    const module_ = dashboard.modules.find(m => m.id === moduleId);
    if (!module_) throw new Error(`AnalyticsModule ${moduleId} not found`);
    const chart = module_.charts.find(c => c.id === chartId);
    if (!chart) throw new Error(`AnalyticsChart ${chartId} not found`);
    Object.assign(chart, data, { id: chart.id });
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);
    await this.logger.info('Chart updated', { dashboardId, moduleId, chartId });
    return chart;
  }

  async removeChart(dashboardId: string, moduleId: string, chartId: string): Promise<boolean> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`AnalyticsDashboard ${dashboardId} not found`);
    const module_ = dashboard.modules.find(m => m.id === moduleId);
    if (!module_) throw new Error(`AnalyticsModule ${moduleId} not found`);
    const idx = module_.charts.findIndex(c => c.id === chartId);
    if (idx === -1) throw new Error(`AnalyticsChart ${chartId} not found`);
    module_.charts.splice(idx, 1);
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);
    await this.logger.info('Chart removed', { dashboardId, moduleId, chartId });
    return true;
  }

  async getDashboardStats(companyId: string): Promise<DashboardStats> {
    const dashboards = Array.from(this.dashboards.values()).filter(d => d.companyId === companyId);
    let totalModules = 0;
    let totalMetrics = 0;
    let totalCharts = 0;
    for (const d of dashboards) {
      totalModules += d.modules.length;
      for (const m of d.modules) {
        totalMetrics += m.metrics.length;
        totalCharts += m.charts.length;
      }
    }
    return {
      totalDashboards: dashboards.length,
      totalModules,
      totalMetrics,
      totalCharts,
      averageMetricsPerModule: totalModules > 0 ? totalMetrics / totalModules : 0,
    };
  }
}

export { Analytics as default };
