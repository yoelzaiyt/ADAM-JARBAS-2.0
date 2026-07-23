import { describe, it, expect, beforeEach } from 'vitest';
import { DecisionEngine } from '../DecisionEngine.js';
import type { DecisionInput } from '../interfaces.js';

function makeInput(overrides: Partial<DecisionInput> = {}): DecisionInput {
  return {
    request: { messages: [{ role: 'user', content: 'hello' }] },
    criteria: { strategy: 'balanced' },
    tenantId: 'test-tenant',
    ...overrides,
  };
}

describe('DecisionEngine', () => {
  let engine: DecisionEngine;

  beforeEach(() => {
    engine = new DecisionEngine();
  });

  it('decide with balanced strategy selects a provider', async () => {
    const result = await engine.decide(makeInput());
    expect(result.provider).toBeTruthy();
    expect(result.model).toBeTruthy();
    expect(result.score).toBeTypeOf('number');
    expect(result.reason).toBeTruthy();
    expect(Array.isArray(result.alternatives)).toBe(true);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('decide with cost-optimized selects cheapest', async () => {
    const result = await engine.decide(makeInput({
      criteria: { strategy: 'cost-optimized' },
    }));
    expect(result.provider).toBe('ollama');
    expect(result.reason).toContain('lowest-cost');
  });

  it('decide with latency-optimized selects fastest', async () => {
    const result = await engine.decide(makeInput({
      criteria: { strategy: 'latency-optimized' },
    }));
    expect(result.provider).toBe('opencode');
    expect(result.reason).toContain('lowest-latency');
  });

  it('decide with quality-first selects highest quality', async () => {
    const result = await engine.decide(makeInput({
      criteria: { strategy: 'quality-first' },
    }));
    expect(result.provider).toBe('hermes');
    expect(result.reason).toContain('highest-quality');
  });

  it('decide with round-robin rotates', async () => {
    const r1 = await engine.decide(makeInput({ criteria: { strategy: 'round-robin' } }));
    const r2 = await engine.decide(makeInput({ criteria: { strategy: 'round-robin' } }));
    expect(r1.reason).toContain('round-robin');
    expect(r2.reason).toContain('round-robin');
    expect(r1.provider).not.toBe(r2.provider);
  });

  it('getHistory returns decisions', async () => {
    await engine.decide(makeInput());
    await engine.decide(makeInput());
    const history = engine.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].provider).toBeTruthy();
    expect(history[1].provider).toBeTruthy();
  });

  it('getHistory with limit', async () => {
    await engine.decide(makeInput());
    await engine.decide(makeInput());
    await engine.decide(makeInput());
    expect(engine.getHistory(2)).toHaveLength(2);
  });

  it('getStats returns correct structure', async () => {
    await engine.decide(makeInput());
    await engine.decide(makeInput());
    const stats = engine.getStats();
    expect(stats.totalDecisions).toBe(2);
    expect(stats.avgDecisionTimeMs).toBeGreaterThanOrEqual(0);
    expect(stats.byProvider).toBeTypeOf('object');
    expect(stats.byStrategy).toBeTypeOf('object');
  });

  it('excluded providers are not selected', async () => {
    const result = await engine.decide(makeInput({
      criteria: {
        strategy: 'cost-optimized',
        excludedProviders: ['ollama'],
      },
    }));
    expect(result.provider).not.toBe('ollama');
  });

  it('preferred providers are prioritized', async () => {
    const result = await engine.decide(makeInput({
      criteria: {
        strategy: 'cost-optimized',
        preferredProviders: ['deepseek'],
      },
    }));
    expect(result.provider).toBe('deepseek');
  });

  it('preferred provider that is excluded falls back', async () => {
    const result = await engine.decide(makeInput({
      criteria: {
        strategy: 'balanced',
        preferredProviders: ['ollama'],
        excludedProviders: ['ollama'],
      },
    }));
    expect(result.provider).not.toBe('ollama');
  });
});
