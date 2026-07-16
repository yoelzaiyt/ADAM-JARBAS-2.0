import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { PerformanceReviewConfig, PerformanceIssue } from '../interfaces.js';

export class PerformanceReview {
  private config: PerformanceReviewConfig;
  private issues: Map<string, PerformanceIssue> = new Map();
  private log = createLogger('PerformanceReview');

  constructor(config: PerformanceReviewConfig) {
    this.config = config;
  }

  async analyze(metrics: PerformanceMetricsInput): Promise<PerformanceIssue[]> {
    const results: PerformanceIssue[] = [];

    if (metrics.cpu > (this.config.thresholds.cpu || 80)) {
      results.push(this.createIssue('cpu', 'high', 'High CPU usage', `CPU at ${metrics.cpu}%`, metrics.cpu, this.config.thresholds.cpu || 80));
    }
    if (metrics.memory > (this.config.thresholds.memory || 85)) {
      results.push(this.createIssue('memory', 'high', 'High memory usage', `Memory at ${metrics.memory}%`, metrics.memory, this.config.thresholds.memory || 85));
    }
    if (metrics.dbLatency > (this.config.thresholds.dbLatency || 200)) {
      results.push(this.createIssue('database', 'medium', 'High database latency', `DB latency: ${metrics.dbLatency}ms`, metrics.dbLatency, this.config.thresholds.dbLatency || 200));
    }
    if (metrics.cacheHitRate < (this.config.thresholds.cacheHitRate || 80) && metrics.cacheHitRate > 0) {
      results.push(this.createIssue('cache', 'medium', 'Low cache hit rate', `Cache hit rate: ${metrics.cacheHitRate}%`, 100 - metrics.cacheHitRate, 20));
    }
    if (metrics.queueDepth > (this.config.thresholds.queueDepth || 100)) {
      results.push(this.createIssue('queue', 'high', 'Queue depth growing', `Queue depth: ${metrics.queueDepth}`, metrics.queueDepth, this.config.thresholds.queueDepth || 100));
    }
    if (metrics.responseTime > (this.config.thresholds.responseTime || 500)) {
      results.push(this.createIssue('latency', 'high', 'High response time', `Response time: ${metrics.responseTime}ms`, metrics.responseTime, this.config.thresholds.responseTime || 500));
    }

    for (const issue of results) {
      this.issues.set(issue.id, issue);
    }
    this.log(`Performance review: ${results.length} issues found`);
    return results;
  }

  private createIssue(type: PerformanceIssue['type'], severity: PerformanceIssue['severity'], title: string, description: string, current: number, threshold: number): PerformanceIssue {
    return {
      id: generateId(), type, severity, title, description,
      currentValue: current, threshold,
      recommendation: `Optimize ${type} to bring value below ${threshold}`,
      detectedAt: new Date()
    };
  }

  getAll(): PerformanceIssue[] {
    return Array.from(this.issues.values());
  }

  getByType(type: PerformanceIssue['type']): PerformanceIssue[] {
    return Array.from(this.issues.values()).filter(i => i.type === type);
  }

  getStats(): { total: number; byType: Record<string, number>; bySeverity: Record<string, number> } {
    const all = Array.from(this.issues.values());
    return {
      total: all.length,
      byType: all.reduce((acc, i) => { acc[i.type] = (acc[i.type] || 0) + 1; return acc; }, {} as Record<string, number>),
      bySeverity: all.reduce((acc, i) => { acc[i.severity] = (acc[i.severity] || 0) + 1; return acc; }, {} as Record<string, number>)
    };
  }
}

export interface PerformanceMetricsInput {
  cpu: number;
  memory: number;
  dbLatency: number;
  cacheHitRate: number;
  queueDepth: number;
  responseTime: number;
}
