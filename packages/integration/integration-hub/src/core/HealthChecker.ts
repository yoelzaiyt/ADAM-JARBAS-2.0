import type { HealthCheckResult, HealthCheckConfig, HealthStatus } from '../interfaces.js';
import { createLogger } from '../Logger.js';

const log = createLogger({ module: 'HealthChecker' });

export class HealthChecker {
  private results: Map<string, HealthCheckResult[]> = new Map();
  private config: HealthCheckConfig;
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map();

  constructor(config: HealthCheckConfig) {
    this.config = config;
  }

  async check(baseUrl: string, apiId: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let status: HealthStatus = 'unknown';
    let statusCode = 0;
    let error: string | undefined;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(baseUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'JARBAS-IntegrationHub/1.0' },
      });

      clearTimeout(timeoutId);
      statusCode = response.status;
      status = response.ok ? 'healthy' : 'degraded';
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      status = 'down';
    }

    const latency = Date.now() - startTime;
    const result: HealthCheckResult = {
      apiId,
      status,
      latency,
      statusCode,
      error,
      timestamp: new Date(),
      uptime: this.calculateUptime(apiId),
    };

    this.storeResult(apiId, result);
    return result;
  }

  private storeResult(apiId: string, result: HealthCheckResult): void {
    const results = this.results.get(apiId) || [];
    results.push(result);
    if (results.length > 100) results.shift();
    this.results.set(apiId, results);
  }

  private calculateUptime(apiId: string): number {
    const results = this.results.get(apiId);
    if (!results || results.length === 0) return 100;

    const healthyCount = results.filter(r => r.status === 'healthy').length;
    return (healthyCount / results.length) * 100;
  }

  getLatestResult(apiId: string): HealthCheckResult | undefined {
    const results = this.results.get(apiId);
    return results?.[results.length - 1];
  }

  getResults(apiId: string, limit: number = 10): HealthCheckResult[] {
    const results = this.results.get(apiId) || [];
    return results.slice(-limit);
  }

  getOverallStatus(apiId: string): HealthStatus {
    const latest = this.getLatestResult(apiId);
    return latest?.status || 'unknown';
  }

  startMonitoring(apiId: string, baseUrl: string): void {
    if (this.timers.has(apiId)) return;

    const timer = setInterval(async () => {
      await this.check(baseUrl, apiId);
    }, this.config.interval);

    this.timers.set(apiId, timer);
    log.info(`Health monitoring started for API ${apiId}`);
  }

  stopMonitoring(apiId: string): void {
    const timer = this.timers.get(apiId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(apiId);
      log.info(`Health monitoring stopped for API ${apiId}`);
    }
  }

  stopAll(): void {
    for (const [apiId] of this.timers) {
      this.stopMonitoring(apiId);
    }
  }

  getStats(): {
    monitored: number;
    healthy: number;
    degraded: number;
    down: number;
    avgLatency: number;
  } {
    let healthy = 0;
    let degraded = 0;
    let down = 0;
    let totalLatency = 0;
    let count = 0;

    for (const [apiId] of this.results) {
      const status = this.getOverallStatus(apiId);
      if (status === 'healthy') healthy++;
      else if (status === 'degraded') degraded++;
      else if (status === 'down') down++;

      const latest = this.getLatestResult(apiId);
      if (latest) {
        totalLatency += latest.latency;
        count++;
      }
    }

    return {
      monitored: this.timers.size,
      healthy,
      degraded,
      down,
      avgLatency: count > 0 ? totalLatency / count : 0,
    };
  }
}
