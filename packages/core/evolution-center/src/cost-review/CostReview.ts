import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { CostReviewConfig, CostBreakdown, CostAlert } from '../interfaces.js';

export class CostReview {
  private config: CostReviewConfig;
  private breakdowns: Map<string, CostBreakdown> = new Map();
  private alerts: Map<string, CostAlert> = new Map();
  private costHistory: Array<{ date: string; total: number; breakdown: CostBreakdown[] }> = [];
  private log = createLogger('CostReview');

  constructor(config: CostReviewConfig) {
    this.config = config;
  }

  async analyzeCosts(date: string, breakdown: CostBreakdown[]): Promise<CostAlert[]> {
    this.costHistory.push({ date, total: breakdown.reduce((s, b) => s + b.amount, 0), breakdown });
    const alerts: CostAlert[] = [];

    for (const item of breakdown) {
      if (item.amount > this.config.alertThreshold) {
        const alert: CostAlert = {
          id: generateId(),
          category: item.category,
          threshold: this.config.alertThreshold,
          currentValue: item.amount,
          severity: item.amount > this.config.alertThreshold * 2 ? 'critical' : 'high',
          message: `${item.category} costs ($${item.amount}) exceed threshold ($${this.config.alertThreshold})`,
          detectedAt: new Date()
        };
        alerts.push(alert);
        this.alerts.set(alert.id, alert);
      }
    }

    this.log(`Cost review: ${alerts.length} alerts`);
    return alerts;
  }

  getHistory(): Array<{ date: string; total: number }> {
    return this.costHistory.map(h => ({ date: h.date, total: h.total }));
  }

  getTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.costHistory.length < 2) return 'stable';
    const recent = this.costHistory.slice(-7);
    const earlier = this.costHistory.slice(-14, -7);
    if (recent.length === 0 || earlier.length === 0) return 'stable';
    const recentAvg = recent.reduce((s, h) => s + h.total, 0) / recent.length;
    const earlierAvg = earlier.reduce((s, h) => s + h.total, 0) / earlier.length;
    if (recentAvg > earlierAvg * 1.1) return 'increasing';
    if (recentAvg < earlierAvg * 0.9) return 'decreasing';
    return 'stable';
  }

  getAllAlerts(): CostAlert[] {
    return Array.from(this.alerts.values());
  }

  getLatestBreakdown(): CostBreakdown[] | null {
    if (this.costHistory.length === 0) return null;
    return this.costHistory[this.costHistory.length - 1].breakdown;
  }

  getTotalCost(): number {
    return this.costHistory.reduce((s, h) => s + h.total, 0);
  }
}
