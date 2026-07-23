import { describe, it, expect, beforeEach } from 'vitest';
import { IntegrationHub } from '../IntegrationHub.js';

describe('IntegrationHub', () => {
  let hub: IntegrationHub;

  beforeEach(() => {
    hub = new IntegrationHub({
      enabled: true,
      database: { type: 'sqlite', url: ':memory:', maxConnections: 1 },
      tokenManager: {
        encryptionKey: 'test-key',
        storageType: 'memory',
        maxTokens: 100,
        autoRotate: false,
        rotationDays: 90,
      },
      rateLimiter: {
        strategy: 'fixed-window',
        maxRequests: 1000,
        windowMs: 60000,
        retryAfterMs: 1000,
      },
      cache: {
        strategy: 'memory',
        maxSize: 1000,
        defaultTtl: 300,
        evictionPolicy: 'lru',
      },
      retry: {
        maxRetries: 3,
        backoffType: 'exponential',
        initialDelay: 100,
        maxDelay: 5000,
        retryableStatuses: [429, 500],
        retryableErrors: ['ECONNRESET'],
      },
      failover: {
        enabled: true,
        maxFailures: 5,
        cooldownPeriod: 60000,
        healthCheckEnabled: true,
      },
      healthCheck: {
        interval: 30000,
        timeout: 5000,
        retries: 3,
        endpoints: [],
      },
      monitoring: {
        enabled: true,
        interval: 60000,
        alerts: [],
        metrics: [],
      },
    });
  });

  it('should initialize with catalog APIs', () => {
    expect(hub.registry.list().length).toBeGreaterThan(0);
  });

  it('should discover APIs', async () => {
    const result = await hub.discover({ category: 'ai-ml' });
    expect(result.apis.length).toBeGreaterThan(0);
  });

  it('should compare APIs', async () => {
    const apis = hub.registry.list();
    if (apis.length >= 2) {
      const comparison = await hub.compareApis(apis[0].id, apis[1].id);
      expect(comparison).toBeDefined();
    }
  });

  it('should find replacements', async () => {
    const apis = hub.registry.list();
    if (apis.length > 0) {
      const replacements = await hub.findReplacements(apis[0].id);
      expect(Array.isArray(replacements)).toBe(true);
    }
  });

  it('should return stats', () => {
    const stats = hub.getStats();
    expect(stats.apis).toBeGreaterThan(0);
    expect(stats.categories).toBeGreaterThan(0);
    expect(stats.database.tables).toBe(7);
  });

  it('should get metrics', () => {
    const metrics = hub.getMetrics('nonexistent');
    expect(metrics).toBeUndefined();
  });

  it('should manage alerts', () => {
    const alerts = hub.getAlerts();
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('should generate SDK', async () => {
    const apis = hub.registry.list();
    if (apis.length > 0) {
      const sdk = await hub.generateSdk(apis[0].id, {
        language: 'typescript',
        apiId: apis[0].id,
        options: { includeTypes: true, includeTests: false, includeExamples: false },
      });
      expect(sdk).toBeDefined();
      expect(sdk?.files.length).toBeGreaterThan(0);
    }
  });
});
