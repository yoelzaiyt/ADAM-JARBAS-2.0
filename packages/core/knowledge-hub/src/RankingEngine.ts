import type {
  RankingEngine as IRankingEngine,
  RankingCriteria,
  RankedResult,
  SearchResult,
  ContentChunk,
} from './interfaces.js';

export class RankingEngine implements IRankingEngine {
  constructor() {}

  getDefaultCriteria(): RankingCriteria {
    return {
      dateWeight: 0.15,
      authorityWeight: 0.2,
      popularityWeight: 0.1,
      relevanceWeight: 0.35,
      contextWeight: 0.1,
      feedbackWeight: 0.1,
    };
  }

  rank(results: SearchResult[], criteria?: RankingCriteria): RankedResult[] {
    const weights = criteria ?? this.getDefaultCriteria();
    const now = Date.now();

    const ranked: RankedResult[] = results.map((result, idx) => {
      const meta = result.chunk.metadata;

      const recencyScore = this.computeRecency(result.chunk, now);
      const authorityScore = (meta.authority as number) ?? 0.5;
      const contextScore = (meta.contextRelevance as number) ?? 0.5;
      const popularityScore = (meta.popularity as number) ?? 0.5;

      const weightedScore =
        (weights.relevanceWeight ?? 0.35) * result.score +
        (weights.dateWeight ?? 0.15) * recencyScore +
        (weights.authorityWeight ?? 0.2) * authorityScore +
        (weights.contextWeight ?? 0.1) * contextScore +
        (weights.popularityWeight ?? 0.1) * popularityScore;

      const criteriaScores: Record<string, number> = {
        relevance: result.score,
        recency: recencyScore,
        authority: authorityScore,
        context: contextScore,
        popularity: popularityScore,
        weighted: weightedScore,
      };

      const reasons: string[] = [];
      if (result.score > 0.8) reasons.push('high relevance');
      if (recencyScore > 0.8) reasons.push('recent document');
      if (authorityScore > 0.8) reasons.push('authoritative source');
      if (contextScore > 0.8) reasons.push('strong context match');

      return {
        chunk: result.chunk,
        score: weightedScore,
        ranking: 0,
        criteria: criteriaScores,
        rankingReason: reasons.length > 0 ? reasons.join(', ') : 'standard match',
      };
    });

    ranked.sort((a, b) => b.score - a.score);

    for (let i = 0; i < ranked.length; i++) {
      ranked[i].ranking = i + 1;
    }

    return ranked;
  }

  rerank(
    results: RankedResult[],
    userFeedback?: Record<string, number>,
  ): RankedResult[] {
    if (!userFeedback || Object.keys(userFeedback).length === 0) {
      return results;
    }

    const adjusted = results.map((result) => {
      const feedbackScore = userFeedback[result.chunk.id] ?? 0;
      const adjustedScore = result.score + feedbackScore;

      return {
        ...result,
        score: adjustedScore,
        criteria: {
          ...result.criteria,
          feedback: feedbackScore,
        },
        rankingReason:
          feedbackScore !== 0
            ? `${result.rankingReason} (feedback-adjusted)`
            : result.rankingReason,
      };
    });

    adjusted.sort((a, b) => b.score - a.score);

    for (let i = 0; i < adjusted.length; i++) {
      adjusted[i].ranking = i + 1;
    }

    return adjusted;
  }

  private computeRecency(chunk: ContentChunk, now: number): number {
    const createdAt = chunk.metadata.createdAt;
    if (!createdAt) return 0.5;

    const date =
      typeof createdAt === 'string'
        ? new Date(createdAt).getTime()
        : createdAt instanceof Date
          ? createdAt.getTime()
          : null;

    if (date === null) return 0.5;

    const ageMs = now - date;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    if (ageMs <= 0) return 1.0;
    if (ageMs > thirtyDaysMs) return Math.max(0, 1 - ageMs / (365 * 24 * 60 * 60 * 1000));

    return 1 - ageMs / thirtyDaysMs;
  }
}
