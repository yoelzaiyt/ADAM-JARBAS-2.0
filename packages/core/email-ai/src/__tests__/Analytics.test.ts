import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsEngine } from '../Analytics.js';

describe('AnalyticsEngine', () => {
  let engine: AnalyticsEngine;

  beforeEach(() => { engine = new AnalyticsEngine(); });

  it('creates engine', () => { expect(engine).toBeDefined(); });

  it('recordMetric and getMetrics', () => {
    engine.recordMetric('totalReceived', 100);
    expect(engine.getMetrics().totalReceived).toBe(100);
  });

  it('getDashboard returns dashboard', () => {
    const dash = engine.getDashboard();
    expect(dash.uptime).toBeGreaterThan(0);
    expect(dash.status).toBe('healthy');
  });

  it('recordError stores error', () => {
    engine.recordError({ module: 'test', message: 'err', severity: 'alta' });
    expect(engine.getDashboard().recentErrors.length).toBe(1);
  });

  it('reset clears', () => {
    engine.recordMetric('x', 1);
    engine.reset();
    expect(engine.getMetrics().totalReceived).toBe(0);
  });
});
