import { randomUUID } from 'node:crypto';
import type {
  MonitoringEngine as IMonitoringEngine,
  MeetingMetrics,
  MeetingDashboard,
  MeetingError,
} from './interfaces.js';

interface MetricSeries {
  values: { timestamp: Date; value: number }[];
}

export class MonitoringEngine implements IMonitoringEngine {
  private metrics: Map<string, MetricSeries> = new Map();
  private errors: MeetingError[] = [];
  private startTime = Date.now();

  recordMetric(name: string, value: number): void {
    let series = this.metrics.get(name);
    if (!series) { series = { values: [] }; this.metrics.set(name, series); }
    series.values.push({ timestamp: new Date(), value });
  }

  recordError(error: Omit<MeetingError, 'id' | 'timestamp'>): void {
    this.errors.push({ ...error, id: randomUUID(), timestamp: new Date() });
  }

  getMetrics(): MeetingMetrics {
    const get = (name: string): number => {
      const series = this.metrics.get(name);
      if (!series || series.values.length === 0) return 0;
      return series.values[series.values.length - 1]!.value;
    };

    const totalMeetings = get('totalMeetings');
    const errorCount = this.errors.length;
    const errorRate = totalMeetings > 0 ? errorCount / totalMeetings : 0;

    return {
      totalMeetings,
      totalDurationMs: get('totalDurationMs'),
      totalTranscriptions: get('totalTranscriptions'),
      totalSummaries: get('totalSummaries'),
      totalTasksGenerated: get('totalTasksGenerated'),
      totalDecisionsRecorded: get('totalDecisionsRecorded'),
      averageMeetingDurationMs: totalMeetings > 0 ? get('totalDurationMs') / totalMeetings : 0,
      errorRate,
      avgLatencyMs: get('avgLatencyMs'),
    };
  }

  getDashboard(): MeetingDashboard {
    const metrics = this.getMetrics();
    const uptime = (Date.now() - this.startTime) / 1000;
    const status = metrics.errorRate > 0.1 ? 'down' : metrics.errorRate > 0.05 ? 'degraded' : 'healthy';
    return { metrics, uptime, status, recentErrors: this.errors.slice(-10) };
  }

  reset(): void {
    this.metrics.clear();
    this.errors = [];
    this.startTime = Date.now();
  }
}
