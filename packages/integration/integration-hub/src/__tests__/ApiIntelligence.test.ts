import { describe, it, expect, beforeEach } from 'vitest';
import { ApiIntelligence } from '../intelligence/ApiIntelligence.js';
import { ApiRegistry } from '../core/ApiRegistry.js';

describe('ApiIntelligence', () => {
  let intelligence: ApiIntelligence;
  let registry: ApiRegistry;

  beforeEach(() => {
    registry = new ApiRegistry();
    intelligence = new ApiIntelligence(registry);

    registry.register({
      name: 'OpenAI',
      description: 'GPT models API',
      baseUrl: 'https://api.openai.com/v1',
      documentation: 'https://platform.openai.com/docs',
      category: 'ai-ml',
      auth: 'apiKey',
      https: 'yes',
      cors: 'yes',
      priority: 'essential',
      status: 'active',
      tags: ['gpt', 'llm'],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
    });

    registry.register({
      name: 'Anthropic',
      description: 'Claude AI models',
      baseUrl: 'https://api.anthropic.com/v1',
      documentation: 'https://docs.anthropic.com',
      category: 'ai-ml',
      auth: 'apiKey',
      https: 'yes',
      cors: 'yes',
      priority: 'essential',
      status: 'active',
      tags: ['claude', 'llm'],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
    });
  });

  it('should discover APIs', () => {
    const result = intelligence.discover({ category: 'ai-ml' });
    expect(result.apis.length).toBeGreaterThanOrEqual(2);
  });

  it('should compare two APIs', () => {
    const apis = registry.list();
    const comparison = intelligence.compare(apis[0].id, apis[1].id);
    expect(comparison).toBeDefined();
    expect(comparison?.metrics).toBeDefined();
    expect(comparison?.recommendation).toBeDefined();
  });

  it('should find replacements', () => {
    const apis = registry.list();
    const replacements = intelligence.findReplacements(apis[0].id);
    expect(replacements.length).toBeGreaterThanOrEqual(1);
    expect(replacements[0].suggestedApi).toBeDefined();
  });

  it('should get recommendations', () => {
    const recommendations = intelligence.getRecommendations('ai-ml');
    expect(recommendations.length).toBeGreaterThanOrEqual(1);
  });

  it('should get trending APIs', () => {
    const trending = intelligence.getTrending();
    expect(trending.length).toBeGreaterThanOrEqual(1);
  });

  it('should return stats', () => {
    const stats = intelligence.getStats();
    expect(stats.totalApis).toBeGreaterThanOrEqual(2);
    expect(stats.categories).toBeGreaterThanOrEqual(1);
  });
});
