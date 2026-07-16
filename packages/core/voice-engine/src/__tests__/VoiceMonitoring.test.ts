import { describe, it, expect } from 'vitest';
import { VoiceMonitoring } from '../VoiceMonitoring.js';

describe('VoiceMonitoring', () => {
  const monitor = new VoiceMonitoring();

  it('should record and retrieve metrics', () => {
    monitor.recordMetric('totalRequests', 10);
    monitor.recordMetric('sttLatencyMs', 150);
    const metrics = monitor.getMetrics();
    expect(metrics.totalRequests).toBe(10);
    expect(metrics.sttLatencyMs).toBe(150);
  });

  it('should return zero metrics initially', () => {
    const m = new VoiceMonitoring();
    const metrics = m.getMetrics();
    expect(metrics.totalRequests).toBe(0);
    expect(metrics.errorRate).toBe(0);
    expect(metrics.estimatedCostUsd).toBe(0);
  });

  it('should record errors', () => {
    monitor.recordError({ module: 'stt', message: 'timeout', severity: 'high' });
    const metrics = monitor.getMetrics();
    expect(metrics.errorRate).toBeGreaterThan(0);
  });

  it('should get dashboard', () => {
    const dashboard = monitor.getDashboard();
    expect(dashboard.uptime).toBeGreaterThanOrEqual(0);
    expect(['healthy', 'degraded', 'down']).toContain(dashboard.status);
    expect(dashboard.metrics).toBeDefined();
  });

  it('should detect language usage', () => {
    monitor.recordMetric('language:pt', 1);
    monitor.recordMetric('language:en', 1);
    const metrics = monitor.getMetrics();
    expect(metrics.languagesUsed).toContain('pt');
    expect(metrics.languagesUsed).toContain('en');
  });

  it('should detect provider usage', () => {
    monitor.recordMetric('provider:whisper', 1);
    const metrics = monitor.getMetrics();
    expect(metrics.providersUsed).toContain('whisper');
  });

  it('should reset all data', () => {
    monitor.recordMetric('totalRequests', 999);
    monitor.recordError({ module: 'test', message: 'err', severity: 'low' });
    monitor.reset();
    const metrics = monitor.getMetrics();
    expect(metrics.totalRequests).toBe(0);
  });
});
