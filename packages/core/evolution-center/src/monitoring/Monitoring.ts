import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { MonitoringConfig, HealthStatus, ComponentHealth } from '../interfaces.js';

export class Monitoring {
  private config: MonitoringConfig;
  private healthStatus: HealthStatus | null = null;
  private componentHealth: Map<string, ComponentHealth> = new Map();
  private log = createLogger('Monitoring');

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  checkHealth(): HealthStatus {
    const components = Array.from(this.componentHealth.values());
    const allHealthy = components.every(c => c.status === 'healthy');
    const anyUnhealthy = components.some(c => c.status === 'unhealthy');

    const status: HealthStatus['status'] = anyUnhealthy ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded';
    this.healthStatus = { status, components, timestamp: new Date() };
    return this.healthStatus;
  }

  updateComponentHealth(name: string, health: Omit<ComponentHealth, 'name' | 'lastCheck'>): void {
    this.componentHealth.set(name, { ...health, name, lastCheck: new Date() });
  }

  getHealth(): HealthStatus | null {
    return this.healthStatus;
  }

  getComponentHealth(name: string): ComponentHealth | undefined {
    return this.componentHealth.get(name);
  }

  getAllComponentHealth(): ComponentHealth[] {
    return Array.from(this.componentHealth.values());
  }

  recordMetric(name: string, value: number): void {
    this.log(`Metric: ${name} = ${value}`);
  }

  getProviders(): MonitoringConfig['providers'] {
    return this.config.providers;
  }

  getPrometheusMetrics(): string {
    const lines: string[] = [];
    for (const [name, health] of this.componentHealth) {
      const value = health.status === 'healthy' ? 1 : health.status === 'degraded' ? 0.5 : 0;
      lines.push(`component_health{name="${name}"} ${value}`);
      lines.push(`component_latency{name="${name}"} ${health.latency}`);
      lines.push(`component_error_rate{name="${name}"} ${health.errorRate}`);
    }
    return lines.join('\n');
  }
}
