import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Telemetry } from '../Telemetry.js';

describe('Telemetry', () => {
  let telemetry: Telemetry;

  beforeEach(() => {
    telemetry = new Telemetry();
  });

  it('recordCounter adds metric', async () => {
    await telemetry.recordCounter('requests', 1, { env: 'prod' });
    const metrics = telemetry.getMetrics('requests');
    expect(metrics).toHaveLength(1);
    expect(metrics[0].type).toBe('counter');
    expect(metrics[0].name).toBe('requests');
    expect(metrics[0].value).toBe(1);
    expect(metrics[0].labels).toEqual({ env: 'prod' });
  });

  it('recordGauge adds metric', async () => {
    await telemetry.recordGauge('cpu', 75.5);
    const metrics = telemetry.getMetrics('cpu');
    expect(metrics).toHaveLength(1);
    expect(metrics[0].type).toBe('gauge');
    expect(metrics[0].value).toBe(75.5);
  });

  it('recordHistogram adds metric', async () => {
    await telemetry.recordHistogram('latency', 120);
    const metrics = telemetry.getMetrics('latency');
    expect(metrics).toHaveLength(1);
    expect(metrics[0].type).toBe('histogram');
    expect(metrics[0].value).toBe(120);
  });

  it('getMetrics returns all metrics', async () => {
    await telemetry.recordCounter('a', 1);
    await telemetry.recordGauge('b', 2);
    await telemetry.recordHistogram('c', 3);
    expect(telemetry.getMetrics()).toHaveLength(3);
  });

  it('getMetrics with name filter', async () => {
    await telemetry.recordCounter('requests', 1);
    await telemetry.recordCounter('requests', 2);
    await telemetry.recordGauge('cpu', 50);
    expect(telemetry.getMetrics('requests')).toHaveLength(2);
    expect(telemetry.getMetrics('cpu')).toHaveLength(1);
    expect(telemetry.getMetrics('nonexistent')).toHaveLength(0);
  });

  it('getSummary groups by name with count/sum/avg/min/max', async () => {
    await telemetry.recordHistogram('latency', 100);
    await telemetry.recordHistogram('latency', 200);
    await telemetry.recordHistogram('latency', 300);
    await telemetry.recordCounter('requests', 5);
    const summary = telemetry.getSummary();
    expect(summary['latency']).toEqual({ count: 3, sum: 600, avg: 200, min: 100, max: 300 });
    expect(summary['requests']).toEqual({ count: 1, sum: 5, avg: 5, min: 5, max: 5 });
  });

  it('old metrics (>1hr) are cleaned up', async () => {
    await telemetry.recordCounter('old', 1);
    const oldMetric = telemetry.getMetrics('old')[0];
    oldMetric.timestamp = new Date(Date.now() - 3600001);
    await telemetry.recordCounter('new', 2);
    const metrics = telemetry.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('new');
  });

  it('metrics have unique ids', async () => {
    await telemetry.recordCounter('x', 1);
    await telemetry.recordCounter('x', 2);
    const metrics = telemetry.getMetrics('x');
    expect(metrics[0].id).not.toBe(metrics[1].id);
  });

  it('metrics have timestamps', async () => {
    const before = Date.now();
    await telemetry.recordCounter('x', 1);
    const after = Date.now();
    const metric = telemetry.getMetrics('x')[0];
    const ts = metric.timestamp.getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});
