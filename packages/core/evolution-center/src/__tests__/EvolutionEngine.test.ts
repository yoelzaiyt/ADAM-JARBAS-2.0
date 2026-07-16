import { describe, it, expect } from 'vitest';
import { EvolutionEngine } from '../evolution-engine/EvolutionEngine.js';
import type { EvolutionConfig, PlatformMetrics } from '../interfaces.js';

describe('EvolutionEngine', () => {
  const config: EvolutionConfig = {
    enabled: true,
    analysisInterval: 3600000,
    confidenceThreshold: 0.7,
    autoApprove: false,
    metricsRetention: 30,
    alertChannels: ['slack']
  };

  const createMetrics = (overrides: Partial<PlatformMetrics> = {}): PlatformMetrics => ({
    timestamp: new Date(),
    totalUsers: 1000,
    activeUsers: 500,
    totalRequests: 10000,
    errorRate: 0.02,
    avgLatency: 200,
    totalCost: 5000,
    modulesUsed: ['hermes-core', 'knowledge-hub', 'voice-engine', 'meeting-ai', 'whatsapp-ai', 'email-ai'],
    ...overrides
  });

  it('creates EvolutionEngine', () => {
    const engine = new EvolutionEngine(config);
    expect(engine).toBeDefined();
  });

  it('analyzes platform with normal metrics', async () => {
    const engine = new EvolutionEngine(config);
    const results = await engine.analyzePlatform(createMetrics());
    expect(Array.isArray(results)).toBe(true);
  });

  it('detects low engagement', async () => {
    const engine = new EvolutionEngine(config);
    const results = await engine.analyzePlatform(createMetrics({ activeUsers: 50, totalUsers: 1000 }));
    expect(results.some(r => r.category === 'usage')).toBe(true);
  });

  it('detects high error rate', async () => {
    const engine = new EvolutionEngine(config);
    const results = await engine.analyzePlatform(createMetrics({ errorRate: 0.15 }));
    expect(results.some(r => r.category === 'errors')).toBe(true);
  });

  it('detects high latency', async () => {
    const engine = new EvolutionEngine(config);
    const results = await engine.analyzePlatform(createMetrics({ avgLatency: 3000 }));
    expect(results.some(r => r.category === 'bottlenecks')).toBe(true);
  });

  it('detects high costs', async () => {
    const engine = new EvolutionEngine(config);
    const results = await engine.analyzePlatform(createMetrics({ totalCost: 15000 }));
    expect(results.some(r => r.category === 'costs')).toBe(true);
  });

  it('generates recommendations', async () => {
    const engine = new EvolutionEngine(config);
    await engine.analyzePlatform(createMetrics({ errorRate: 0.1 }));
    const recs = engine.getAllRecommendations();
    expect(recs.length).toBeGreaterThan(0);
  });

  it('gets top recommendations', async () => {
    const engine = new EvolutionEngine(config);
    await engine.analyzePlatform(createMetrics({ errorRate: 0.15, avgLatency: 3000, totalCost: 15000 }));
    const top = engine.getTopRecommendations(5);
    expect(top.length).toBeGreaterThan(0);
    expect(top.length).toBeLessThanOrEqual(5);
  });

  it('tracks metrics history', async () => {
    const engine = new EvolutionEngine(config);
    await engine.analyzePlatform(createMetrics());
    await engine.analyzePlatform(createMetrics({ activeUsers: 600 }));
    expect(engine.getMetricsHistory().length).toBe(2);
  });

  it('gets all analyses', async () => {
    const engine = new EvolutionEngine(config);
    await engine.analyzePlatform(createMetrics({ errorRate: 0.1 }));
    const analyses = engine.getAllAnalyses();
    expect(analyses.length).toBeGreaterThan(0);
  });

  it('detects low module usage', async () => {
    const engine = new EvolutionEngine(config);
    const results = await engine.analyzePlatform(createMetrics({ modulesUsed: ['hermes-core'] }));
    expect(results.some(r => r.title.includes('module'))).toBe(true);
  });

  it('detects performance issues', async () => {
    const engine = new EvolutionEngine(config);
    const results = await engine.analyzePlatform(createMetrics({ avgLatency: 600 }));
    expect(results.some(r => r.category === 'performance')).toBe(true);
  });
});
