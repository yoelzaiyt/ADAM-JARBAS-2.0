// ─── Analytics ───────────────────────────────────────────────────────────────
// Track usage metrics, costs, performance

import type {
  VisionMetrics,
  VisionError,
  VisionAnalysisType,
} from './interfaces.js';

export class Analytics {
  private metrics: VisionMetrics;
  private errors: VisionError[] = [];
  private requestTimestamps: number[] = [];

  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatencyMs: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      requestsByType: {} as Record<VisionAnalysisType, number>,
      requestsByProvider: {},
      errorsByType: {},
      uptime: 0,
    };
  }

  recordRequest(
    type: VisionAnalysisType,
    provider: string,
    latencyMs: number,
    success: boolean,
    tokensUsed?: number,
    cost?: number
  ): void {
    this.metrics.totalRequests++;
    this.requestTimestamps.push(Date.now());

    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average latency
    const totalLatency = this.metrics.averageLatencyMs * (this.metrics.totalRequests - 1) + latencyMs;
    this.metrics.averageLatencyMs = totalLatency / this.metrics.totalRequests;

    // Update type count
    this.metrics.requestsByType[type] = (this.metrics.requestsByType[type] || 0) + 1;

    // Update provider count
    this.metrics.requestsByProvider[provider] = (this.metrics.requestsByProvider[provider] || 0) + 1;

    // Update tokens and cost
    if (tokensUsed) {
      this.metrics.totalTokensUsed += tokensUsed;
    }
    if (cost) {
      this.metrics.totalCost += cost;
    }
  }

  recordError(error: Omit<VisionError, 'id' | 'timestamp'>): void {
    const fullError: VisionError = {
      ...error,
      id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
    };

    this.errors.push(fullError);
    this.metrics.errorsByType[error.type] = (this.metrics.errorsByType[error.type] || 0) + 1;
  }

  getMetrics(): VisionMetrics {
    return { ...this.metrics };
  }

  getErrors(limit?: number): VisionError[] {
    const sorted = [...this.errors].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  getSuccessRate(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return this.metrics.successfulRequests / this.metrics.totalRequests;
  }

  getRequestsPerMinute(): number {
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = this.requestTimestamps.filter(t => t > oneMinuteAgo);
    return recentRequests.length;
  }

  getTopProviders(limit?: number): { provider: string; count: number }[] {
    const max = limit || 5;
    return Object.entries(this.metrics.requestsByProvider)
      .map(([provider, count]) => ({ provider, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, max);
  }

  getTopErrors(limit?: number): { type: string; count: number }[] {
    const max = limit || 5;
    return Object.entries(this.metrics.errorsByType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, max);
  }

  calculateUptime(startTime: Date): number {
    const now = new Date();
    const elapsed = now.getTime() - startTime.getTime();
    this.metrics.uptime = elapsed;
    return elapsed;
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatencyMs: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      requestsByType: {} as Record<VisionAnalysisType, number>,
      requestsByProvider: {},
      errorsByType: {},
      uptime: 0,
    };
    this.errors = [];
    this.requestTimestamps = [];
  }
}
