import { describe, it, expect, beforeEach } from 'vitest';
import { MonitoringEngine } from '../Monitoring.js';

describe('MonitoringEngine', () => {
  let engine: MonitoringEngine;

  beforeEach(() => {
    engine = new MonitoringEngine();
  });

  it('recordMetric and getMetrics', () => {
    engine.recordMetric('activeConversations', 10);
    expect(engine.getMetrics().activeConversations).toBe(10);
  });

  it('getDashboard returns dashboard', () => {
    expect(engine.getDashboard().status).toBe('healthy');
  });

  it('recordError stores error', () => {
    engine.recordError({ module: 'm', message: 'e', severity: 'media' });
    expect(engine.getDashboard().recentErrors.length).toBe(1);
  });

  it('reset clears', () => {
    engine.recordMetric('x', 1);
    engine.reset();
    expect(engine.getMetrics().totalMessages).toBe(0);
  });
});
