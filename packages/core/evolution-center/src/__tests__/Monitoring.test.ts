import { describe, it, expect } from 'vitest';
import { Monitoring } from '../monitoring/Monitoring.js';

describe('Monitoring', () => {
  const monitoring = new Monitoring({
    enabled: true, providers: [{ type: 'prometheus', endpoint: 'http://localhost:9090', enabled: true }],
    healthCheckInterval: 30000, alertThresholds: { cpu: 80, memory: 85 }
  });

  it('creates Monitoring', () => { expect(monitoring).toBeDefined(); });

  it('checks health', () => {
    const health = monitoring.checkHealth();
    expect(health.status).toBeDefined();
    expect(health.timestamp).toBeDefined();
  });

  it('updates component health', () => {
    monitoring.updateComponentHealth('api', { status: 'healthy', latency: 50, errorRate: 0.01 });
    const h = monitoring.getComponentHealth('api');
    expect(h).toBeDefined();
    expect(h!.status).toBe('healthy');
  });

  it('gets all component health', () => {
    monitoring.updateComponentHealth('db', { status: 'degraded', latency: 200, errorRate: 0.05 });
    const all = monitoring.getAllComponentHealth();
    expect(all.length).toBeGreaterThan(0);
  });

  it('gets prometheus metrics', () => {
    monitoring.updateComponentHealth('api', { status: 'healthy', latency: 50, errorRate: 0.01 });
    const metrics = monitoring.getPrometheusMetrics();
    expect(metrics).toContain('component_health');
  });

  it('gets providers', () => {
    const providers = monitoring.getProviders();
    expect(providers.length).toBe(1);
  });
});
