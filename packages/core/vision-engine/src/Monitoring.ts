// ─── Monitoring ──────────────────────────────────────────────────────────────
// System health, uptime, performance tracking

import type {
  VisionHealth,
  VisionError,
  VisionProviderHealth,
} from './interfaces.js';

export class Monitoring {
  private startTime: Date;
  private healthChecks: { timestamp: Date; status: string }[] = [];
  private providerHealth: Map<string, VisionProviderHealth> = new Map();

  constructor() {
    this.startTime = new Date();
  }

  getHealth(): VisionHealth {
    const providers = Array.from(this.providerHealth.entries()).map(([id, health]) => ({
      id,
      status: health.status,
      latencyMs: health.latencyMs,
    }));

    const hasUnhealthy = providers.some(p => p.status === 'unavailable');
    const hasDegraded = providers.some(p => p.status === 'degraded');

    let status: VisionHealth['status'] = 'healthy';
    if (hasUnhealthy) status = 'unavailable';
    else if (hasDegraded) status = 'degraded';

    return {
      status,
      providers,
      uptime: Date.now() - this.startTime.getTime(),
    };
  }

  updateProviderHealth(id: string, health: VisionProviderHealth): void {
    this.providerHealth.set(id, health);
  }

  recordHealthCheck(status: string): void {
    this.healthChecks.push({
      timestamp: new Date(),
      status,
    });

    // Keep only last 100 health checks
    if (this.healthChecks.length > 100) {
      this.healthChecks = this.healthChecks.slice(-100);
    }
  }

  getUptime(): number {
    return Date.now() - this.startTime.getTime();
  }

  getUptimePercentage(): number {
    if (this.healthChecks.length === 0) return 100;

    const healthyChecks = this.healthChecks.filter(h => h.status === 'healthy');
    return (healthyChecks.length / this.healthChecks.length) * 100;
  }

  getRecentHealthChecks(limit?: number): { timestamp: Date; status: string }[] {
    const max = limit || 10;
    return this.healthChecks.slice(-max);
  }

  getAverageLatency(): number {
    const latencies = Array.from(this.providerHealth.values())
      .map(h => h.latencyMs)
      .filter(l => l > 0);

    if (latencies.length === 0) return 0;
    return latencies.reduce((a, b) => a + b, 0) / latencies.length;
  }

  checkProviderAvailability(id: string): boolean {
    const health = this.providerHealth.get(id);
    return health?.status === 'healthy';
  }

  getUnhealthyProviders(): string[] {
    return Array.from(this.providerHealth.entries())
      .filter(([_, health]) => health.status !== 'healthy')
      .map(([id]) => id);
  }

  reset(): void {
    this.startTime = new Date();
    this.healthChecks = [];
    this.providerHealth.clear();
  }
}
