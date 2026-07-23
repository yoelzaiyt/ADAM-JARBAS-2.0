import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsEngine } from '../Analytics.js';

describe('AnalyticsEngine', () => {
  let engine: AnalyticsEngine;

  beforeEach(() => {
    engine = new AnalyticsEngine();
  });

  it('recordMetric and getMetrics', () => {
    engine.recordMetric('totalMessages', 100);
    engine.recordMetric('totalContacts', 50);
    const metrics = engine.getMetrics();
    expect(metrics.totalMessages).toBe(100);
    expect(metrics.totalContacts).toBe(50);
  });

  it('getDashboard returns dashboard', () => {
    const dash = engine.getDashboard();
    expect(dash.uptime).toBeGreaterThan(0);
    expect(dash.status).toBe('healthy');
    expect(dash.recentErrors).toEqual([]);
  });

  it('recordError stores error', () => {
    engine.recordError({ module: 'test', message: 'err', severity: 'alta' });
    expect(engine.getDashboard().recentErrors.length).toBe(1);
  });

  it('reset clears everything', () => {
    engine.recordMetric('x', 1);
    engine.recordError({ module: 'm', message: 'e', severity: 'baixa' });
    engine.reset();
    expect(engine.getMetrics().totalMessages).toBe(0);
    expect(engine.getDashboard().recentErrors.length).toBe(0);
  });
});
