import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { QualityConfig, QualityMetrics } from '../interfaces.js';

export class QualityEngine {
  private config: QualityConfig;
  private metricsHistory: Map<string, QualityMetrics> = new Map();
  private log = createLogger('QualityEngine');

  constructor(config: QualityConfig) {
    this.config = config;
  }

  recordMetrics(metrics: QualityMetrics): void {
    const key = metrics.timestamp.toISOString();
    this.metricsHistory.set(key, metrics);
  }

  getLatestMetrics(): QualityMetrics | null {
    const all = this.getAllMetrics();
    return all.length > 0 ? all[all.length - 1] : null;
  }

  getAllMetrics(): QualityMetrics[] {
    return Array.from(this.metricsHistory.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  checkThresholds(metrics: QualityMetrics): QualityViolation[] {
    const violations: QualityViolation[] = [];
    if (metrics.testCoverage < this.config.thresholds.testCoverage) {
      violations.push({
        id: generateId(),
        type: 'test-coverage',
        severity: 'high',
        current: metrics.testCoverage,
        threshold: this.config.thresholds.testCoverage,
        message: `Test coverage ${metrics.testCoverage}% is below threshold ${this.config.thresholds.testCoverage}%`
      });
    }
    if (metrics.complexity > this.config.thresholds.maxComplexity) {
      violations.push({
        id: generateId(),
        type: 'complexity',
        severity: 'medium',
        current: metrics.complexity,
        threshold: this.config.thresholds.maxComplexity,
        message: `Complexity ${metrics.complexity} exceeds threshold ${this.config.thresholds.maxComplexity}`
      });
    }
    if (metrics.duplication > this.config.thresholds.maxDuplication) {
      violations.push({
        id: generateId(),
        type: 'duplication',
        severity: 'medium',
        current: metrics.duplication,
        threshold: this.config.thresholds.maxDuplication,
        message: `Duplication ${metrics.duplication}% exceeds threshold ${this.config.thresholds.maxDuplication}%`
      });
    }
    if (metrics.maintainabilityIndex < this.config.thresholds.minMaintainability) {
      violations.push({
        id: generateId(),
        type: 'maintainability',
        severity: 'high',
        current: metrics.maintainabilityIndex,
        threshold: this.config.thresholds.minMaintainability,
        message: `Maintainability index ${metrics.maintainabilityIndex} is below threshold ${this.config.thresholds.minMaintainability}`
      });
    }
    return violations;
  }

  getTrend(): 'improving' | 'degrading' | 'stable' {
    const all = this.getAllMetrics();
    if (all.length < 2) return 'stable';
    const recent = all.slice(-5);
    const earlier = all.slice(-10, -5);
    if (recent.length === 0 || earlier.length === 0) return 'stable';
    const recentAvg = recent.reduce((s, m) => s + m.maintainabilityIndex, 0) / recent.length;
    const earlierAvg = earlier.reduce((s, m) => s + m.maintainabilityIndex, 0) / earlier.length;
    if (recentAvg > earlierAvg + 2) return 'improving';
    if (recentAvg < earlierAvg - 2) return 'degrading';
    return 'stable';
  }

  getScore(): number {
    const latest = this.getLatestMetrics();
    if (!latest) return 0;
    return Math.round(
      (latest.testCoverage * 0.3) +
      (Math.max(0, 100 - latest.complexity) * 0.2) +
      (Math.max(0, 100 - latest.duplication) * 0.2) +
      (latest.maintainabilityIndex * 0.3)
    );
  }
}

export interface QualityViolation {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  current: number;
  threshold: number;
  message: string;
}
