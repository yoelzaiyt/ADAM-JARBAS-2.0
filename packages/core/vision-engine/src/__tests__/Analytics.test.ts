import { describe, it, expect, beforeEach } from 'vitest';
import { Analytics } from '../Analytics.js';

describe('Analytics', () => {
  let analytics: Analytics;

  beforeEach(() => {
    analytics = new Analytics();
  });

  it('creates Analytics', () => {
    expect(analytics).toBeDefined();
  });

  it('records request', () => {
    analytics.recordRequest('describe', 'gpt-vision', 100, true, 1000, 0.01);
    const metrics = analytics.getMetrics();
    expect(metrics.totalRequests).toBe(1);
    expect(metrics.successfulRequests).toBe(1);
  });

  it('records error', () => {
    analytics.recordError({
      type: 'test-error',
      message: 'Test error',
    });
    const errors = analytics.getErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('test-error');
  });

  it('calculates success rate', () => {
    analytics.recordRequest('describe', 'gpt', 100, true);
    analytics.recordRequest('ocr', 'gpt', 100, false);
    expect(analytics.getSuccessRate()).toBe(0.5);
  });

  it('gets top providers', () => {
    analytics.recordRequest('describe', 'gpt', 100, true);
    analytics.recordRequest('ocr', 'gpt', 100, true);
    analytics.recordRequest('describe', 'claude', 100, true);
    const top = analytics.getTopProviders();
    expect(top[0].provider).toBe('gpt');
    expect(top[0].count).toBe(2);
  });

  it('gets requests per minute', () => {
    analytics.recordRequest('describe', 'gpt', 100, true);
    const rpm = analytics.getRequestsPerMinute();
    expect(rpm).toBeGreaterThanOrEqual(0);
  });

  it('resets metrics', () => {
    analytics.recordRequest('describe', 'gpt', 100, true);
    analytics.reset();
    const metrics = analytics.getMetrics();
    expect(metrics.totalRequests).toBe(0);
  });
});
