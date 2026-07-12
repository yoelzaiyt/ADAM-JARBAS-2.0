import type { AIProviderName, ChatResponse } from '@jarbas/types';
import { generateId } from '@jarbas/utils';

export interface MetricEntry {
  id: string;
  timestamp: Date;
  provider: AIProviderName;
  model: string;
  latencyMs: number;
  tokensUsed: number;
  costUsd: number;
  success: boolean;
  tenantId: string;
  endpoint: string;
  errorCode?: string;
}

export interface ProviderStats {
  provider: AIProviderName;
  totalRequests: number;
  successRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  totalCostUsd: number;
  totalTokens: number;
}

export interface AnalyticsSummary {
  period: string;
  totalRequests: number;
  totalCostUsd: number;
  totalTokens: number;
  avgLatencyMs: number;
  errorRate: number;
  topProviders: ProviderStats[];
  topModels: { model: string; count: number; cost: number }[];
  hourlyDistribution: { hour: number; count: number }[];
}

export class AnalyticsEngine {
  private metrics: MetricEntry[] = [];

  async recordMetric(entry: Omit<MetricEntry, 'id' | 'timestamp'>): Promise<MetricEntry> {
    const metric: MetricEntry = {
      ...entry,
      id: generateId(),
      timestamp: new Date(),
    };

    this.metrics.push(metric);

    if (this.metrics.length > 100000) {
      this.metrics = this.metrics.slice(-50000);
    }

    return metric;
  }

  async getProviderStats(provider?: AIProviderName): Promise<ProviderStats[]> {
    const filtered = provider
      ? this.metrics.filter((m) => m.provider === provider)
      : this.metrics;

    const byProvider = new Map<AIProviderName, MetricEntry[]>();
    for (const m of filtered) {
      const list = byProvider.get(m.provider) ?? [];
      list.push(m);
      byProvider.set(m.provider, list);
    }

    return Array.from(byProvider.entries()).map(([prov, entries]) => {
      const latencies = entries.map((e) => e.latencyMs).sort((a, b) => a - b);
      const successes = entries.filter((e) => e.success);

      return {
        provider: prov,
        totalRequests: entries.length,
        successRate: entries.length > 0 ? successes.length / entries.length : 0,
        avgLatencyMs: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
        p95LatencyMs: latencies[Math.floor(latencies.length * 0.95)] ?? 0,
        p99LatencyMs: latencies[Math.floor(latencies.length * 0.99)] ?? 0,
        totalCostUsd: entries.reduce((sum, e) => sum + e.costUsd, 0),
        totalTokens: entries.reduce((sum, e) => sum + e.tokensUsed, 0),
      };
    });
  }

  async getSummary(period: string = '24h'): Promise<AnalyticsSummary> {
    const now = new Date();
    const periodMs = period === '1h' ? 3600000 : period === '24h' ? 86400000 : period === '7d' ? 604800000 : 2592000000;
    const start = new Date(now.getTime() - periodMs);

    const filtered = this.metrics.filter((m) => m.timestamp >= start);
    const latencies = filtered.map((m) => m.latencyMs).sort((a, b) => a - b);

    const byModel = new Map<string, { count: number; cost: number }>();
    for (const m of filtered) {
      const existing = byModel.get(m.model) ?? { count: 0, cost: 0 };
      byModel.set(m.model, { count: existing.count + 1, cost: existing.cost + m.costUsd });
    }

    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: filtered.filter((m) => m.timestamp.getHours() === i).length,
    }));

    return {
      period,
      totalRequests: filtered.length,
      totalCostUsd: filtered.reduce((sum, m) => sum + m.costUsd, 0),
      totalTokens: filtered.reduce((sum, m) => sum + m.tokensUsed, 0),
      avgLatencyMs: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      errorRate: filtered.length > 0 ? filtered.filter((m) => !m.success).length / filtered.length : 0,
      topProviders: await this.getProviderStats(),
      topModels: Array.from(byModel.entries())
        .map(([model, data]) => ({ model, ...data }))
        .sort((a, b) => b.count - a.count),
      hourlyDistribution,
    };
  }

  async getLatencyTrend(provider: AIProviderName, hours = 24): Promise<{ timestamp: string; latencyMs: number }[]> {
    const now = new Date();
    const start = new Date(now.getTime() - hours * 3600000);

    return this.metrics
      .filter((m) => m.provider === provider && m.timestamp >= start)
      .map((m) => ({ timestamp: m.timestamp.toISOString(), latencyMs: m.latencyMs }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  async getErrorRate(provider?: AIProviderName, periodMs = 86400000): Promise<number> {
    const now = new Date();
    const start = new Date(now.getTime() - periodMs);
    const filtered = this.metrics.filter((m) => m.timestamp >= start && (!provider || m.provider === provider));

    if (filtered.length === 0) return 0;
    return filtered.filter((m) => !m.success).length / filtered.length;
  }

  async getSlowestRequests(limit = 10): Promise<MetricEntry[]> {
    return [...this.metrics]
      .sort((a, b) => b.latencyMs - a.latencyMs)
      .slice(0, limit);
  }

  async getMostExpensiveRequests(limit = 10): Promise<MetricEntry[]> {
    return [...this.metrics]
      .sort((a, b) => b.costUsd - a.costUsd)
      .slice(0, limit);
  }
}
