import { describe, it, expect } from 'vitest';
import { AIProviderSelection } from '../AIProviderSelection.js';

function createSelection() {
  return new AIProviderSelection();
}

describe('AIProviderSelection', () => {
  it('select returns a provider and model', async () => {
    const selection = createSelection();
    const result = await selection.select({ strategy: 'balanced' });

    expect(result.provider).toBeDefined();
    expect(result.model).toBeDefined();
    expect(typeof result.provider).toBe('string');
    expect(typeof result.model).toBe('string');
    expect(result.estimatedCostUsd).toBeGreaterThanOrEqual(0);
    expect(result.estimatedLatencyMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.reason).toBe('string');
  });

  it('select with cost-optimized strategy selects low-cost provider', async () => {
    const selection = createSelection();
    const result = await selection.select({ strategy: 'cost-optimized' });

    expect(result.provider).toBeDefined();
    expect(result.estimatedCostUsd).toBeLessThanOrEqual(0.003);
    expect(result.reason).toContain('cost');
  });

  it('select with latency-optimized strategy selects fast provider', async () => {
    const selection = createSelection();
    const result = await selection.select({ strategy: 'latency-optimized' });

    expect(result.provider).toBeDefined();
    expect(result.estimatedLatencyMs).toBeLessThanOrEqual(200);
    expect(result.reason).toContain('latency');
  });

  it('select with budget constraint filters providers', async () => {
    const selection = createSelection();
    const result = await selection.select({
      strategy: 'balanced',
      budget: { maxCostUsd: 0.001 },
    });

    expect(result.provider).toBeDefined();
    expect(result.estimatedCostUsd).toBeLessThanOrEqual(0.001);
  });

  it('getAvailableProviders returns list of providers', () => {
    const selection = createSelection();
    const providers = selection.getAvailableProviders();

    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
    expect(providers).toContain('ollama');
    expect(providers).toContain('deepseek');
  });

  it('getProviderHealth returns health status', async () => {
    const selection = createSelection();
    const health = await selection.getProviderHealth('ollama');

    expect(health.status).toBeDefined();
    expect(typeof health.latencyMs).toBe('number');
    expect(['healthy', 'degraded', 'unhealthy', 'unknown']).toContain(health.status);
  });

  it('works without registry/router (simulated mode)', async () => {
    const selection = new AIProviderSelection(undefined, undefined);

    const result = await selection.select({ strategy: 'balanced' });
    expect(result.provider).toBeDefined();

    const providers = selection.getAvailableProviders();
    expect(providers.length).toBeGreaterThan(0);

    const health = await selection.getProviderHealth('deepseek');
    expect(health.status).toBeDefined();
  });
});
