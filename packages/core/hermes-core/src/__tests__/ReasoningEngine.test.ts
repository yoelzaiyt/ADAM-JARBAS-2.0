import { describe, it, expect } from 'vitest';
import { ReasoningEngine } from '../ReasoningEngine.js';
import type { ReasoningInput, Logger } from '../interfaces.js';

const logger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

function makeInput(overrides?: Partial<ReasoningInput>): ReasoningInput {
  return {
    query: 'How should we optimize the database performance?',
    context: [],
    mode: 'chain-of-thought',
    tenantId: 't1',
    ...overrides,
  };
}

describe('ReasoningEngine', () => {
  const engine = new ReasoningEngine(logger);

  describe('reason', () => {
    it('chain-of-thought returns steps and conclusion', async () => {
      const result = await engine.reason(makeInput({ mode: 'chain-of-thought' }));

      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.conclusion).toBeTruthy();
      expect(result.mode).toBe('chain-of-thought');
    });

    it('tree-of-thought returns steps', async () => {
      const result = await engine.reason(makeInput({ mode: 'tree-of-thought' }));

      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.mode).toBe('tree-of-thought');
    });

    it('reflective returns steps', async () => {
      const result = await engine.reason(makeInput({ mode: 'reflective' }));

      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.mode).toBe('reflective');
    });

    it('multi-perspective returns steps', async () => {
      const result = await engine.reason(makeInput({ mode: 'multi-perspective' }));

      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.mode).toBe('multi-perspective');
    });

    it('result has correct structure', async () => {
      const result = await engine.reason(makeInput());

      expect(result).toHaveProperty('conclusion');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('steps');
      expect(result).toHaveProperty('mode');
      expect(result).toHaveProperty('latencyMs');
      expect(result).toHaveProperty('tokensUsed');
      expect(typeof result.conclusion).toBe('string');
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.latencyMs).toBe('number');
      expect(typeof result.tokensUsed).toBe('number');
      expect(result.tokensUsed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getChain', () => {
    it('returns chain by id after reasoning', async () => {
      const engine2 = new ReasoningEngine(logger);
      await engine2.reason(makeInput());

      const history = engine2.getHistory();
      expect(history.length).toBe(1);

      const chain = await engine2.getChain(history[0].id);
      expect(chain).not.toBeNull();
      expect(chain!.id).toBe(history[0].id);
    });

    it('returns null for nonexistent id', async () => {
      const chain = await engine.getChain('nonexistent');
      expect(chain).toBeNull();
    });
  });

  describe('getHistory', () => {
    it('returns reasoning chains', async () => {
      const engine2 = new ReasoningEngine(logger);
      await engine2.reason(makeInput());
      await engine2.reason(makeInput({ query: 'second query' }));

      const history = engine2.getHistory();
      expect(history.length).toBe(2);
    });

    it('respects limit parameter', async () => {
      const engine2 = new ReasoningEngine(logger);
      await engine2.reason(makeInput());
      await engine2.reason(makeInput());
      await engine2.reason(makeInput());

      const limited = engine2.getHistory(2);
      expect(limited.length).toBe(2);
    });
  });
});
