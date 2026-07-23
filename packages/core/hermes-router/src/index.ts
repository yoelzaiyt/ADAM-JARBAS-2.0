import type { AIProviderName, ChatRequest, ChatResponse, StreamChunk } from '@jarbas/types';
import { AIProviderRegistry } from '@jarbas/ai-registry';

export type RoutingStrategy = 'round-robin' | 'cost-optimized' | 'latency-optimized' | 'quality-first';

export interface RouterConfig {
  strategy: RoutingStrategy;
  fallbackProviders: AIProviderName[];
  maxRetries: number;
  retryDelayMs: number;
}

export interface RouteDecision {
  provider: AIProviderName;
  reason: string;
}

export class HermesRouter {
  private registry: AIProviderRegistry;
  private config: RouterConfig;
  private roundRobinIndex = 0;
  private requestCount = new Map<AIProviderName, number>();

  constructor(registry: AIProviderRegistry, config?: Partial<RouterConfig>) {
    this.registry = registry;
    this.config = {
      strategy: config?.strategy ?? 'cost-optimized',
      fallbackProviders: config?.fallbackProviders ?? ['deepseek', 'openrouter', 'nvidia', 'ollama'],
      maxRetries: config?.maxRetries ?? 3,
      retryDelayMs: config?.retryDelayMs ?? 1000,
    };
  }

  async route(request: ChatRequest): Promise<ChatResponse> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      const decision = this.decide(request.provider);
      const providerName = decision.provider;

      try {
        const provider = this.registry.getProvider(providerName);
        const response = await provider.chat({ ...request, provider: providerName });
        this.recordRequest(providerName);
        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn(`[HermesRouter] Provider ${providerName} failed (attempt ${attempt + 1}): ${lastError.message}`);
        await this.delay(this.config.retryDelayMs * (attempt + 1));
      }
    }

    throw new Error(`All providers failed after ${this.config.maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  async *streamRoute(request: ChatRequest): AsyncGenerator<StreamChunk> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      const decision = this.decide(request.provider);
      const providerName = decision.provider;

      try {
        const provider = this.registry.getProvider(providerName);
        yield* provider.stream({ ...request, provider: providerName });
        this.recordRequest(providerName);
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(`[HermesRouter] Stream failed on ${providerName} (attempt ${attempt + 1}): ${lastError.message}`);
        await this.delay(this.config.retryDelayMs * (attempt + 1));
      }
    }

    throw new Error(`All stream providers failed after ${this.config.maxRetries} attempts`);
  }

  private decide(preferredProvider?: AIProviderName): RouteDecision {
    if (preferredProvider) {
      return { provider: preferredProvider, reason: 'user-preferred' };
    }

    switch (this.config.strategy) {
      case 'round-robin':
        return this.roundRobin();
      case 'cost-optimized':
        return this.costOptimized();
      case 'latency-optimized':
        return this.latencyOptimized();
      case 'quality-first':
        return this.qualityFirst();
      default:
        return this.costOptimized();
    }
  }

  private roundRobin(): RouteDecision {
    const providers = this.config.fallbackProviders;
    const provider = providers[this.roundRobinIndex % providers.length];
    this.roundRobinIndex++;
    return { provider, reason: 'round-robin' };
  }

  private costOptimized(): RouteDecision {
    const costOrder: AIProviderName[] = ['ollama', 'opencode', 'deepseek', 'hermes', 'zhipuai', 'nvidia', 'openrouter'];
    for (const provider of costOrder) {
      const health = this.registry.getHealth(provider);
      if (!health || health.status !== 'down') {
        return { provider, reason: 'cost-optimized' };
      }
    }
    return { provider: 'ollama', reason: 'cost-optimized-fallback' };
  }

  private latencyOptimized(): RouteDecision {
    const healthResults = this.registry.getAvailableProviders().map((name) => ({
      name,
      health: this.registry.getHealth(name),
    }));

    const healthy = healthResults
      .filter((h) => h.health && h.health.status === 'healthy')
      .sort((a, b) => (a.health!.latencyMs) - (b.health!.latencyMs));

    if (healthy.length > 0) {
      return { provider: healthy[0].name, reason: 'lowest-latency' };
    }
    return { provider: 'ollama', reason: 'latency-fallback' };
  }

  private qualityFirst(): RouteDecision {
    const qualityOrder: AIProviderName[] = ['hermes', 'nvidia', 'openrouter', 'deepseek', 'zhipuai', 'ollama', 'opencode'];
    for (const provider of qualityOrder) {
      const health = this.registry.getHealth(provider);
      if (!health || health.status !== 'down') {
        return { provider, reason: 'quality-first' };
      }
    }
    return { provider: 'nvidia', reason: 'quality-fallback' };
  }

  private recordRequest(provider: AIProviderName): void {
    const count = this.requestCount.get(provider) ?? 0;
    this.requestCount.set(provider, count + 1);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getStats(): Record<AIProviderName, number> {
    return Object.fromEntries(this.requestCount) as Record<AIProviderName, number>;
  }
}
