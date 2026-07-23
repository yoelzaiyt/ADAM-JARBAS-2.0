import type {
  IntegrationHubConfig,
  ApiEndpoint,
  DiscoveryQuery,
  DiscoveryResult,
  ApiComparison,
  ReplacementSuggestion,
  GeneratedSdk,
  SdkConfig,
  HealthCheckResult,
  ApiMetrics,
  MonitoringAlert,
} from './interfaces.js';
import { ApiRegistry } from './core/ApiRegistry.js';
import { TokenManager } from './core/TokenManager.js';
import { OAuthManager } from './core/OAuthManager.js';
import { HealthChecker } from './core/HealthChecker.js';
import { RateLimiter } from './core/RateLimiter.js';
import { CacheManager } from './core/CacheManager.js';
import { RetryManager } from './core/RetryManager.js';
import { FailoverManager } from './core/FailoverManager.js';
import { ApiIntelligence } from './intelligence/ApiIntelligence.js';
import { SdkGenerator } from './intelligence/SdkGenerator.js';
import { DatabaseSchema } from './database/DatabaseSchema.js';
import { ALL_CATALOG_APIS } from './api-catalog/catalog.js';
import { createLogger } from './Logger.js';
import { generateId } from '@jarbas/utils';

const log = createLogger({ module: 'IntegrationHub' });

export class IntegrationHub {
  readonly registry: ApiRegistry;
  readonly tokenManager: TokenManager;
  readonly oauthManager: OAuthManager;
  readonly healthChecker: HealthChecker;
  readonly rateLimiter: RateLimiter;
  readonly cache: CacheManager;
  readonly retry: RetryManager;
  readonly failover: FailoverManager;
  readonly intelligence: ApiIntelligence;
  readonly sdkGenerator: SdkGenerator;
  readonly database: DatabaseSchema;
  readonly config: IntegrationHubConfig;

  private metrics: Map<string, ApiMetrics> = new Map();
  private alerts: MonitoringAlert[] = [];

  constructor(config: IntegrationHubConfig) {
    this.config = config;
    this.registry = new ApiRegistry();
    this.tokenManager = new TokenManager(config.tokenManager);
    this.oauthManager = new OAuthManager();
    this.healthChecker = new HealthChecker(config.healthCheck);
    this.rateLimiter = new RateLimiter(config.rateLimiter);
    this.cache = new CacheManager(config.cache);
    this.retry = new RetryManager(config.retry);
    this.failover = new FailoverManager(config.failover);
    this.intelligence = new ApiIntelligence(this.registry);
    this.sdkGenerator = new SdkGenerator();
    this.database = new DatabaseSchema(config.database);

    this.loadCatalog();
    log.info('Integration Hub initialized', { apis: this.registry.list().length });
  }

  private loadCatalog(): void {
    for (const apiData of ALL_CATALOG_APIS) {
      this.registry.register(apiData);
    }
    log.info(`Loaded ${ALL_CATALOG_APIS.length} APIs from catalog`);
  }

  async discover(query: DiscoveryQuery): Promise<DiscoveryResult> {
    const cacheKey = `discover:${JSON.stringify(query)}`;
    const cached = this.cache.get<DiscoveryResult>(cacheKey);
    if (cached) return cached;

    const result = this.intelligence.discover(query);
    this.cache.set(cacheKey, result, 300);
    return result;
  }

  async compareApis(apiIdA: string, apiIdB: string): Promise<ApiComparison | undefined> {
    return this.intelligence.compare(apiIdA, apiIdB);
  }

  async findReplacements(apiId: string): Promise<ReplacementSuggestion[]> {
    return this.intelligence.findReplacements(apiId);
  }

  async generateSdk(apiId: string, config: SdkConfig): Promise<GeneratedSdk | undefined> {
    const api = this.registry.get(apiId);
    if (!api) return undefined;
    return this.sdkGenerator.generate(api, config);
  }

  async makeRequest<T = unknown>(
    apiId: string,
    path: string,
    options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}
  ): Promise<{ success: boolean; data?: T; error?: string; latency: number }> {
    const api = this.registry.get(apiId);
    if (!api) return { success: false, error: 'API not found', latency: 0 };

    if (this.failover.shouldFailover(apiId)) {
      return { success: false, error: 'API is in failover mode', latency: 0 };
    }

    if (!this.rateLimiter.canProceed(apiId)) {
      const retryAfter = this.rateLimiter.getRetryAfterMs(apiId);
      return { success: false, error: `Rate limited. Retry after ${retryAfter}ms`, latency: 0 };
    }

    const result = await this.retry.execute(async () => {
      this.rateLimiter.consume(apiId);

      const startTime = Date.now();
      const token = this.tokenManager.getTokenByApi(apiId);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token.key}`;
        this.tokenManager.markUsed(token.id);
      }

      const response = await fetch(`${api.baseUrl}${path}`, {
        method: (options.method || 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json() as T;
    }, { apiId, operation: path });

    if (result.success) {
      this.failover.recordSuccess(apiId);
      this.recordMetrics(apiId, true, result.totalDuration);
    } else {
      this.failover.recordFailure(apiId);
      this.recordMetrics(apiId, false, result.totalDuration);
      this.checkAlerts(apiId, result.error);
    }

    return {
      success: result.success,
      data: result.data,
      error: result.error,
      latency: result.totalDuration,
    };
  }

  private recordMetrics(apiId: string, success: boolean, latency: number): void {
    let metrics = this.metrics.get(apiId);
    if (!metrics) {
      metrics = {
        apiId,
        totalRequests: 0,
        successRate: 100,
        avgLatency: 0,
        errorRate: 0,
        lastChecked: new Date(),
        period: 'current',
      };
      this.metrics.set(apiId, metrics);
    }

    metrics.totalRequests++;
    metrics.avgLatency = (metrics.avgLatency * (metrics.totalRequests - 1) + latency) / metrics.totalRequests;
    metrics.successRate = success
      ? (metrics.successRate * (metrics.totalRequests - 1) + 100) / metrics.totalRequests
      : (metrics.successRate * (metrics.totalRequests - 1)) / metrics.totalRequests;
    metrics.errorRate = 100 - metrics.successRate;
    metrics.lastChecked = new Date();
  }

  private checkAlerts(apiId: string, error?: string): void {
    const metrics = this.metrics.get(apiId);
    if (!metrics) return;

    if (metrics.errorRate > 50) {
      this.addAlert(apiId, 'high-error-rate', 'critical', `Error rate exceeded 50% for API ${apiId}`);
    }
    if (metrics.avgLatency > 5000) {
      this.addAlert(apiId, 'slow-response', 'high', `Average latency exceeded 5s for API ${apiId}`);
    }
  }

  private addAlert(apiId: string, type: MonitoringAlert['type'], severity: MonitoringAlert['severity'], message: string): void {
    const alert: MonitoringAlert = {
      id: generateId(),
      apiId,
      type,
      severity,
      message,
      timestamp: new Date(),
      resolved: false,
    };
    this.alerts.push(alert);
    log.warn(`Alert created`, { apiId, type, severity, message });
  }

  getMetrics(apiId: string): ApiMetrics | undefined {
    return this.metrics.get(apiId);
  }

  getAlerts(resolved: boolean = false): MonitoringAlert[] {
    return this.alerts.filter(a => a.resolved === resolved);
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  getStats(): {
    apis: number;
    categories: number;
    tokens: ReturnType<TokenManager['getStats']>;
    health: ReturnType<HealthChecker['getStats']>;
    rateLimits: ReturnType<RateLimiter['getStats']>;
    cache: ReturnType<CacheManager['getStats']>;
    failover: ReturnType<FailoverManager['getStats']>;
    metrics: number;
    alerts: number;
    database: ReturnType<DatabaseSchema['getStats']>;
  } {
    return {
      apis: this.registry.list().length,
      categories: this.registry.getCategories().length,
      tokens: this.tokenManager.getStats(),
      health: this.healthChecker.getStats(),
      rateLimits: this.rateLimiter.getStats(),
      cache: this.cache.getStats(),
      failover: this.failover.getStats(),
      metrics: this.metrics.size,
      alerts: this.alerts.filter(a => !a.resolved).length,
      database: this.database.getStats(),
    };
  }
}
