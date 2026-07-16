import type {
  ApiEndpoint,
  ApiComparison,
  ComparisonResult,
  ComparisonMetric,
  ReplacementSuggestion,
  DiscoveryQuery,
  DiscoveryResult,
} from '../interfaces.js';
import { ApiRegistry } from '../core/ApiRegistry.js';
import { createLogger } from '../Logger.js';

const log = createLogger({ module: 'ApiIntelligence' });

export class ApiIntelligence {
  private registry: ApiRegistry;

  constructor(registry: ApiRegistry) {
    this.registry = registry;
  }

  discover(query: DiscoveryQuery): DiscoveryResult {
    return this.registry.search(query);
  }

  compare(apiIdA: string, apiIdB: string): ApiComparison | undefined {
    const apiA = this.registry.get(apiIdA);
    const apiB = this.registry.get(apiIdB);
    if (!apiA || !apiB) return undefined;

    const metrics: Record<ComparisonMetric, ComparisonResult> = {
      latency: this.compareLatency(apiA, apiB),
      uptime: this.compareUptime(apiA, apiB),
      pricing: this.comparePricing(apiA, apiB),
      features: this.compareFeatures(apiA, apiB),
      auth: this.compareAuth(apiA, apiB),
      cors: this.compareCors(apiA, apiB),
      docs: this.compareDocs(apiA, apiB),
    };

    const scoresA = Object.values(metrics).filter(m => m.winner === 'apiA').length;
    const scoresB = Object.values(metrics).filter(m => m.winner === 'apiB').length;

    return {
      apiA: apiIdA,
      apiB: apiIdB,
      metrics,
      recommendation: scoresA > scoresB ? apiA.name : scoresA < scoresB ? apiB.name : 'Both are equivalent',
      confidence: Math.abs(scoresA - scoresB) / Object.keys(metrics).length,
    };
  }

  private compareLatency(a: ApiEndpoint, b: ApiEndpoint): ComparisonResult {
    const latencyA = a.rateLimit?.requests || 1000;
    const latencyB = b.rateLimit?.requests || 1000;
    return {
      winner: latencyA > latencyB ? 'apiA' : latencyA < latencyB ? 'apiB' : 'tie',
      scoreA: latencyA,
      scoreB: latencyB,
      explanation: `Rate limit: ${latencyA} vs ${latencyB} requests`,
    };
  }

  private compareUptime(a: ApiEndpoint, b: ApiEndpoint): ComparisonResult {
    const uptimeA = a.status === 'active' ? 100 : 0;
    const uptimeB = b.status === 'active' ? 100 : 0;
    return {
      winner: uptimeA > uptimeB ? 'apiA' : uptimeA < uptimeB ? 'apiB' : 'tie',
      scoreA: uptimeA,
      scoreB: uptimeB,
      explanation: `Status: ${a.status} vs ${b.status}`,
    };
  }

  private comparePricing(a: ApiEndpoint, b: ApiEndpoint): ComparisonResult {
    const freeA = a.pricing?.free ? 1 : 0;
    const freeB = b.pricing?.free ? 1 : 0;
    return {
      winner: freeA > freeB ? 'apiA' : freeA < freeB ? 'apiB' : 'tie',
      scoreA: freeA,
      scoreB: freeB,
      explanation: `Free tier: ${a.pricing?.free ? 'Yes' : 'No'} vs ${b.pricing?.free ? 'Yes' : 'No'}`,
    };
  }

  private compareFeatures(a: ApiEndpoint, b: ApiEndpoint): ComparisonResult {
    const featuresA = a.tags.length;
    const featuresB = b.tags.length;
    return {
      winner: featuresA > featuresB ? 'apiA' : featuresA < featuresB ? 'apiB' : 'tie',
      scoreA: featuresA,
      scoreB: featuresB,
      explanation: `Tags/features: ${featuresA} vs ${featuresB}`,
    };
  }

  private compareAuth(a: ApiEndpoint, b: ApiEndpoint): ComparisonResult {
    const secureA = a.auth === 'oauth' ? 3 : a.auth === 'apiKey' ? 2 : a.auth === 'bearer' ? 2 : 1;
    const secureB = b.auth === 'oauth' ? 3 : b.auth === 'apiKey' ? 2 : b.auth === 'bearer' ? 2 : 1;
    return {
      winner: secureA > secureB ? 'apiA' : secureA < secureB ? 'apiB' : 'tie',
      scoreA: secureA,
      scoreB: secureB,
      explanation: `Auth type: ${a.auth} vs ${b.auth}`,
    };
  }

  private compareCors(a: ApiEndpoint, b: ApiEndpoint): ComparisonResult {
    const corsA = a.cors === 'yes' ? 1 : 0;
    const corsB = b.cors === 'yes' ? 1 : 0;
    return {
      winner: corsA > corsB ? 'apiA' : corsA < corsB ? 'apiB' : 'tie',
      scoreA: corsA,
      scoreB: corsB,
      explanation: `CORS: ${a.cors} vs ${b.cors}`,
    };
  }

  private compareDocs(a: ApiEndpoint, b: ApiEndpoint): ComparisonResult {
    const docsA = a.documentation ? 1 : 0;
    const docsB = b.documentation ? 1 : 0;
    return {
      winner: docsA > docsB ? 'apiA' : docsA < docsB ? 'apiB' : 'tie',
      scoreA: docsA,
      scoreB: docsB,
      explanation: `Documentation: ${a.documentation ? 'Available' : 'Missing'} vs ${b.documentation ? 'Available' : 'Missing'}`,
    };
  }

  findReplacements(apiId: string): ReplacementSuggestion[] {
    const api = this.registry.get(apiId);
    if (!api) return [];

    const sameCategory = this.registry.getByCategory(api.category)
      .filter(a => a.id !== apiId && a.status === 'active');

    return sameCategory.map(candidate => ({
      currentApi: apiId,
      suggestedApi: candidate.id,
      reason: this.generateReplacementReason(api, candidate),
      similarity: this.calculateSimilarity(api, candidate),
      migrationEffort: this.estimateMigrationEffort(api, candidate),
      benefits: this.identifyBenefits(api, candidate),
      risks: this.identifyRisks(api, candidate),
    })).sort((a, b) => b.similarity - a.similarity);
  }

  private generateReplacementReason(current: ApiEndpoint, candidate: ApiEndpoint): string {
    const reasons: string[] = [];

    if (candidate.pricing?.free && !current.pricing?.free) {
      reasons.push('Free tier available');
    }
    if (candidate.https === 'yes' && current.https === 'no') {
      reasons.push('HTTPS support');
    }
    if (candidate.cors === 'yes' && current.cors === 'no') {
      reasons.push('CORS support');
    }
    if (candidate.status === 'active' && current.status !== 'active') {
      reasons.push('Active maintenance');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'Alternative option in same category';
  }

  private calculateSimilarity(a: ApiEndpoint, b: ApiEndpoint): number {
    let score = 0;
    if (a.category === b.category) score += 0.4;
    if (a.auth === b.auth) score += 0.2;
    if (a.https === b.https) score += 0.1;
    if (a.cors === b.cors) score += 0.1;

    const commonTags = a.tags.filter(t => b.tags.includes(t));
    score += (commonTags.length / Math.max(a.tags.length, b.tags.length)) * 0.2;

    return Math.round(score * 100) / 100;
  }

  private estimateMigrationEffort(a: ApiEndpoint, b: ApiEndpoint): 'trivial' | 'easy' | 'medium' | 'hard' {
    if (a.auth === b.auth && a.category === b.category) return 'trivial';
    if (a.auth === b.auth) return 'easy';
    if (a.category === b.category) return 'medium';
    return 'hard';
  }

  private identifyBenefits(current: ApiEndpoint, candidate: ApiEndpoint): string[] {
    const benefits: string[] = [];
    if (candidate.pricing?.free && !current.pricing?.free) benefits.push('Cost savings');
    if (candidate.https === 'yes' && current.https === 'no') benefits.push('Better security');
    if (candidate.cors === 'yes' && current.cors === 'no') benefits.push('Browser compatibility');
    return benefits;
  }

  private identifyRisks(current: ApiEndpoint, candidate: ApiEndpoint): string[] {
    const risks: string[] = [];
    if (candidate.status !== 'active') risks.push('May not be actively maintained');
    if (candidate.auth !== current.auth) risks.push('Different authentication mechanism');
    return risks;
  }

  getRecommendations(category?: string): ApiEndpoint[] {
    let apis = this.registry.getEssential();
    if (category) {
      apis = apis.filter(a => a.category === category);
    }
    return apis;
  }

  getTrending(): ApiEndpoint[] {
    return this.registry.list()
      .filter(a => a.status === 'active' && a.priority === 'essential')
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 20);
  }

  getStats(): {
    totalApis: number;
    essentialApis: number;
    categories: number;
    avgSimilarity: number;
  } {
    const apis = this.registry.list();
    const categories = new Set(apis.map(a => a.category));
    return {
      totalApis: apis.length,
      essentialApis: apis.filter(a => a.priority === 'essential').length,
      categories: categories.size,
      avgSimilarity: 0,
    };
  }
}
