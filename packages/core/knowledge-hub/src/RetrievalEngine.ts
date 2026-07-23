import type {
  RetrievalEngine as IRetrievalEngine,
  RetrievalRequest,
  RetrievalResult,
  ContentChunk,
} from './interfaces.js';
import type { IndexingEngine } from './IndexingEngine.js';
import type { EmbeddingEngine } from './EmbeddingEngine.js';

export class RetrievalEngine implements IRetrievalEngine {
  private indexingEngine: IndexingEngine;
  private embeddingEngine: EmbeddingEngine;

  constructor(indexingEngine: IndexingEngine, embeddingEngine: EmbeddingEngine) {
    this.indexingEngine = indexingEngine;
    this.embeddingEngine = embeddingEngine;
  }

  async retrieve(request: RetrievalRequest): Promise<RetrievalResult> {
    const start = performance.now();
    const topK = request.topK ?? 10;

    const queryEmbedding = await this.embeddingEngine.embedQuery(request.query);

    const searchResults = await this.indexingEngine.search({
      vector: queryEmbedding,
      topK,
      tenantId: request.tenantId,
      filters: request.filters,
    });

    const latencyMs = performance.now() - start;

    return {
      chunks: searchResults.map((r) => r.chunk),
      scores: searchResults.map((r) => r.score),
      queryEmbedding,
      latencyMs,
      totalCandidates: searchResults.length,
    };
  }

  async retrieveWithRerank(
    request: RetrievalRequest,
    rerankTopK?: number,
  ): Promise<RetrievalResult> {
    const start = performance.now();
    const topK = 50;
    const finalK = rerankTopK ?? 10;

    const queryEmbedding = await this.embeddingEngine.embedQuery(request.query);

    const searchResults = await this.indexingEngine.search({
      vector: queryEmbedding,
      topK,
      tenantId: request.tenantId,
      filters: request.filters,
    });

    if (searchResults.length === 0) {
      return {
        chunks: [],
        scores: [],
        queryEmbedding,
        latencyMs: performance.now() - start,
        totalCandidates: 0,
      };
    }

    const chunks = searchResults.map((r) => r.chunk);
    const scores = searchResults.map((r) => r.score);
    const embeddings = chunks.map((c) => c.embedding ?? []);

    const reranked = this.mmrRank(chunks, scores, embeddings, finalK, 0.5);

    const latencyMs = performance.now() - start;

    return {
      chunks: reranked.map((r) => r.chunk),
      scores: reranked.map((r) => r.score),
      queryEmbedding,
      latencyMs,
      totalCandidates: searchResults.length,
    };
  }

  private mmrRank(
    chunks: ContentChunk[],
    scores: number[],
    embeddings: number[][],
    topK: number,
    lambda: number,
  ): { chunk: ContentChunk; score: number }[] {
    const selected: { chunk: ContentChunk; score: number }[] = [];
    const remaining = chunks.map((chunk, i) => ({
      chunk,
      score: scores[i],
      index: i,
    }));

    while (remaining.length > 0 && selected.length < topK) {
      let bestIdx = -1;
      let bestMmrScore = -Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const relevanceScore = remaining[i].score;

        let maxSimilarity = 0;
        for (const sel of selected) {
          const sim = this.cosineSimilarity(
            embeddings[remaining[i].index],
            embeddings[chunks.indexOf(sel.chunk)],
          );
          if (sim > maxSimilarity) {
            maxSimilarity = sim;
          }
        }

        const mmrScore = lambda * relevanceScore - (1 - lambda) * maxSimilarity;

        if (mmrScore > bestMmrScore) {
          bestMmrScore = mmrScore;
          bestIdx = i;
        }
      }

      if (bestIdx >= 0) {
        const item = remaining.splice(bestIdx, 1)[0];
        selected.push({ chunk: item.chunk, score: item.score });
      }
    }

    return selected;
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
