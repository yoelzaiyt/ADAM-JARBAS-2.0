import { describe, it, expect } from 'vitest';
import { QualityEngine } from '../quality-engine/QualityEngine.js';

describe('QualityEngine', () => {
  const engine = new QualityEngine({
    enabled: true, thresholds: { testCoverage: 80, maxComplexity: 20, maxDuplication: 15, minMaintainability: 60 },
    checkInterval: 3600000
  });

  it('creates QualityEngine', () => {
    expect(engine).toBeDefined();
  });

  it('records metrics', () => {
    engine.recordMetrics({ testCoverage: 85, codeSmells: 10, complexity: 15, duplication: 10, documentation: 70, technicalDebt: 5, maintainabilityIndex: 75, timestamp: new Date() });
    expect(engine.getLatestMetrics()).toBeDefined();
  });

  it('checks thresholds', () => {
    const violations = engine.checkThresholds({ testCoverage: 60, codeSmells: 5, complexity: 25, duplication: 20, documentation: 50, technicalDebt: 3, maintainabilityIndex: 50, timestamp: new Date() });
    expect(violations.length).toBeGreaterThan(0);
  });

  it('gets trend', () => {
    engine.recordMetrics({ testCoverage: 80, codeSmells: 5, complexity: 10, duplication: 5, documentation: 80, technicalDebt: 2, maintainabilityIndex: 80, timestamp: new Date() });
    const trend = engine.getTrend();
    expect(['improving', 'degrading', 'stable']).toContain(trend);
  });

  it('gets score', () => {
    engine.recordMetrics({ testCoverage: 90, codeSmells: 2, complexity: 10, duplication: 5, documentation: 90, technicalDebt: 1, maintainabilityIndex: 85, timestamp: new Date() });
    const score = engine.getScore();
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
