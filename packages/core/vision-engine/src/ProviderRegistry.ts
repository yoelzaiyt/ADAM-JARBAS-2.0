// ─── Provider Registry ───────────────────────────────────────────────────────
// Abstraction layer for vision model providers

import type {
  IVisionProvider,
  VisionProviderType,
  VisionProviderHealth,
  VisionCapability,
  VisionAnalysisRequest,
  VisionAnalysisResult,
  ProviderConfig,
} from './interfaces.js';

export class ProviderRegistry {
  private providers: Map<string, IVisionProvider> = new Map();
  private configs: Map<string, ProviderConfig> = new Map();
  private defaultProviderId: string = '';

  constructor(configs: ProviderConfig[] = [], defaultProvider?: string) {
    for (const config of configs) {
      this.configs.set(config.id, config);
    }
    if (defaultProvider) {
      this.defaultProviderId = defaultProvider;
    } else if (configs.length > 0) {
      this.defaultProviderId = configs[0].id;
    }
  }

  registerProvider(provider: IVisionProvider): void {
    this.providers.set(provider.id, provider);
    if (!this.defaultProviderId) {
      this.defaultProviderId = provider.id;
    }
  }

  unregisterProvider(id: string): boolean {
    return this.providers.delete(id);
  }

  getProvider(id: string): IVisionProvider | undefined {
    return this.providers.get(id);
  }

  getDefaultProvider(): IVisionProvider | undefined {
    return this.providers.get(this.defaultProviderId);
  }

  setDefaultProvider(id: string): void {
    if (!this.providers.has(id)) {
      throw new Error(`Provider ${id} not registered`);
    }
    this.defaultProviderId = id;
  }

  listProviders(): IVisionProvider[] {
    return Array.from(this.providers.values());
  }

  getProvidersByCapability(capability: VisionCapability): IVisionProvider[] {
    return this.listProviders()
      .filter(p => p.capabilities.includes(capability) && p.isAvailable)
      .sort((a, b) => a.priority - b.priority);
  }

  selectProvider(
    analysisType: string,
    preferredProvider?: string
  ): IVisionProvider | undefined {
    if (preferredProvider) {
      const provider = this.providers.get(preferredProvider);
      if (provider?.isAvailable) return provider;
    }

    const capable = this.listProviders()
      .filter(p => p.isAvailable)
      .sort((a, b) => a.priority - b.priority);

    return capable[0];
  }

  async analyzeImage(
    request: VisionAnalysisRequest,
    providerId?: string
  ): Promise<VisionAnalysisResult> {
    const provider = providerId
      ? this.providers.get(providerId)
      : this.selectProvider('image-analysis');

    if (!provider) {
      throw new Error('No available vision provider');
    }

    return provider.analyzeImage(request);
  }

  async getHealth(): Promise<{ id: string; status: string; latencyMs: number }[]> {
    const results: { id: string; status: string; latencyMs: number }[] = [];

    for (const provider of Array.from(this.providers.values())) {
      try {
        const health = await provider.getHealth();
        results.push({
          id: provider.id,
          status: health.status,
          latencyMs: health.latencyMs,
        });
      } catch {
        results.push({
          id: provider.id,
          status: 'unavailable',
          latencyMs: 0,
        });
      }
    }

    return results;
  }

  getConfig(id: string): ProviderConfig | undefined {
    return this.configs.get(id);
  }
}
