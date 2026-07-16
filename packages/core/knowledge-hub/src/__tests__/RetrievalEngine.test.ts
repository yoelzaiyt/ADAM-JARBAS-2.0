import { describe, it, expect } from 'vitest';
import { RetrievalEngine } from '../RetrievalEngine.js';
import { EmbeddingEngine } from '../EmbeddingEngine.js';
import { IndexingEngine } from '../IndexingEngine.js';
import type { ContentChunk, VectorStoreConfig } from '../interfaces.js';

const VECTOR_STORE_CONFIG: VectorStoreConfig = {
  backend: 'pgvector',
  collectionName: 'test-retrieval-collection',
  dimensions: 128,
  distance: 'cosine',
};

function makeChunk(id: string, documentId: string, content: string, index: number): ContentChunk {
  return {
    id,
    documentId,
    content,
    index,
    startOffset: 0,
    endOffset: content.length,
    tokenCount: content.split(/\s+/).length,
    strategy: 'semantic',
    metadata: {},
  };
}

describe('RetrievalEngine', () => {
  function createEngine() {
    const embeddingEngine = new EmbeddingEngine({ dimensions: 128 });
    const indexingEngine = new IndexingEngine(VECTOR_STORE_CONFIG);
    const retrievalEngine = new RetrievalEngine(indexingEngine, embeddingEngine);
    return { embeddingEngine, indexingEngine, retrievalEngine };
  }

  async function indexTestData(indexingEngine: IndexingEngine, embeddingEngine: EmbeddingEngine) {
    const chunks = [
      makeChunk('chunk-1', 'doc-1', 'TypeScript is a strongly typed programming language that builds on JavaScript.', 0),
      makeChunk('chunk-2', 'doc-1', 'Python is a high-level general-purpose programming language.', 1),
      makeChunk('chunk-3', 'doc-2', 'Rust is a systems programming language focused on safety and performance.', 2),
      makeChunk('chunk-4', 'doc-2', 'Go is a statically typed language designed at Google for concurrent programming.', 3),
    ];

    const texts = chunks.map((c) => c.content);
    const embedResult = await embeddingEngine.embed(texts);

    for (let i = 0; i < chunks.length; i++) {
      chunks[i]!.embedding = embedResult.embeddings[i];
    }

    await indexingEngine.index({ chunks, tenantId: 'tenant-1' });
    return chunks;
  }

  it('should create with IndexingEngine and EmbeddingEngine instances', () => {
    const { retrievalEngine } = createEngine();
    expect(retrievalEngine).toBeInstanceOf(RetrievalEngine);
  });

  it('retrieve should return RetrievalResult with chunks and scores', async () => {
    const { indexingEngine, embeddingEngine, retrievalEngine } = createEngine();
    await indexTestData(indexingEngine, embeddingEngine);

    const result = await retrievalEngine.retrieve({
      query: 'programming language',
      tenantId: 'tenant-1',
      topK: 3,
    });

    expect(result).toHaveProperty('chunks');
    expect(result).toHaveProperty('scores');
    expect(result).toHaveProperty('queryEmbedding');
    expect(result).toHaveProperty('latencyMs');
    expect(result).toHaveProperty('totalCandidates');
    expect(Array.isArray(result.chunks)).toBe(true);
    expect(Array.isArray(result.scores)).toBe(true);
    expect(result.chunks.length).toBeGreaterThan(0);
    expect(result.scores.length).toBe(result.chunks.length);
    result.scores.forEach((score) => {
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(-1);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  it('retrieve should embed the query', async () => {
    const { indexingEngine, embeddingEngine, retrievalEngine } = createEngine();
    await indexTestData(indexingEngine, embeddingEngine);

    const result = await retrievalEngine.retrieve({
      query: 'TypeScript programming',
      tenantId: 'tenant-1',
    });

    expect(result.queryEmbedding.length).toBe(128);
    expect(result.queryEmbedding.every((v) => typeof v === 'number')).toBe(true);
  });

  it('retrieveWithRerank should over-fetch then prune', async () => {
    const { indexingEngine, embeddingEngine, retrievalEngine } = createEngine();
    await indexTestData(indexingEngine, embeddingEngine);

    const rerankTopK = 2;
    const result = await retrievalEngine.retrieveWithRerank(
      {
        query: 'programming language',
        tenantId: 'tenant-1',
      },
      rerankTopK,
    );

    expect(result.chunks.length).toBeLessThanOrEqual(rerankTopK);
    expect(result.scores.length).toBe(result.chunks.length);
    expect(result.totalCandidates).toBeGreaterThan(0);
  });

  it('retrieveWithRerank with no results should return empty arrays', async () => {
    const { retrievalEngine } = createEngine();

    const result = await retrievalEngine.retrieveWithRerank({
      query: 'quantum physics',
      tenantId: 'tenant-nonexistent',
    });

    expect(result.chunks).toEqual([]);
    expect(result.scores).toEqual([]);
    expect(result.totalCandidates).toBe(0);
  });

  it('results should be sorted by score (descending)', async () => {
    const { indexingEngine, embeddingEngine, retrievalEngine } = createEngine();
    await indexTestData(indexingEngine, embeddingEngine);

    const result = await retrievalEngine.retrieve({
      query: 'TypeScript programming language',
      tenantId: 'tenant-1',
      topK: 4,
    });

    for (let i = 1; i < result.scores.length; i++) {
      expect(result.scores[i]!).toBeLessThanOrEqual(result.scores[i - 1]!);
    }
  });

  it('retrieve should respect tenantId isolation', async () => {
    const { indexingEngine, embeddingEngine, retrievalEngine } = createEngine();

    const chunks = [
      makeChunk('a-1', 'doc-a', 'Document belonging to tenant A.', 0),
    ];
    const embedResult = await embeddingEngine.embed(chunks.map((c) => c.content));
    chunks[0]!.embedding = embedResult.embeddings[0];
    await indexingEngine.index({ chunks, tenantId: 'tenant-A' });

    const result = await retrievalEngine.retrieve({
      query: 'Document belonging to tenant A',
      tenantId: 'tenant-B',
      topK: 10,
    });

    expect(result.chunks.length).toBe(0);
    expect(result.totalCandidates).toBe(0);
  });
});
