import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { TelemetryConfig, TelemetryEvent, PerformanceMetrics, CostMetrics } from '../interfaces.js';

export class TelemetryEngine {
  private config: TelemetryConfig;
  private events: Map<string, TelemetryEvent> = new Map();
  private performanceHistory: PerformanceMetrics[] = [];
  private costHistory: CostMetrics[] = [];
  private log = createLogger('TelemetryEngine');

  constructor(config: TelemetryConfig) {
    this.config = config;
  }

  recordEvent(event: Omit<TelemetryEvent, 'id'>): TelemetryEvent {
    const newEvent: TelemetryEvent = {
      ...event,
      id: generateId()
    };
    this.events.set(newEvent.id, newEvent);
    return newEvent;
  }

  recordPerformance(metrics: PerformanceMetrics): void {
    this.performanceHistory.push(metrics);
    if (this.performanceHistory.length > 10000) {
      this.performanceHistory = this.performanceHistory.slice(-5000);
    }
  }

  recordCost(metrics: CostMetrics): void {
    this.costHistory.push(metrics);
    if (this.costHistory.length > 1000) {
      this.costHistory = this.costHistory.slice(-500);
    }
  }

  getEvents(type?: TelemetryEvent['type']): TelemetryEvent[] {
    const all = Array.from(this.events.values());
    return type ? all.filter(e => e.type === type) : all;
  }

  getPerformanceHistory(limit: number = 100): PerformanceMetrics[] {
    return this.performanceHistory.slice(-limit);
  }

  getCostHistory(limit: number = 30): CostMetrics[] {
    return this.costHistory.slice(-limit);
  }

  getCurrentPerformance(): PerformanceMetrics | null {
    return this.performanceHistory.length > 0
      ? this.performanceHistory[this.performanceHistory.length - 1]
      : null;
  }

  getCurrentCosts(): CostMetrics | null {
    return this.costHistory.length > 0
      ? this.costHistory[this.costHistory.length - 1]
      : null;
  }

  getEventStats(): EventStats {
    const all = Array.from(this.events.values());
    return {
      total: all.length,
      byType: this.groupBy(all, 'type'),
      bySource: this.groupBy(all, 'source')
    };
  }

  private groupBy(items: TelemetryEvent[], field: keyof TelemetryEvent): Record<string, number> {
    return items.reduce((acc, i) => {
      const key = String(i[field]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  clearOldEvents(olderThanMs: number): number {
    const cutoff = Date.now() - olderThanMs;
    let count = 0;
    for (const [id, event] of this.events) {
      if (event.timestamp.getTime() < cutoff) {
        this.events.delete(id);
        count++;
      }
    }
    return count;
  }
}

export interface EventStats {
  total: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
}
