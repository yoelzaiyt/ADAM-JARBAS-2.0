import { describe, it, expect } from 'vitest';
import { RankingEngine } from '../RankingEngine.js';
import type { ContentChunk, SearchResult, RankedResult, RankingCriteria } from '../interfaces.js';

function makeChunk(id: string, content: string, metadata: Record<string, unknown> = {}): ContentChunk {
  return {
    id,
    documentId: `doc-${id}`,
    content,
    index: 0,
    startOffset: 0,
    endOffset: content.length,
    tokenCount: content.split(/\s+/).length,
    strategy: 'semantic',
    metadata,
  };
}

function makeSearchResult(chunk: ContentChunk, score: number): SearchResult {
  return { chunk, score, distance: 1 - score };
}

const NOW = Date.now();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

describe('RankingEngine', () => {
  const engine = new RankingEngine();

  describe('getDefaultCriteria', () => {
    it('should return proper weights', () => {
      const criteria = engine.getDefaultCriteria();

      expect(criteria).toEqual({
        dateWeight: 0.15,
        authorityWeight: 0.2,
        popularityWeight: 0.1,
        relevanceWeight: 0.35,
        contextWeight: 0.1,
        feedbackWeight: 0.1,
      });

      const total =
        criteria.dateWeight! +
        criteria.authorityWeight! +
        criteria.popularityWeight! +
        criteria.relevanceWeight! +
        criteria.contextWeight!;
      expect(total).toBeCloseTo(0.9);
    });
  });

  describe('rank', () => {
    it('should produce RankedResult with ranking positions', () => {
      const results: SearchResult[] = [
        makeSearchResult(makeChunk('c1', 'first chunk'), 0.9),
        makeSearchResult(makeChunk('c2', 'second chunk'), 0.7),
        makeSearchResult(makeChunk('c3', 'third chunk'), 0.5),
      ];

      const ranked = engine.rank(results);

      expect(ranked.length).toBe(3);
      ranked.forEach((r) => {
        expect(r).toHaveProperty('chunk');
        expect(r).toHaveProperty('score');
        expect(r).toHaveProperty('ranking');
        expect(r).toHaveProperty('criteria');
        expect(r).toHaveProperty('rankingReason');
      });
    });

    it('should weight scores by criteria', () => {
      const now = new Date();
      const recentDate = new Date(NOW - ONE_DAY_MS);

      const results: SearchResult[] = [
        makeSearchResult(
          makeChunk('c1', 'chunk one', {
            authority: 0.9,
            contextRelevance: 0.8,
            popularity: 0.7,
            createdAt: recentDate.toISOString(),
          }),
          0.9,
        ),
        makeSearchResult(
          makeChunk('c2', 'chunk two', {
            authority: 0.2,
            contextRelevance: 0.2,
            popularity: 0.1,
          }),
          0.8,
        ),
      ];

      const ranked = engine.rank(results);
      const topResult = ranked[0]!;

      expect(topResult.criteria).toHaveProperty('relevance');
      expect(topResult.criteria).toHaveProperty('recency');
      expect(topResult.criteria).toHaveProperty('authority');
      expect(topResult.criteria).toHaveProperty('context');
      expect(topResult.criteria).toHaveProperty('popularity');
      expect(topResult.criteria).toHaveProperty('weighted');

      expect(topResult.criteria.weighted).toBeGreaterThan(0);
      expect(topResult.criteria.weighted).toBeLessThanOrEqual(1);
    });

    it('should generate rankingReason strings', () => {
      const results: SearchResult[] = [
        makeSearchResult(
          makeChunk('c1', 'chunk', {
            authority: 0.95,
            contextRelevance: 0.9,
          }),
          0.95,
        ),
      ];

      const ranked = engine.rank(results);

      expect(ranked[0]!.rankingReason).toBeTruthy();
      expect(typeof ranked[0]!.rankingReason).toBe('string');
      expect(ranked[0]!.rankingReason).toContain('high relevance');
    });

    it('should produce standard match reason for low scores', () => {
      const results: SearchResult[] = [
        makeSearchResult(makeChunk('c1', 'chunk', {}), 0.3),
      ];

      const ranked = engine.rank(results);
      expect(ranked[0]!.rankingReason).toBe('standard match');
    });

    it('should sort by weighted score descending', () => {
      const results: SearchResult[] = [
        makeSearchResult(makeChunk('c1', 'low', {}), 0.3),
        makeSearchResult(makeChunk('c2', 'high', {}), 0.95),
        makeSearchResult(makeChunk('c3', 'mid', {}), 0.6),
      ];

      const ranked = engine.rank(results);

      expect(ranked[0]!.chunk.id).toBe('c2');
      expect(ranked[1]!.chunk.id).toBe('c3');
      expect(ranked[2]!.chunk.id).toBe('c1');
    });
  });

  describe('rerank', () => {
    it('should adjust scores based on user feedback', () => {
      const results: SearchResult[] = [
        makeSearchResult(makeChunk('c1', 'chunk one'), 0.8),
        makeSearchResult(makeChunk('c2', 'chunk two'), 0.6),
      ];

      const ranked = engine.rank(results);
      const feedback: Record<string, number> = {
        c1: 0.2,
        c2: -0.3,
      };

      const reranked = engine.rerank(ranked, feedback);

      expect(reranked[0]!.chunk.id).toBe('c1');
      expect(reranked[0]!.criteria).toHaveProperty('feedback');
      expect(reranked[0]!.criteria.feedback).toBe(0.2);
      expect(reranked[0]!.rankingReason).toContain('feedback-adjusted');
      expect(reranked[1]!.criteria.feedback).toBe(-0.3);
    });

    it('should re-sort after feedback adjustment', () => {
      const results: SearchResult[] = [
        makeSearchResult(makeChunk('c1', 'chunk one'), 0.8),
        makeSearchResult(makeChunk('c2', 'chunk two'), 0.7),
      ];

      const ranked = engine.rank(results);
      const feedback: Record<string, number> = {
        c2: 0.5,
      };

      const reranked = engine.rerank(ranked, feedback);

      expect(reranked[0]!.chunk.id).toBe('c2');
    });

    it('should return unchanged results without feedback', () => {
      const results: SearchResult[] = [
        makeSearchResult(makeChunk('c1', 'chunk one'), 0.8),
        makeSearchResult(makeChunk('c2', 'chunk two'), 0.6),
      ];

      const ranked = engine.rank(results);
      const reranked = engine.rerank(ranked);

      expect(reranked).toEqual(ranked);
      expect(reranked[0]!.chunk.id).toBe('c1');
      expect(reranked[1]!.chunk.id).toBe('c2');
    });

    it('should return unchanged results with empty feedback', () => {
      const results: SearchResult[] = [
        makeSearchResult(makeChunk('c1', 'chunk one'), 0.8),
      ];

      const ranked = engine.rank(results);
      const reranked = engine.rerank(ranked, {});

      expect(reranked).toEqual(ranked);
    });
  });

  describe('ranking positions', () => {
    it('should be 1-based sequential', () => {
      const results: SearchResult[] = [
        makeSearchResult(makeChunk('c1', 'one'), 0.5),
        makeSearchResult(makeChunk('c2', 'two'), 0.8),
        makeSearchResult(makeChunk('c3', 'three'), 0.3),
        makeSearchResult(makeChunk('c4', 'four'), 0.9),
      ];

      const ranked = engine.rank(results);

      const rankings = ranked.map((r) => r.ranking).sort((a, b) => a - b);
      expect(rankings).toEqual([1, 2, 3, 4]);

      ranked.forEach((r, i) => {
        expect(r.ranking).toBe(i + 1);
      });
    });

    it('should reassign rankings after rerank', () => {
      const results: SearchResult[] = [
        makeSearchResult(makeChunk('c1', 'one'), 0.9),
        makeSearchResult(makeChunk('c2', 'two'), 0.7),
        makeSearchResult(makeChunk('c3', 'three'), 0.5),
      ];

      const ranked = engine.rank(results);

      const feedback: Record<string, number> = {
        c3: 1.0,
      };

      const reranked = engine.rerank(ranked, feedback);

      expect(reranked[0]!.ranking).toBe(1);
      expect(reranked[0]!.chunk.id).toBe('c3');
      reranked.forEach((r, i) => {
        expect(r.ranking).toBe(i + 1);
      });
    });
  });
});
