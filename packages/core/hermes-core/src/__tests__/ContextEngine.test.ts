import { describe, it, expect } from 'vitest';
import { ContextEngine } from '../ContextEngine.js';
import type { ContextAssemblyRequest, ContextSource, Logger } from '../interfaces.js';

const logger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

function makeSource(overrides?: Partial<ContextSource>): ContextSource {
  return {
    type: 'memory',
    content: 'some content here',
    priority: 1,
    tokensEstimate: 0,
    ...overrides,
  };
}

function makeRequest(overrides?: Partial<ContextAssemblyRequest>): ContextAssemblyRequest {
  return {
    sessionId: 's1',
    tenantId: 't1',
    query: 'what is the answer',
    maxTokens: 500,
    sources: [
      makeSource({ content: 'source A', priority: 2, tokensEstimate: 10 }),
      makeSource({ content: 'source B', priority: 1, tokensEstimate: 10 }),
    ],
    ...overrides,
  };
}

describe('ContextEngine', () => {
  describe('assemble', () => {
    it('returns window with sources sorted by priority', async () => {
      const engine = new ContextEngine(logger);
      const result = await engine.assemble(makeRequest());

      expect(result.window).toBeDefined();
      expect(result.window.messages.length).toBeGreaterThan(0);
      expect(result.sourcesUsed.length).toBe(2);
      expect(result.sourcesUsed[0].content).toBe('source A');
      expect(result.sourcesUsed[1].content).toBe('source B');
    });

    it('respects maxTokens', async () => {
      const engine = new ContextEngine(logger);
      const result = await engine.assemble(
        makeRequest({
          maxTokens: 5,
          sources: [
            makeSource({ content: 'a very long piece of content that exceeds the budget', tokensEstimate: 100 }),
          ],
        }),
      );

      expect(result.window.currentTokens).toBeLessThanOrEqual(5);
    });

    it('truncates when over limit', async () => {
      const engine = new ContextEngine(logger);
      const result = await engine.assemble(
        makeRequest({
          maxTokens: 10,
          sources: [
            makeSource({ content: 'a'.repeat(200), tokensEstimate: 50 }),
          ],
        }),
      );

      expect(result.truncated).toBe(true);
    });
  });

  describe('addSource / removeSource', () => {
    it('manages sources', () => {
      const engine = new ContextEngine(logger);
      expect(engine.getSources().length).toBe(0);

      engine.addSource(makeSource({ content: 's1' }));
      engine.addSource(makeSource({ content: 's2' }));
      expect(engine.getSources().length).toBe(2);

      engine.removeSource('0');
      expect(engine.getSources().length).toBe(1);
    });
  });

  describe('getSources', () => {
    it('returns all sources', () => {
      const engine = new ContextEngine(logger);
      engine.addSource(makeSource({ content: 'a', priority: 1 }));
      engine.addSource(makeSource({ content: 'b', priority: 2 }));

      const sources = engine.getSources();
      expect(sources.length).toBe(2);
    });
  });

  describe('estimateTokens', () => {
    it('estimates correctly for ASCII text', () => {
      const engine = new ContextEngine(logger);
      const tokens = engine.estimateTokens('abcd');
      expect(tokens).toBe(1);
    });

    it('estimates correctly for empty string', () => {
      const engine = new ContextEngine(logger);
      expect(engine.estimateTokens('')).toBe(0);
    });
  });
});
