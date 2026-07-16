import { describe, it, expect } from 'vitest';
import { EmbeddingEngine } from '../EmbeddingEngine.js';

const engine = new EmbeddingEngine();

describe('EmbeddingEngine', () => {
  describe('constructor', () => {
    it('creates with default config', () => {
      const e = new EmbeddingEngine();
      expect(e).toBeDefined();
    });

    it('creates with custom config', () => {
      const e = new EmbeddingEngine({ provider: 'jina', dimensions: 768 });
      expect(e).toBeDefined();
    });
  });

  describe('embed', () => {
    it('returns proper EmbeddingResult shape', async () => {
      const result = await engine.embed(['hello world']);

      expect(result).toHaveProperty('embeddings');
      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('provider');
      expect(result).toHaveProperty('dimensions');
      expect(result).toHaveProperty('tokensUsed');
      expect(result).toHaveProperty('latencyMs');

      expect(Array.isArray(result.embeddings)).toBe(true);
      expect(result.embeddings.length).toBe(1);
      expect(typeof result.model).toBe('string');
      expect(result.provider).toBe('openai');
      expect(result.dimensions).toBe(1536);
      expect(typeof result.tokensUsed).toBe('number');
      expect(typeof result.latencyMs).toBe('number');
    });

    it('embeds multiple texts', async () => {
      const result = await engine.embed(['first', 'second', 'third']);

      expect(result.embeddings.length).toBe(3);
      expect(result.tokensUsed).toBeGreaterThan(0);
    });

    it('tracks latency', async () => {
      const result = await engine.embed(['test']);

      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('embedQuery', () => {
    it('returns a single vector', async () => {
      const vector = await engine.embedQuery('what is machine learning?');

      expect(Array.isArray(vector)).toBe(true);
      expect(vector.length).toBe(1536);
    });
  });

  describe('getProviders', () => {
    it('returns all 7 providers', () => {
      const providers = engine.getProviders();

      expect(providers).toEqual([
        'openai',
        'gemini',
        'sentence-transformers',
        'bge',
        'e5',
        'jina',
        'nomic',
      ]);
      expect(providers.length).toBe(7);
    });

    it('returns a copy', () => {
      const p1 = engine.getProviders();
      const p2 = engine.getProviders();
      expect(p1).toEqual(p2);
      expect(p1).not.toBe(p2);
    });
  });

  describe('getDimensions', () => {
    it('returns correct defaults per provider', () => {
      expect(engine.getDimensions('openai')).toBe(1536);
      expect(engine.getDimensions('gemini')).toBe(768);
      expect(engine.getDimensions('sentence-transformers')).toBe(384);
      expect(engine.getDimensions('bge')).toBe(768);
      expect(engine.getDimensions('e5')).toBe(384);
      expect(engine.getDimensions('jina')).toBe(768);
      expect(engine.getDimensions('nomic')).toBe(768);
    });
  });

  describe('normalization', () => {
    it('embeddings are L2-normalized (norm ≈ 1)', async () => {
      const result = await engine.embed(['normalize me']);

      for (const vector of result.embeddings) {
        const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
        expect(norm).toBeCloseTo(1.0, 5);
      }
    });

    it('query embeddings are also normalized', async () => {
      const vector = await engine.embedQuery('normalize me');

      const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
      expect(norm).toBeCloseTo(1.0, 5);
    });
  });

  describe('determinism', () => {
    it('same text produces same embedding', async () => {
      const r1 = await engine.embed(['deterministic test']);
      const r2 = await engine.embed(['deterministic test']);

      expect(r1.embeddings[0]).toEqual(r2.embeddings[0]);
    });

    it('different texts produce different embeddings', async () => {
      const r1 = await engine.embed(['cats are great']);
      const r2 = await engine.embed(['dogs are great']);

      expect(r1.embeddings[0]).not.toEqual(r2.embeddings[0]);
    });
  });

  describe('batch embedding', () => {
    it('handles batch embedding', async () => {
      const texts = Array.from({ length: 20 }, (_, i) => `batch item ${i}`);
      const result = await engine.embed(texts);

      expect(result.embeddings.length).toBe(20);
      for (const vec of result.embeddings) {
        expect(vec.length).toBe(1536);
      }
    });
  });

  describe('provider override', () => {
    it('uses override config when provided', async () => {
      const result = await engine.embed(['test'], { provider: 'jina', dimensions: 768 });

      expect(result.provider).toBe('jina');
      expect(result.dimensions).toBe(768);
      expect(result.embeddings[0]!.length).toBe(768);
    });
  });
});
