import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { Dashboard, DashboardWidget, DashboardType, DashboardLayout } from '../interfaces.js';

export class DashboardManager {
  private dashboards: Map<string, Dashboard> = new Map();
  private log = createLogger('DashboardManager');

  createDashboard(name: string, type: DashboardType, description: string, layout?: DashboardLayout): Dashboard {
    const dashboard: Dashboard = {
      id: generateId(),
      name,
      type,
      description,
      widgets: [],
      layout: layout || { columns: 12, rows: 8 },
      refreshInterval: 30,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.dashboards.set(dashboard.id, dashboard);
    this.log(`Created dashboard: ${name} [${type}]`);
    return dashboard;
  }

  addWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id'>): DashboardWidget | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;
    const newWidget: DashboardWidget = { ...widget, id: generateId() };
    dashboard.widgets.push(newWidget);
    dashboard.updatedAt = new Date();
    return newWidget;
  }

  removeWidget(dashboardId: string, widgetId: string): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;
    const idx = dashboard.widgets.findIndex(w => w.id === widgetId);
    if (idx === -1) return false;
    dashboard.widgets.splice(idx, 1);
    dashboard.updatedAt = new Date();
    return true;
  }

  getById(id: string): Dashboard | undefined {
    return this.dashboards.get(id);
  }

  getByType(type: DashboardType): Dashboard[] {
    return Array.from(this.dashboards.values()).filter(d => d.type === type);
  }

  getAll(): Dashboard[] {
    return Array.from(this.dashboards.values());
  }

  deleteDashboard(id: string): boolean {
    return this.dashboards.delete(id);
  }

  getDefaultDashboards(): Dashboard[] {
    return [
      this.getOrCreateDefault('CTO Dashboard', 'cto', 'Executive technical metrics'),
      this.getOrCreateDefault('Quality Dashboard', 'quality', 'Code quality and testing metrics'),
      this.getOrCreateDefault('Security Dashboard', 'security', 'Security vulnerabilities and compliance'),
      this.getOrCreateDefault('Infrastructure Dashboard', 'infrastructure', 'System health and performance'),
    ];
  }

  private getOrCreateDefault(name: string, type: DashboardType, description: string): Dashboard {
    const existing = Array.from(this.dashboards.values()).find(d => d.type === type);
    if (existing) return existing;
    return this.createDashboard(name, type, description);
  }
}
