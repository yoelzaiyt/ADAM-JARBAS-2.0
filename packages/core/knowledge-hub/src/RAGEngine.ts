import type {
  RAGEngine as IRAGEngine,
  RAGRequest,
  RAGContext,
  RAGResponse,
  SearchResult,
} from './interfaces.js';
import type { AIProviderName } from '@jarbas/types';
import type { RetrievalEngine } from './RetrievalEngine.js';
import type { RankingEngine } from './RankingEngine.js';

export class RAGEngine implements IRAGEngine {
  private retrievalEngine: RetrievalEngine;
  private rankingEngine: RankingEngine;

  constructor(retrievalEngine: RetrievalEngine, rankingEngine: RankingEngine) {
    this.retrievalEngine = retrievalEngine;
    this.rankingEngine = rankingEngine;
  }

  async getContext(request: RAGRequest): Promise<RAGContext> {
    const retrievalResult = await this.retrievalEngine.retrieve({
      query: request.query,
      tenantId: request.tenantId,
      topK: request.topK,
      filters: request.filters,
      strategy: request.strategy,
    });

    const searchResults: SearchResult[] = retrievalResult.chunks.map(
      (chunk, i) => ({
        chunk,
        score: retrievalResult.scores[i] ?? 0,
        distance: 1 - (retrievalResult.scores[i] ?? 0),
      }),
    );

    const rankedResults = this.rankingEngine.rank(searchResults);

    const totalTokens = rankedResults.reduce(
      (sum, r) => sum + r.chunk.tokenCount,
      0,
    );

    const seen = new Set<string>();
    const sources: {
      documentId: string;
      title: string;
      score: number;
    }[] = [];

    for (const result of rankedResults) {
      const docId = result.chunk.documentId;
      if (seen.has(docId)) continue;
      seen.add(docId);
      sources.push({
        documentId: docId,
        title: (result.chunk.metadata.title as string) ?? docId,
        score: result.score,
      });
    }

    return { chunks: rankedResults, totalTokens, sources };
  }

  async query(request: RAGRequest): Promise<RAGResponse> {
    const start = performance.now();
    const context = await this.getContext(request);

    const prompt = this.buildPrompt(request.query, context);
    const answer = this.generateMockAnswer(prompt, request.query);

    const latencyMs = performance.now() - start;

    return {
      answer,
      context,
      latencyMs,
      tokensUsed: context.totalTokens,
      model: 'mock-rag',
      provider: 'openrouter' as AIProviderName,
    };
  }

  async *queryStream(request: RAGRequest): AsyncIterable<string> {
    const response = await this.query(request);
    const words = response.answer.split(' ');

    for (const word of words) {
      yield word + ' ';
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  private buildPrompt(query: string, context: RAGContext): string {
    const contextBlocks = context.chunks
      .map(
        (r, i) =>
          `[${i + 1}] (score: ${r.score.toFixed(3)}) ${r.chunk.content}`,
      )
      .join('\n\n');

    return [
      'You are a helpful assistant. Answer the question based on the provided context.',
      '',
      'Context:',
      contextBlocks,
      '',
      `Question: ${query}`,
      '',
      'Answer:',
    ].join('\n');
  }

  private generateMockAnswer(prompt: string, query: string): string {
    return (
      `Based on the retrieved context, here is the answer to "${query}". ` +
      `The context provided ${prompt.length} characters of relevant information ` +
      `that was used to formulate this response.`
    );
  }
}
