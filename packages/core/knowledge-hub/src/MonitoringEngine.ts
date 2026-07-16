import type {
  MonitoringEngine as IMonitoringEngine,
  MonitoringMetrics,
  DashboardData,
  TrendData,
  AlertData,
} from './interfaces.js';

interface MetricSeries {
  values: { timestamp: Date; value: number }[];
  labels?: Record<string, string>;
}

interface AlertRule {
  metric: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
}

export class MonitoringEngine implements IMonitoringEngine {
  private metrics: Map<string, MetricSeries> = new Map();
  private alertRules: AlertRule[] = [];
  private activeAlerts: AlertData[] = [];
  private alertIdCounter = 0;

  recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    let series = this.metrics.get(name);
    if (!series) {
      series = { values: [], labels };
      this.metrics.set(name, series);
    }

    series.values.push({ timestamp: new Date(), value });

    if (series.values.length > 1000) {
      series.values = series.values.slice(-1000);
    }

    this.checkAlerts(name, value);
  }

  getMetrics(timeRange?: { start: Date; end: Date }): MonitoringMetrics {
    const filtered = (name: string): number[] => {
      const series = this.metrics.get(name);
      if (!series) return [];

      let values = series.values;
      if (timeRange) {
        values = values.filter(
          (v) => v.timestamp >= timeRange.start && v.timestamp <= timeRange.end,
        );
      }
      return values.map((v) => v.value);
    };

    const sum = (name: string): number => {
      return filtered(name).reduce((a, b) => a + b, 0);
    };

    const avg = (name: string): number => {
      const values = filtered(name);
      if (values.length === 0) return 0;
      return values.reduce((a, b) => a + b, 0) / values.length;
    };

    return {
      ingestionTimeMs: avg('ingestionTimeMs'),
      ocrTimeMs: avg('ocrTimeMs'),
      embeddingTimeMs: avg('embeddingTimeMs'),
      searchTimeMs: avg('searchTimeMs'),
      precision: avg('precision'),
      memoryUsageMb: avg('memoryUsageMb'),
      cpuUsagePercent: avg('cpuUsagePercent'),
      gpuUsagePercent: this.metrics.has('gpuUsagePercent') ? avg('gpuUsagePercent') : undefined,
      tokensUsed: sum('tokensUsed'),
      costUsd: sum('costUsd'),
      documentsIndexed: sum('documentsIndexed'),
      chunksStored: sum('chunksStored'),
      queriesProcessed: sum('queriesProcessed'),
    };
  }

  getDashboard(): DashboardData {
    const trends: TrendData[] = [];

    for (const [name, series] of this.metrics) {
      const last100 = series.values.slice(-100);
      if (last100.length > 0) {
        trends.push({ metric: name, values: last100 });
      }
    }

    return {
      summary: this.getMetrics(),
      trends,
      alerts: [...this.activeAlerts],
    };
  }

  reset(): void {
    this.metrics.clear();
    this.activeAlerts = [];
    this.alertRules = [];
    this.alertIdCounter = 0;
  }

  addAlert(
    metric: string,
    threshold: number,
    severity: 'info' | 'warning' | 'critical',
    message: string,
  ): void {
    this.alertRules.push({ metric, threshold, severity, message });
  }

  private checkAlerts(metric: string, value: number): void {
    for (const rule of this.alertRules) {
      if (rule.metric !== metric) continue;
      if (value <= rule.threshold) continue;

      const existing = this.activeAlerts.find(
        (a) => a.metric === metric && a.threshold === rule.threshold,
      );

      if (existing) {
        existing.currentValue = value;
        existing.createdAt = new Date();
        continue;
      }

      this.alertIdCounter++;
      this.activeAlerts.push({
        id: `alert-${this.alertIdCounter}`,
        metric,
        threshold: rule.threshold,
        currentValue: value,
        severity: rule.severity,
        message: rule.message,
        createdAt: new Date(),
      });
    }
  }
}
