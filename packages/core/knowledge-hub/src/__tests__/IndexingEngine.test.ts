import { describe, it, expect, beforeEach } from 'vitest';
import { IndexingEngine } from '../IndexingEngine.js';
import type { ContentChunk, VectorStoreConfig } from '../interfaces.js';

function makeVector(dimensions: number, fill: number): number[] {
  return Array.from({ length: dimensions }, () => fill);
}

function makeChunk(
  id: string,
  documentId: string,
  embedding: number[],
  index = 0,
): ContentChunk {
  return {
    id,
    documentId,
    content: `Content for ${id}`,
    index,
    startOffset: 0,
    endOffset: 50,
    tokenCount: 10,
    strategy: 'semantic',
    metadata: {},
    embedding,
  };
}

const defaultConfig: VectorStoreConfig = {
  backend: 'pgvector',
  collectionName: 'test-collection',
  dimensions: 4,
  distance: 'cosine',
};

describe('IndexingEngine', () => {
  let engine: IndexingEngine;

  beforeEach(() => {
    engine = new IndexingEngine(defaultConfig);
  });

  describe('constructor', () => {
    it('creates with config', () => {
      expect(engine).toBeDefined();
    });
  });

  describe('index', () => {
    it('stores chunks', async () => {
      const chunks = [
        makeChunk('c1', 'doc1', [1, 0, 0, 0]),
        makeChunk('c2', 'doc1', [0, 1, 0, 0]),
      ];

      const result = await engine.index({
        chunks,
        tenantId: 'tenant-1',
      });

      expect(result.indexed).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('fails chunks with empty embeddings', async () => {
      const chunks = [makeChunk('c1', 'doc1', [])];

      const result = await engine.index({
        chunks,
        tenantId: 'tenant-1',
      });

      expect(result.indexed).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBe(1);
    });

    it('tracks latency', async () => {
      const chunks = [makeChunk('c1', 'doc1', [1, 0, 0, 0])];

      const result = await engine.index({
        chunks,
        tenantId: 'tenant-1',
      });

      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('indexes to custom collection', async () => {
      const chunks = [makeChunk('c1', 'doc1', [1, 0, 0, 0])];

      await engine.index({
        chunks,
        tenantId: 'tenant-1',
        collectionName: 'custom-collection',
      });

      const collections = await engine.getCollections();
      expect(collections).toContain('custom-collection');
    });
  });

  describe('search', () => {
    it('returns results sorted by similarity', async () => {
      await engine.index({
        chunks: [
          makeChunk('c1', 'doc1', [1, 0, 0, 0]),
          makeChunk('c2', 'doc1', [0, 1, 0, 0]),
          makeChunk('c3', 'doc1', [0, 0, 1, 0]),
        ],
        tenantId: 'tenant-1',
      });

      const results = await engine.search({
        vector: [1, 0, 0, 0],
        topK: 3,
        tenantId: 'tenant-1',
      });

      expect(results.length).toBe(3);
      expect(results[0]!.score).toBeGreaterThanOrEqual(results[1]!.score);
      expect(results[1]!.score).toBeGreaterThanOrEqual(results[2]!.score);
    });

    it('returns the most similar chunk first', async () => {
      await engine.index({
        chunks: [
          makeChunk('c1', 'doc1', [0.5, 0.5, 0, 0]),
          makeChunk('c2', 'doc1', [0.9, 0.1, 0, 0]),
        ],
        tenantId: 'tenant-1',
      });

      const results = await engine.search({
        vector: [1, 0, 0, 0],
        topK: 2,
        tenantId: 'tenant-1',
      });

      expect(results[0]!.chunk.id).toBe('c2');
    });

    it('search with threshold filters low scores', async () => {
      await engine.index({
        chunks: [
          makeChunk('c1', 'doc1', [1, 0, 0, 0]),
          makeChunk('c2', 'doc1', [0, 0, 0, 1]),
        ],
        tenantId: 'tenant-1',
      });

      const results = await engine.search({
        vector: [1, 0, 0, 0],
        topK: 10,
        tenantId: 'tenant-1',
        threshold: 0.9,
      });

      expect(results.length).toBe(1);
      expect(results[0]!.chunk.id).toBe('c1');
    });

    it('respects topK', async () => {
      await engine.index({
        chunks: [
          makeChunk('c1', 'doc1', [1, 0, 0, 0]),
          makeChunk('c2', 'doc1', [0, 1, 0, 0]),
          makeChunk('c3', 'doc1', [0, 0, 1, 0]),
        ],
        tenantId: 'tenant-1',
      });

      const results = await engine.search({
        vector: [1, 0, 0, 0],
        topK: 1,
        tenantId: 'tenant-1',
      });

      expect(results.length).toBe(1);
    });

    it('returns empty for non-existent collection', async () => {
      const fresh = new IndexingEngine({
        backend: 'pgvector',
        collectionName: 'non-existent',
        dimensions: 4,
      });

      const results = await fresh.search({
        vector: [1, 0, 0, 0],
        topK: 10,
        tenantId: 'tenant-1',
      });

      expect(results.length).toBe(0);
    });
  });

  describe('delete', () => {
    it('removes document chunks', async () => {
      await engine.index({
        chunks: [
          makeChunk('c1', 'doc1', [1, 0, 0, 0]),
          makeChunk('c2', 'doc1', [0, 1, 0, 0]),
          makeChunk('c3', 'doc2', [0, 0, 1, 0]),
        ],
        tenantId: 'tenant-1',
      });

      await engine.delete('doc1');

      const results = await engine.search({
        vector: [1, 0, 0, 0],
        topK: 10,
        tenantId: 'tenant-1',
      });

      expect(results.length).toBe(1);
      expect(results[0]!.chunk.documentId).toBe('doc2');
    });
  });

  describe('deleteCollection', () => {
    it('removes entire collection', async () => {
      await engine.index({
        chunks: [makeChunk('c1', 'doc1', [1, 0, 0, 0])],
        tenantId: 'tenant-1',
        collectionName: 'to-delete',
      });

      const before = await engine.getCollections();
      expect(before).toContain('to-delete');

      await engine.deleteCollection('to-delete');

      const after = await engine.getCollections();
      expect(after).not.toContain('to-delete');
    });
  });

  describe('getCollections', () => {
    it('returns collection names', async () => {
      await engine.index({
        chunks: [makeChunk('c1', 'doc1', [1, 0, 0, 0])],
        tenantId: 'tenant-1',
      });

      const collections = await engine.getCollections();
      expect(collections).toContain('test-collection');
    });

    it('returns empty array when no collections exist', async () => {
      const fresh = new IndexingEngine({
        backend: 'pgvector',
        collectionName: 'empty',
        dimensions: 4,
      });

      const collections = await fresh.getCollections();
      expect(collections).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('returns count and dimensions', async () => {
      await engine.index({
        chunks: [
          makeChunk('c1', 'doc1', [1, 0, 0, 0]),
          makeChunk('c2', 'doc1', [0, 1, 0, 0]),
        ],
        tenantId: 'tenant-1',
      });

      const stats = await engine.getStats('test-collection');

      expect(stats.count).toBe(2);
      expect(stats.dimensions).toBe(4);
    });

    it('returns zero count for empty collection', async () => {
      const stats = await engine.getStats('non-existent');

      expect(stats.count).toBe(0);
      expect(stats.dimensions).toBe(4);
    });
  });

  describe('cosine similarity', () => {
    it('identical vectors have similarity 1.0', async () => {
      await engine.index({
        chunks: [makeChunk('c1', 'doc1', [1, 0, 0, 0])],
        tenantId: 'tenant-1',
      });

      const results = await engine.search({
        vector: [1, 0, 0, 0],
        topK: 1,
        tenantId: 'tenant-1',
      });

      expect(results[0]!.score).toBeCloseTo(1.0, 5);
      expect(results[0]!.distance).toBeCloseTo(0.0, 5);
    });

    it('orthogonal vectors have similarity 0.0', async () => {
      await engine.index({
        chunks: [makeChunk('c1', 'doc1', [0, 1, 0, 0])],
        tenantId: 'tenant-1',
      });

      const results = await engine.search({
        vector: [1, 0, 0, 0],
        topK: 1,
        tenantId: 'tenant-1',
      });

      expect(results[0]!.score).toBeCloseTo(0.0, 5);
    });

    it('opposite vectors have similarity -1.0', async () => {
      await engine.index({
        chunks: [makeChunk('c1', 'doc1', [-1, 0, 0, 0])],
        tenantId: 'tenant-1',
      });

      const results = await engine.search({
        vector: [1, 0, 0, 0],
        topK: 1,
        tenantId: 'tenant-1',
        threshold: -1,
      });

      expect(results[0]!.score).toBeCloseTo(-1.0, 5);
    });
  });
});
