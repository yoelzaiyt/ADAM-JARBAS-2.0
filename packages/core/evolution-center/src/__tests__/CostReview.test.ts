import { describe, it, expect } from 'vitest';
import { CostReview } from '../cost-review/CostReview.js';

describe('CostReview', () => {
  const review = new CostReview({ enabled: true, alertThreshold: 1000, trackingCategories: ['ai', 'infra', 'storage'], checkInterval: 3600000 });

  it('creates CostReview', () => { expect(review).toBeDefined(); });

  it('analyzes costs and generates alerts', async () => {
    const alerts = await review.analyzeCosts('2026-07-10', [
      { category: 'ai', amount: 1500, percentage: 50, trend: 'increasing' },
      { category: 'infra', amount: 500, percentage: 17, trend: 'stable' }
    ]);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].category).toBe('ai');
  });

  it('gets cost history', async () => {
    await review.analyzeCosts('2026-07-11', [{ category: 'ai', amount: 800, percentage: 40, trend: 'decreasing' }]);
    expect(review.getHistory().length).toBeGreaterThan(0);
  });

  it('gets trend', async () => {
    await review.analyzeCosts('2026-07-09', [{ category: 'ai', amount: 1000, percentage: 50, trend: 'stable' }]);
    await review.analyzeCosts('2026-07-10', [{ category: 'ai', amount: 1200, percentage: 50, trend: 'increasing' }]);
    const trend = review.getTrend();
    expect(['increasing', 'decreasing', 'stable']).toContain(trend);
  });

  it('gets total cost', async () => {
    const total = review.getTotalCost();
    expect(total).toBeGreaterThan(0);
  });
});
