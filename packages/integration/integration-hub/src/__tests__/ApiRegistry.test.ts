import { describe, it, expect, beforeEach } from 'vitest';
import { ApiRegistry } from '../core/ApiRegistry.js';

describe('ApiRegistry', () => {
  let registry: ApiRegistry;

  beforeEach(() => {
    registry = new ApiRegistry();
  });

  it('should create registry with default categories', () => {
    const categories = registry.getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.map(c => c.name)).toContain('Machine Learning');
    expect(categories.map(c => c.name)).toContain('Security');
    expect(categories.map(c => c.name)).toContain('Email');
  });

  it('should register an API endpoint', () => {
    const api = registry.register({
      name: 'Test API',
      description: 'A test API',
      baseUrl: 'https://api.test.com',
      documentation: 'https://docs.test.com',
      category: 'ai-ml',
      auth: 'apiKey',
      https: 'yes',
      cors: 'yes',
      priority: 'essential',
      status: 'active',
      tags: ['test'],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
    });

    expect(api.id).toBeDefined();
    expect(api.name).toBe('Test API');
    expect(api.createdAt).toBeInstanceOf(Date);
  });

  it('should unregister an API endpoint', () => {
    const api = registry.register({
      name: 'Test API',
      description: 'A test API',
      baseUrl: 'https://api.test.com',
      documentation: 'https://docs.test.com',
      category: 'ai-ml',
      auth: 'apiKey',
      https: 'yes',
      cors: 'yes',
      priority: 'essential',
      status: 'active',
      tags: ['test'],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
    });

    const removed = registry.unregister(api.id);
    expect(removed).toBe(true);
    expect(registry.get(api.id)).toBeUndefined();
  });

  it('should get API by ID', () => {
    const api = registry.register({
      name: 'Test API',
      description: 'A test API',
      baseUrl: 'https://api.test.com',
      documentation: 'https://docs.test.com',
      category: 'ai-ml',
      auth: 'apiKey',
      https: 'yes',
      cors: 'yes',
      priority: 'essential',
      status: 'active',
      tags: ['test'],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
    });

    const found = registry.get(api.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Test API');
  });

  it('should list all APIs', () => {
    registry.register({
      name: 'API 1',
      description: 'First',
      baseUrl: 'https://api1.com',
      documentation: 'https://docs1.com',
      category: 'ai-ml',
      auth: 'apiKey',
      https: 'yes',
      cors: 'yes',
      priority: 'essential',
      status: 'active',
      tags: [],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
    });

    registry.register({
      name: 'API 2',
      description: 'Second',
      baseUrl: 'https://api2.com',
      documentation: 'https://docs2.com',
      category: 'email',
      auth: 'none',
      https: 'yes',
      cors: 'no',
      priority: 'optional',
      status: 'active',
      tags: [],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
    });

    const apis = registry.list();
    expect(apis.length).toBeGreaterThanOrEqual(2);
  });

  it('should search APIs by category', () => {
    registry.register({
      name: 'AI API',
      description: 'AI test',
      baseUrl: 'https://ai.test.com',
      documentation: 'https://ai.docs.com',
      category: 'ai-ml',
      auth: 'apiKey',
      https: 'yes',
      cors: 'yes',
      priority: 'essential',
      status: 'active',
      tags: ['ai'],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
    });

    const result = registry.search({ category: 'ai-ml' });
    expect(result.apis.length).toBeGreaterThanOrEqual(1);
    expect(result.apis.every(a => a.category === 'ai-ml')).toBe(true);
  });

  it('should search APIs by auth type', () => {
    registry.register({
      name: 'No Auth API',
      description: 'Open API',
      baseUrl: 'https://open.test.com',
      documentation: 'https://open.docs.com',
      category: 'development',
      auth: 'none',
      https: 'yes',
      cors: 'yes',
      priority: 'optional',
      status: 'active',
      tags: [],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
    });

    const result = registry.search({ auth: 'none' });
    expect(result.apis.length).toBeGreaterThanOrEqual(1);
  });

  it('should search APIs by text', () => {
    registry.register({
      name: 'Weather Service',
      description: 'Get weather data',
      baseUrl: 'https://weather.test.com',
      documentation: 'https://weather.docs.com',
      category: 'weather',
      auth: 'apiKey',
      https: 'yes',
      cors: 'yes',
      priority: 'essential',
      status: 'active',
      tags: ['weather', 'forecast'],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
    });

    const result = registry.search({ search: 'weather' });
    expect(result.apis.length).toBeGreaterThanOrEqual(1);
  });

  it('should return stats', () => {
    registry.register({
      name: 'Essential API',
      description: 'Essential',
      baseUrl: 'https://essential.test.com',
      documentation: 'https://essential.docs.com',
      category: 'ai-ml',
      auth: 'apiKey',
      https: 'yes',
      cors: 'yes',
      priority: 'essential',
      status: 'active',
      tags: [],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
    });

    const stats = registry.getStats();
    expect(stats.total).toBeGreaterThanOrEqual(1);
    expect(stats.active).toBeGreaterThanOrEqual(1);
    expect(stats.byPriority.essential).toBeGreaterThanOrEqual(1);
  });

  it('should get APIs by category', () => {
    registry.register({
      name: 'Security API',
      description: 'Security test',
      baseUrl: 'https://security.test.com',
      documentation: 'https://security.docs.com',
      category: 'security',
      auth: 'apiKey',
      https: 'yes',
      cors: 'yes',
      priority: 'essential',
      status: 'active',
      tags: ['security'],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
    });

    const apis = registry.getByCategory('security');
    expect(apis.length).toBeGreaterThanOrEqual(1);
  });

  it('should get essential APIs', () => {
    registry.register({
      name: 'Essential',
      description: 'Essential API',
      baseUrl: 'https://essential.test.com',
      documentation: 'https://essential.docs.com',
      category: 'ai-ml',
      auth: 'apiKey',
      https: 'yes',
      cors: 'yes',
      priority: 'essential',
      status: 'active',
      tags: [],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
    });

    const essentials = registry.getEssential();
    expect(essentials.length).toBeGreaterThanOrEqual(1);
    expect(essentials.every(a => a.priority === 'essential')).toBe(true);
  });
});
