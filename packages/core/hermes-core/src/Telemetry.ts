import type { TelemetryMetric } from './interfaces.js';
import { generateId } from '@jarbas/utils';

export class Telemetry {
  private metrics: TelemetryMetric[] = [];
  private readonly maxAge = 3600000;

  private cleanOldMetrics(): void {
    const now = Date.now();
    this.metrics = this.metrics.filter((m) => now - m.timestamp.getTime() < this.maxAge);
  }

  async recordCounter(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    this.cleanOldMetrics();
    this.metrics.push({
      id: generateId(),
      name,
      type: 'counter',
      value,
      labels,
      timestamp: new Date(),
    });
  }

  async recordGauge(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    this.cleanOldMetrics();
    this.metrics.push({
      id: generateId(),
      name,
      type: 'gauge',
      value,
      labels,
      timestamp: new Date(),
    });
  }

  async recordHistogram(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    this.cleanOldMetrics();
    this.metrics.push({
      id: generateId(),
      name,
      type: 'histogram',
      value,
      labels,
      timestamp: new Date(),
    });
  }

  getMetrics(name?: string): TelemetryMetric[] {
    this.cleanOldMetrics();
    if (name) {
      return this.metrics.filter((m) => m.name === name);
    }
    return [...this.metrics];
  }

  getSummary(): Record<string, { count: number; sum: number; avg: number; min: number; max: number }> {
    this.cleanOldMetrics();
    const grouped: Record<string, TelemetryMetric[]> = {};

    for (const metric of this.metrics) {
      if (!grouped[metric.name]) {
        grouped[metric.name] = [];
      }
      grouped[metric.name].push(metric);
    }

    const summary: Record<string, { count: number; sum: number; avg: number; min: number; max: number }> = {};

    for (const [name, entries] of Object.entries(grouped)) {
      const values = entries.map((e) => e.value);
      const sum = values.reduce((a, b) => a + b, 0);
      summary[name] = {
        count: values.length,
        sum,
        avg: sum / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    }

    return summary;
  }
}
