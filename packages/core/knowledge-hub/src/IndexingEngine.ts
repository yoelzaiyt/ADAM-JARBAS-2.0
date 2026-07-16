import type {
  IndexingEngine as IIndexingEngine,
  VectorStoreConfig,
  IndexRequest,
  IndexResult,
  SearchQuery,
  SearchResult,
  ContentChunk,
} from './interfaces.js';

type StoredChunk = ContentChunk & { vector: number[]; tenantId: string };

export class IndexingEngine implements IIndexingEngine {
  private collections: Map<string, Map<string, StoredChunk>> = new Map();
  private config: VectorStoreConfig;

  constructor(config: VectorStoreConfig) {
    this.config = config;
  }

  async index(request: IndexRequest): Promise<IndexResult> {
    const start = performance.now();
    const collectionName = request.collectionName ?? this.config.collectionName;
    let failed = 0;
    const errors: string[] = [];

    if (!this.collections.has(collectionName)) {
      this.collections.set(collectionName, new Map());
    }

    const collection = this.collections.get(collectionName)!;

    for (const chunk of request.chunks) {
      try {
        const embedding = chunk.embedding ?? [];
        if (embedding.length === 0) {
          failed++;
          errors.push(`Chunk ${chunk.id} has no embedding`);
          continue;
        }

        const stored: StoredChunk = {
          ...chunk,
          vector: embedding,
          tenantId: request.tenantId,
        };

        collection.set(chunk.id, stored);
      } catch (err) {
        failed++;
        errors.push(`Failed to index chunk ${chunk.id}: ${(err as Error).message}`);
      }
    }

    const latencyMs = performance.now() - start;

    return {
      indexed: request.chunks.length - failed,
      failed,
      errors: errors.length > 0 ? errors : undefined,
      latencyMs,
    };
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const collectionName = this.config.collectionName;
    const collection = this.collections.get(collectionName);
    if (!collection) return [];

    const threshold = query.threshold ?? -1;
    const results: SearchResult[] = [];

    for (const [, stored] of collection) {
      if (stored.tenantId !== query.tenantId) continue;

      const score = this.cosineSimilarity(query.vector, stored.vector);
      if (score < threshold) continue;

      const chunk: ContentChunk = {
        id: stored.id,
        documentId: stored.documentId,
        content: stored.content,
        index: stored.index,
        startOffset: stored.startOffset,
        endOffset: stored.endOffset,
        tokenCount: stored.tokenCount,
        strategy: stored.strategy,
        metadata: stored.metadata,
        embedding: stored.vector,
      };

      results.push({
        chunk,
        score,
        distance: 1 - score,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, query.topK);
  }

  async delete(documentId: string): Promise<void> {
    for (const [, collection] of this.collections) {
      for (const [chunkId, stored] of collection) {
        if (stored.documentId === documentId) {
          collection.delete(chunkId);
        }
      }
    }
  }

  async deleteCollection(collectionName: string): Promise<void> {
    this.collections.delete(collectionName);
  }

  async getCollections(): Promise<string[]> {
    return Array.from(this.collections.keys());
  }

  async getStats(collectionName: string): Promise<{ count: number; dimensions: number }> {
    const collection = this.collections.get(collectionName);
    if (!collection || collection.size === 0) {
      return { count: 0, dimensions: this.config.dimensions };
    }

    const dimensions = this.config.dimensions;

    return {
      count: collection.size,
      dimensions,
    };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }
}
