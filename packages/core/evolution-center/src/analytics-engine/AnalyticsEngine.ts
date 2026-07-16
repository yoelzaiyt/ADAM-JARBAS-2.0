import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { AnalyticsConfig, DailyMetrics, UserEngagement } from '../interfaces.js';

export class AnalyticsEngine {
  private config: AnalyticsConfig;
  private dailyMetrics: Map<string, DailyMetrics> = new Map();
  private userEngagement: Map<string, UserEngagement> = new Map();
  private log = createLogger('AnalyticsEngine');

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  recordDailyMetrics(metrics: DailyMetrics): void {
    this.dailyMetrics.set(metrics.date, metrics);
  }

  recordUserEngagement(engagement: UserEngagement): void {
    this.userEngagement.set(engagement.userId, engagement);
  }

  getDailyMetrics(date: string): DailyMetrics | undefined {
    return this.dailyMetrics.get(date);
  }

  getMetricsRange(startDate: string, endDate: string): DailyMetrics[] {
    const results: DailyMetrics[] = [];
    for (const [date, metrics] of this.dailyMetrics) {
      if (date >= startDate && date <= endDate) {
        results.push(metrics);
      }
    }
    return results.sort((a, b) => a.date.localeCompare(b.date));
  }

  getAggregateMetrics(startDate: string, endDate: string): AggregateMetrics {
    const range = this.getMetricsRange(startDate, endDate);
    if (range.length === 0) {
      return { period: { start: startDate, end: endDate }, totalSessions: 0, totalUsers: 0, avgSessionDuration: 0, totalRequests: 0, totalErrors: 0, totalCost: 0, avgDailyActive: 0 };
    }
    return {
      period: { start: startDate, end: endDate },
      totalSessions: range.reduce((sum, m) => sum + m.sessions, 0),
      totalUsers: Math.max(...range.map(m => m.activeUsers)),
      avgSessionDuration: range.reduce((sum, m) => sum + m.avgSessionDuration, 0) / range.length,
      totalRequests: range.reduce((sum, m) => sum + m.totalRequests, 0),
      totalErrors: range.reduce((sum, m) => sum + m.errorCount, 0),
      totalCost: range.reduce((sum, m) => sum + m.totalCost, 0),
      avgDailyActive: range.reduce((sum, m) => sum + m.activeUsers, 0) / range.length
    };
  }

  getModuleUsage(): Record<string, number> {
    const usage: Record<string, number> = {};
    for (const metrics of this.dailyMetrics.values()) {
      for (const [module, count] of Object.entries(metrics.moduleUsage)) {
        usage[module] = (usage[module] || 0) + count;
      }
    }
    return usage;
  }

  getTopModules(limit: number = 10): Array<{ name: string; usage: number }> {
    return Object.entries(this.getModuleUsage())
      .map(([name, usage]) => ({ name, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit);
  }

  getTopUsers(limit: number = 10): UserEngagement[] {
    return Array.from(this.userEngagement.values())
      .sort((a, b) => b.totalSessions - a.totalSessions)
      .slice(0, limit);
  }

  getUserEngagement(userId: string): UserEngagement | undefined {
    return this.userEngagement.get(userId);
  }

  getTrend(metric: keyof DailyMetrics, days: number = 30): TrendData {
    const all = Array.from(this.dailyMetrics.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-days);

    return {
      values: all.map(m => ({ date: m.date, value: Number(m[metric]) || 0 })),
      direction: all.length >= 2
        ? Number(all[all.length - 1][metric]) > Number(all[0][metric]) ? 'up' : 'down'
        : 'stable'
    };
  }

  getAllDailyMetrics(): DailyMetrics[] {
    return Array.from(this.dailyMetrics.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
}

export interface AggregateMetrics {
  period: { start: string; end: string };
  totalSessions: number;
  totalUsers: number;
  avgSessionDuration: number;
  totalRequests: number;
  totalErrors: number;
  totalCost: number;
  avgDailyActive: number;
}

export interface TrendData {
  values: Array<{ date: string; value: number }>;
  direction: 'up' | 'down' | 'stable';
}
