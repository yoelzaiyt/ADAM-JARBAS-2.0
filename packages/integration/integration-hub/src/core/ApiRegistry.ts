import { generateId } from '@jarbas/utils';
import type {
  ApiEndpoint,
  ApiCategory,
  AuthType,
  ApiPriority,
  ApiStatus,
  DiscoveryQuery,
  DiscoveryResult,
} from '../interfaces.js';

export class ApiRegistry {
  private apis: Map<string, ApiEndpoint> = new Map();
  private categories: Map<string, ApiCategory> = new Map();

  constructor() {
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories(): void {
    const defaultCategories: ApiCategory[] = [
      { id: 'ai-ml', name: 'Machine Learning', description: 'AI/ML APIs for inference, training, and data processing', icon: 'brain', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'essential', tags: ['ai', 'ml', 'inference', 'training'] },
      { id: 'authentication', name: 'Authentication & Authorization', description: 'Identity, OAuth, and access control APIs', icon: 'shield', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'essential', tags: ['auth', 'oauth', 'identity', 'security'] },
      { id: 'business', name: 'Business', description: 'CRM, project management, and productivity APIs', icon: 'briefcase', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'important', tags: ['crm', 'project', 'productivity', 'saas'] },
      { id: 'calendar', name: 'Calendar', description: 'Scheduling, holidays, and time management APIs', icon: 'calendar', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'important', tags: ['scheduling', 'holidays', 'time'] },
      { id: 'cloud-storage', name: 'Cloud Storage & File Sharing', description: 'File upload, storage, and sharing APIs', icon: 'cloud', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'important', tags: ['storage', 'files', 'upload', 'cloud'] },
      { id: 'communication', name: 'Communication', description: 'Email, SMS, chat, and messaging APIs', icon: 'message', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'essential', tags: ['email', 'sms', 'chat', 'messaging'] },
      { id: 'cryptocurrency', name: 'Cryptocurrency', description: 'Crypto prices, trading, and blockchain APIs', icon: 'bitcoin', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'optional', tags: ['crypto', 'bitcoin', 'blockchain', 'trading'] },
      { id: 'currency', name: 'Currency Exchange', description: 'Foreign exchange rates and currency conversion', icon: 'dollar', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'important', tags: ['forex', 'currency', 'exchange', 'conversion'] },
      { id: 'development', name: 'Development', description: 'Developer tools, CI/CD, and code APIs', icon: 'code', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'essential', tags: ['dev', 'ci', 'code', 'github'] },
      { id: 'email', name: 'Email', description: 'Email validation, sending, and management', icon: 'mail', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'essential', tags: ['email', 'smtp', 'validation'] },
      { id: 'finance', name: 'Finance', description: 'Banking, payments, and financial data APIs', icon: 'wallet', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'important', tags: ['banking', 'payments', 'financial'] },
      { id: 'geocoding', name: 'Geocoding', description: 'Maps, geolocation, and location services', icon: 'map', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'important', tags: ['maps', 'geolocation', 'location'] },
      { id: 'security', name: 'Security', description: 'Threat detection, vulnerability scanning, and security APIs', icon: 'lock', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'essential', tags: ['security', 'threats', 'vulnerability'] },
      { id: 'social', name: 'Social', description: 'Social media and networking APIs', icon: 'users', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'optional', tags: ['social', 'networking', 'media'] },
      { id: 'weather', name: 'Weather', description: 'Weather forecasts, climate data, and environmental APIs', icon: 'cloud-sun', totalApis: 0, activeApis: 0, essentialCount: 0, importantCount: 0, priority: 'important', tags: ['weather', 'climate', 'forecast'] },
    ];

    for (const cat of defaultCategories) {
      this.categories.set(cat.id, cat);
    }
  }

  register(api: Omit<ApiEndpoint, 'id' | 'createdAt' | 'updatedAt'>): ApiEndpoint {
    const now = new Date();
    const endpoint: ApiEndpoint = {
      ...api,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this.apis.set(endpoint.id, endpoint);
    this.updateCategoryStats(endpoint.category);
    return endpoint;
  }

  unregister(id: string): boolean {
    const api = this.apis.get(id);
    if (!api) return false;
    this.apis.delete(id);
    this.updateCategoryStats(api.category);
    return true;
  }

  get(id: string): ApiEndpoint | undefined {
    return this.apis.get(id);
  }

  list(): ApiEndpoint[] {
    return Array.from(this.apis.values());
  }

  search(query: DiscoveryQuery): DiscoveryResult {
    let results = this.list();

    if (query.category) {
      results = results.filter(api => api.category === query.category);
    }
    if (query.auth) {
      results = results.filter(api => api.auth === query.auth);
    }
    if (query.https !== undefined) {
      results = results.filter(api => (query.https ? api.https === 'yes' : true));
    }
    if (query.cors !== undefined) {
      results = results.filter(api => (query.cors ? api.cors === 'yes' : true));
    }
    if (query.free !== undefined) {
      results = results.filter(api => (query.free ? api.pricing?.free === true : true));
    }
    if (query.tags && query.tags.length > 0) {
      results = results.filter(api => query.tags!.some(tag => api.tags.includes(tag)));
    }
    if (query.priority) {
      results = results.filter(api => api.priority === query.priority);
    }
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(api =>
        api.name.toLowerCase().includes(searchLower) ||
        api.description.toLowerCase().includes(searchLower) ||
        api.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    const suggestions = this.generateSuggestions(query);

    return {
      apis: results,
      total: results.length,
      filters: query,
      suggestions,
    };
  }

  private generateSuggestions(query: DiscoveryQuery): string[] {
    const suggestions: string[] = [];
    if (!query.https) suggestions.push('Consider filtering for HTTPS-only APIs for security');
    if (!query.auth) suggestions.push('APIs with OAuth provide better security than API keys');
    if (!query.cors) suggestions.push('CORS support is required for browser-based integrations');
    return suggestions;
  }

  getByCategory(categoryId: string): ApiEndpoint[] {
    return this.list().filter(api => api.category === categoryId);
  }

  getEssential(): ApiEndpoint[] {
    return this.list().filter(api => api.priority === 'essential');
  }

  getCategories(): ApiCategory[] {
    return Array.from(this.categories.values());
  }

  private updateCategoryStats(categoryId: string): void {
    const category = this.categories.get(categoryId);
    if (!category) return;

    const apis = this.getByCategory(categoryId);
    category.totalApis = apis.length;
    category.activeApis = apis.filter(a => a.status === 'active').length;
    category.essentialCount = apis.filter(a => a.priority === 'essential').length;
    category.importantCount = apis.filter(a => a.priority === 'important').length;
  }

  getStats(): {
    total: number;
    active: number;
    byPriority: Record<ApiPriority, number>;
    byStatus: Record<ApiStatus, number>;
    byAuth: Record<AuthType, number>;
    httpsOnly: number;
    corsEnabled: number;
    freeApis: number;
  } {
    const apis = this.list();
    return {
      total: apis.length,
      active: apis.filter(a => a.status === 'active').length,
      byPriority: {
        essential: apis.filter(a => a.priority === 'essential').length,
        important: apis.filter(a => a.priority === 'important').length,
        optional: apis.filter(a => a.priority === 'optional').length,
        experimental: apis.filter(a => a.priority === 'experimental').length,
      },
      byStatus: {
        active: apis.filter(a => a.status === 'active').length,
        deprecated: apis.filter(a => a.status === 'deprecated').length,
        sunset: apis.filter(a => a.status === 'sunset').length,
        maintenance: apis.filter(a => a.status === 'maintenance').length,
        unknown: apis.filter(a => a.status === 'unknown').length,
      },
      byAuth: {
        none: apis.filter(a => a.auth === 'none').length,
        apiKey: apis.filter(a => a.auth === 'apiKey').length,
        oauth: apis.filter(a => a.auth === 'oauth').length,
        basic: apis.filter(a => a.auth === 'basic').length,
        bearer: apis.filter(a => a.auth === 'bearer').length,
        custom: apis.filter(a => a.auth === 'custom').length,
      },
      httpsOnly: apis.filter(a => a.https === 'yes').length,
      corsEnabled: apis.filter(a => a.cors === 'yes').length,
      freeApis: apis.filter(a => a.pricing?.free === true).length,
    };
  }
}
