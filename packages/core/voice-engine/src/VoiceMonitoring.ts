import { randomUUID } from 'node:crypto';
import type { MonitoringEngine as IMonitoringEngine, VoiceMetrics, VoiceDashboard, VoiceError, Language } from './interfaces.js';

interface MetricSeries {
  values: { timestamp: Date; value: number }[];
}

export class VoiceMonitoring implements IMonitoringEngine {
  private metrics = new Map<string, MetricSeries>();
  private errors: VoiceError[] = [];
  private startTime = Date.now();

  constructor() {}

  recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    const key = labels ? `${name}:${Object.entries(labels).map(([k, v]) => `${k}=${v}`).join(',')}` : name;
    let series = this.metrics.get(key);
    if (!series) {
      series = { values: [] };
      this.metrics.set(key, series);
    }
    series.values.push({ timestamp: new Date(), value });
  }

  getMetrics(): VoiceMetrics {
    const get = (name: string): number => {
      const series = this.metrics.get(name);
      if (!series || series.values.length === 0) return 0;
      return series.values[series.values.length - 1].value;
    };

    const languagesUsed: Language[] = [];
    const providersUsed: string[] = [];
    for (const key of this.metrics.keys()) {
      if (key.startsWith('language:')) {
        languagesUsed.push(key.split(':')[1] as Language);
      }
      if (key.startsWith('provider:')) {
        providersUsed.push(key.split(':')[1]);
      }
    }

    const totalRequests = get('totalRequests');
    const errorCount = this.errors.length;
    const errorRate = totalRequests > 0 ? errorCount / totalRequests : 0;

    return {
      totalRequests,
      sttLatencyMs: get('sttLatencyMs'),
      ttsLatencyMs: get('ttsLatencyMs'),
      endToEndLatencyMs: get('endToEndLatencyMs'),
      totalAudioProcessedMs: get('totalAudioProcessedMs'),
      activeSessions: get('activeSessions'),
      errorRate,
      averageConfidence: get('averageConfidence'),
      languagesUsed,
      providersUsed,
      cacheHitRate: get('cacheHitRate'),
      totalTokensUsed: get('totalTokensUsed'),
      estimatedCostUsd: get('estimatedCostUsd'),
    };
  }

  getDashboard(): VoiceDashboard {
    const metrics = this.getMetrics();
    const uptime = (Date.now() - this.startTime) / 1000;
    const status = metrics.errorRate > 0.1 ? 'down' : metrics.errorRate > 0.05 ? 'degraded' : 'healthy';

    const langCounts = new Map<Language, number>();
    const voiceCounts = new Map<string, number>();
    for (const key of this.metrics.keys()) {
      if (key.startsWith('language:')) {
        const lang = key.split(':')[1] as Language;
        langCounts.set(lang, (langCounts.get(lang) ?? 0) + 1);
      }
      if (key.startsWith('voice:')) {
        const voice = key.split(':')[1];
        voiceCounts.set(voice, (voiceCounts.get(voice) ?? 0) + 1);
      }
    }

    const topLanguages = [...langCounts.entries()]
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topVoices = [...voiceCounts.entries()]
      .map(([voice, count]) => ({ voice, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      metrics,
      uptime,
      status,
      recentErrors: this.errors.slice(-10),
      topLanguages,
      topVoices,
    };
  }

  recordError(error: Omit<VoiceError, 'id' | 'timestamp'>): void {
    this.errors.push({
      ...error,
      id: randomUUID(),
      timestamp: new Date(),
    });
  }

  reset(): void {
    this.metrics.clear();
    this.errors = [];
    this.startTime = Date.now();
  }
}
