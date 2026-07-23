import { describe, it, expect } from 'vitest';
import { PerformanceReview } from '../performance-review/PerformanceReview.js';

describe('PerformanceReview', () => {
  const review = new PerformanceReview({ enabled: true, metrics: ['cpu', 'memory'], thresholds: { cpu: 80, memory: 85, dbLatency: 200, cacheHitRate: 80, queueDepth: 100, responseTime: 500 }, checkInterval: 60000 });

  it('creates PerformanceReview', () => { expect(review).toBeDefined(); });

  it('detects high CPU', async () => {
    const issues = await review.analyze({ cpu: 90, memory: 50, dbLatency: 100, cacheHitRate: 90, queueDepth: 10, responseTime: 200 });
    expect(issues.some(i => i.type === 'cpu')).toBe(true);
  });

  it('detects high memory', async () => {
    const issues = await review.analyze({ cpu: 50, memory: 90, dbLatency: 100, cacheHitRate: 90, queueDepth: 10, responseTime: 200 });
    expect(issues.some(i => i.type === 'memory')).toBe(true);
  });

  it('detects high DB latency', async () => {
    const issues = await review.analyze({ cpu: 50, memory: 50, dbLatency: 500, cacheHitRate: 90, queueDepth: 10, responseTime: 200 });
    expect(issues.some(i => i.type === 'database')).toBe(true);
  });

  it('detects high response time', async () => {
    const issues = await review.analyze({ cpu: 50, memory: 50, dbLatency: 100, cacheHitRate: 90, queueDepth: 10, responseTime: 1000 });
    expect(issues.some(i => i.type === 'latency')).toBe(true);
  });

  it('gets stats', async () => {
    await review.analyze({ cpu: 90, memory: 90, dbLatency: 500, cacheHitRate: 50, queueDepth: 200, responseTime: 1000 });
    const stats = review.getStats();
    expect(stats.total).toBeGreaterThan(0);
  });
});
