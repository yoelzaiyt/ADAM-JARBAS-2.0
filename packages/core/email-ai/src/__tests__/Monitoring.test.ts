import { describe, it, expect, beforeEach } from 'vitest';
import { MonitoringEngine } from '../Monitoring.js';

describe('MonitoringEngine', () => {
  let engine: MonitoringEngine;

  beforeEach(() => { engine = new MonitoringEngine(); });

  it('creates engine', () => { expect(engine).toBeDefined(); });

  it('recordMetric and getMetrics', () => {
    engine.recordMetric('totalSent', 50);
    expect(engine.getMetrics().totalSent).toBe(50);
  });

  it('getDashboard returns status', () => {
    expect(engine.getDashboard().status).toBe('healthy');
  });

  it('reset clears', () => {
    engine.recordMetric('x', 1);
    engine.reset();
    expect(engine.getMetrics().totalReceived).toBe(0);
  });
});
