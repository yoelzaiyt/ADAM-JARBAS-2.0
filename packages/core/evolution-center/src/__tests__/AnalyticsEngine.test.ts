import { describe, it, expect } from 'vitest';
import { AnalyticsEngine } from '../analytics-engine/AnalyticsEngine.js';

describe('AnalyticsEngine', () => {
  const engine = new AnalyticsEngine({ enabled: true, aggregationIntervals: ['daily'], retentionDays: 30 });

  it('creates AnalyticsEngine', () => {
    expect(engine).toBeDefined();
  });

  it('records daily metrics', () => {
    engine.recordDailyMetrics({ date: '2026-07-10', activeUsers: 100, sessions: 200, avgSessionDuration: 300, totalRequests: 5000, errorCount: 10, totalCost: 100, moduleUsage: { 'hermes-core': 50 } });
    expect(engine.getDailyMetrics('2026-07-10')).toBeDefined();
  });

  it('gets metrics range', () => {
    engine.recordDailyMetrics({ date: '2026-07-11', activeUsers: 120, sessions: 250, avgSessionDuration: 310, totalRequests: 6000, errorCount: 5, totalCost: 110, moduleUsage: {} });
    const range = engine.getMetricsRange('2026-07-10', '2026-07-11');
    expect(range.length).toBe(2);
  });

  it('gets aggregate metrics', () => {
    const agg = engine.getAggregateMetrics('2026-07-10', '2026-07-11');
    expect(agg.totalSessions).toBeGreaterThan(0);
  });

  it('gets module usage', () => {
    const usage = engine.getModuleUsage();
    expect(usage['hermes-core']).toBeGreaterThan(0);
  });

  it('gets top modules', () => {
    const top = engine.getTopModules(5);
    expect(top.length).toBeGreaterThan(0);
  });

  it('records user engagement', () => {
    engine.recordUserEngagement({ userId: 'u1', totalSessions: 10, totalDuration: 3000, featuresUsed: ['auth'], lastActive: new Date() });
    expect(engine.getUserEngagement('u1')).toBeDefined();
  });

  it('gets trend', () => {
    const trend = engine.getTrend('activeUsers', 30);
    expect(trend.values.length).toBeGreaterThan(0);
  });
});
