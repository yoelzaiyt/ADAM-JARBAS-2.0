import { describe, it, expect, beforeEach } from 'vitest';
import { Monitoring } from '../Monitoring.js';

describe('Monitoring', () => {
  let monitoring: Monitoring;

  beforeEach(() => {
    monitoring = new Monitoring();
  });

  it('creates Monitoring', () => {
    expect(monitoring).toBeDefined();
  });

  it('gets health', () => {
    const health = monitoring.getHealth();
    expect(health).toBeDefined();
    expect(health.status).toBeDefined();
    expect(health.uptime).toBeDefined();
  });

  it('updates provider health', () => {
    monitoring.updateProviderHealth('gpt', {
      status: 'healthy',
      latencyMs: 50,
      lastChecked: new Date(),
    });
    const health = monitoring.getHealth();
    expect(health.providers).toHaveLength(1);
  });

  it('records health check', () => {
    monitoring.recordHealthCheck('healthy');
    monitoring.recordHealthCheck('degraded');
    const checks = monitoring.getRecentHealthChecks();
    expect(checks).toHaveLength(2);
  });

  it('calculates uptime', () => {
    const uptime = monitoring.getUptime();
    expect(uptime).toBeGreaterThanOrEqual(0);
  });

  it('gets average latency', () => {
    monitoring.updateProviderHealth('gpt', {
      status: 'healthy',
      latencyMs: 100,
      lastChecked: new Date(),
    });
    monitoring.updateProviderHealth('claude', {
      status: 'healthy',
      latencyMs: 200,
      lastChecked: new Date(),
    });
    const avg = monitoring.getAverageLatency();
    expect(avg).toBe(150);
  });

  it('checks provider availability', () => {
    monitoring.updateProviderHealth('gpt', {
      status: 'healthy',
      latencyMs: 50,
      lastChecked: new Date(),
    });
    expect(monitoring.checkProviderAvailability('gpt')).toBe(true);
    expect(monitoring.checkProviderAvailability('unknown')).toBe(false);
  });

  it('resets monitoring', () => {
    monitoring.recordHealthCheck('healthy');
    monitoring.reset();
    const checks = monitoring.getRecentHealthChecks();
    expect(checks).toHaveLength(0);
  });
});
