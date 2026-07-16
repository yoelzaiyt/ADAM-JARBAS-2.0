import { describe, it, expect } from 'vitest';
import { TelemetryEngine } from '../telemetry-engine/TelemetryEngine.js';

describe('TelemetryEngine', () => {
  const engine = new TelemetryEngine({
    enabled: true, collectInterval: 60000, privacyMode: 'full', retentionDays: 30, exportFormats: ['json']
  });

  it('creates TelemetryEngine', () => {
    expect(engine).toBeDefined();
  });

  it('records events', () => {
    const event = engine.recordEvent({ type: 'usage', source: 'core', data: {}, timestamp: new Date() });
    expect(event.id).toBeDefined();
  });

  it('records performance', () => {
    engine.recordPerformance({ cpu: 50, memory: 60, diskUsage: 40, networkIn: 100, networkOut: 50, activeConnections: 10, requestQueue: 5, timestamp: new Date() });
    expect(engine.getCurrentPerformance()).toBeDefined();
  });

  it('records costs', () => {
    engine.recordCost({ aiTokens: 1000, aiCost: 10, databaseCost: 5, storageCost: 2, infraCost: 20, thirdPartyCost: 3, totalCost: 40, period: '2026-07' });
    expect(engine.getCurrentCosts()).toBeDefined();
  });

  it('gets events by type', () => {
    engine.recordEvent({ type: 'error', source: 'api', data: {}, timestamp: new Date() });
    expect(engine.getEvents('error').length).toBeGreaterThan(0);
  });

  it('clears old events', () => {
    const cleared = engine.clearOldEvents(0);
    expect(cleared).toBeGreaterThanOrEqual(0);
  });

  it('gets stats', () => {
    const stats = engine.getEventStats();
    expect(stats.total).toBeGreaterThanOrEqual(0);
  });
});
