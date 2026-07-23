import type {
  BusinessHealth,
  ModuleHealth,
  BusinessAlert,
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

export interface MonitoringConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export class Monitoring {
  private logger = new DefaultLogger('monitoring');
  private healthRecords = new Map<string, BusinessHealth>();
  private alerts = new Map<string, BusinessAlert>();
  private moduleActivity = new Map<string, { lastActivity?: Date; totalOperations: number; errors: number; totalTimeMs: number }>();
  private config: MonitoringConfig;

  constructor(config?: MonitoringConfig) {
    this.config = config ?? {};
  }

  // ─── Health ───────────────────────────────────────────────────────────────

  async recordOperation(module: string, durationMs: number, success: boolean): Promise<void> {
    const key = module;
    const existing = this.moduleActivity.get(key) ?? { totalOperations: 0, errors: 0, totalTimeMs: 0 };
    existing.totalOperations += 1;
    existing.lastActivity = new Date();
    existing.totalTimeMs += durationMs;
    if (!success) existing.errors += 1;
    this.moduleActivity.set(key, existing);
  }

  async getModuleHealth(module: string): Promise<ModuleHealth> {
    const activity = this.moduleActivity.get(module);
    if (!activity || activity.totalOperations === 0) {
      return {
        module,
        status: 'healthy',
        score: 100,
        errorRate: 0,
        responseTime: 0,
      };
    }
    const errorRate = (activity.errors / activity.totalOperations) * 100;
    const responseTime = activity.totalTimeMs / activity.totalOperations;
    let status: ModuleHealth['status'] = 'healthy';
    let score = 100;
    if (errorRate > 50) { status = 'down'; score = 0; }
    else if (errorRate > 20) { status = 'down'; score = 20; }
    else if (errorRate > 10) { status = 'degraded'; score = 50; }
    else if (errorRate > 5) { status = 'degraded'; score = 75; }

    if (responseTime > 5000) score = Math.max(0, score - 30);
    else if (responseTime > 2000) score = Math.max(0, score - 15);
    else if (responseTime > 1000) score = Math.max(0, score - 5);

    return { module, status, score, lastActivity: activity.lastActivity, errorRate, responseTime };
  }

  async checkHealth(companyId: string, modules: string[]): Promise<BusinessHealth> {
    const moduleHealths: ModuleHealth[] = [];
    for (const mod of modules) {
      moduleHealths.push(await this.getModuleHealth(mod));
    }
    const overallScore = moduleHealths.length > 0
      ? moduleHealths.reduce((sum, m) => sum + m.score, 0) / moduleHealths.length
      : 100;

    const health: BusinessHealth = {
      companyId,
      modules: moduleHealths,
      overallScore,
      alerts: [],
      lastChecked: new Date(),
    };

    for (const mh of moduleHealths) {
      if (mh.status !== 'healthy') {
        const alert = await this.createAlert({
          companyId,
          type: mh.status === 'down' ? 'critical' : 'warning',
          module: mh.module,
          message: `Module ${mh.module} is ${mh.status} (score: ${mh.score}, error rate: ${mh.errorRate.toFixed(1)}%)`,
        });
        health.alerts.push(alert);
      }
    }

    this.healthRecords.set(companyId, health);
    await this.logger.info('Health check completed', { companyId, overallScore, moduleCount: modules.length });
    return health;
  }

  async getLastHealth(companyId: string): Promise<BusinessHealth | undefined> {
    return this.healthRecords.get(companyId);
  }

  // ─── Alerts ───────────────────────────────────────────────────────────────

  async createAlert(data: Omit<BusinessAlert, 'id' | 'createdAt' | 'acknowledged'>): Promise<BusinessAlert> {
    const alert: BusinessAlert = {
      ...data,
      id: crypto.randomUUID(),
      acknowledged: false,
      createdAt: new Date(),
    };
    this.alerts.set(alert.id, alert);
    await this.logger.info('Alert created', { id: alert.id, type: alert.type, module: alert.module });
    return alert;
  }

  async getAlertById(id: string): Promise<BusinessAlert | undefined> {
    return this.alerts.get(id);
  }

  async listAlerts(companyId: string, filters?: { type?: BusinessAlert['type']; module?: string; acknowledged?: boolean }): Promise<BusinessAlert[]> {
    let results = Array.from(this.alerts.values()).filter(a => a.companyId === companyId);
    if (filters?.type) results = results.filter(a => a.type === filters.type);
    if (filters?.module) results = results.filter(a => a.module === filters.module);
    if (filters?.acknowledged !== undefined) results = results.filter(a => a.acknowledged === filters.acknowledged);
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async acknowledgeAlert(id: string): Promise<BusinessAlert> {
    const alert = this.alerts.get(id);
    if (!alert) throw new Error(`BusinessAlert ${id} not found`);
    alert.acknowledged = true;
    this.alerts.set(id, alert);
    await this.logger.info('Alert acknowledged', { id });
    return alert;
  }

  async deleteAlert(id: string): Promise<boolean> {
    const deleted = this.alerts.delete(id);
    if (deleted) await this.logger.info('Alert deleted', { id });
    return deleted;
  }

  async getStats(companyId: string): Promise<{ totalAlerts: number; unacknowledged: number; byType: Record<string, number>; byModule: Record<string, number> }> {
    const all = Array.from(this.alerts.values()).filter(a => a.companyId === companyId);
    const byType: Record<string, number> = {};
    const byModule: Record<string, number> = {};
    for (const a of all) {
      byType[a.type] = (byType[a.type] ?? 0) + 1;
      byModule[a.module] = (byModule[a.module] ?? 0) + 1;
    }
    return {
      totalAlerts: all.length,
      unacknowledged: all.filter(a => !a.acknowledged).length,
      byType,
      byModule,
    };
  }
}

export { Monitoring as default };
