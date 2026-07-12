import type {
  AIProviderName,
  AIProviderConfig,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  ProviderHealth,
  EmbeddingRequest,
  EmbeddingResponse,
} from '@jarbas/types';
import type { AIProvider } from '../domain/BaseAIProvider.js';
import { OpenRouterProvider } from '../infrastructure/providers/openrouter/OpenRouterProvider.js';
import { DeepSeekProvider } from '../infrastructure/providers/deepseek/DeepSeekProvider.js';
import { NVIDIAProvider } from '../infrastructure/providers/nvidia/NVIDIAProvider.js';
import { OllamaProvider } from '../infrastructure/providers/ollama/OllamaProvider.js';
import { OpenCodeProvider } from '../infrastructure/providers/opencode/OpenCodeProvider.js';
import { ZhipuAIProvider } from '../infrastructure/providers/zhipuai/ZhipuAIProvider.js';
import { HermesProvider } from '../infrastructure/providers/hermes/HermesProvider.js';

export interface RegistryConfig {
  openrouter?: { apiKey: string; baseUrl?: string };
  deepseek?: { apiKey: string; baseUrl?: string };
  nvidia?: { apiKey: string; baseUrl?: string };
  ollama?: { baseUrl?: string };
  opencode?: { baseUrl?: string };
  zhipuai?: { apiKey: string; baseUrl?: string };
  hermes?: { apiKey: string; baseUrl?: string };
}

export class AIProviderRegistry {
  private providers = new Map<AIProviderName, AIProvider>();
  private healthCache = new Map<AIProviderName, ProviderHealth>();

  constructor(config: RegistryConfig) {
    if (config.openrouter?.apiKey) {
      this.providers.set('openrouter', new OpenRouterProvider(config.openrouter.apiKey, config.openrouter.baseUrl));
    }
    if (config.deepseek?.apiKey) {
      this.providers.set('deepseek', new DeepSeekProvider(config.deepseek.apiKey, config.deepseek.baseUrl));
    }
    if (config.nvidia?.apiKey) {
      this.providers.set('nvidia', new NVIDIAProvider(config.nvidia.apiKey, config.nvidia.baseUrl));
    }
    this.providers.set('ollama', new OllamaProvider(config.ollama?.baseUrl));
    this.providers.set('opencode', new OpenCodeProvider(config.opencode?.baseUrl));
    if (config.zhipuai?.apiKey) {
      this.providers.set('zhipuai', new ZhipuAIProvider(config.zhipuai.apiKey, config.zhipuai.baseUrl));
    }
    if (config.hermes?.apiKey) {
      this.providers.set('hermes', new HermesProvider(config.hermes.apiKey, config.hermes.baseUrl));
    }
  }

  getProvider(name: AIProviderName): AIProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new Error(`Provider not registered: ${name}`);
    return provider;
  }

  getAvailableProviders(): AIProviderName[] {
    return Array.from(this.providers.keys());
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const providerName = request.provider ?? this.selectBestProvider(request);
    const provider = this.getProvider(providerName);
    return provider.chat(request);
  }

  async *stream(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const providerName = request.provider ?? this.selectBestProvider(request);
    const provider = this.getProvider(providerName);
    yield* provider.stream(request);
  }

  async embed(request: EmbeddingRequest, provider?: AIProviderName): Promise<EmbeddingResponse> {
    const providerName = provider ?? 'openrouter';
    const p = this.getProvider(providerName);
    return p.embed(request);
  }

  async checkHealth(): Promise<ProviderHealth[]> {
    const results: ProviderHealth[] = [];
    for (const [name, provider] of this.providers) {
      const health = await provider.healthCheck();
      const result: ProviderHealth = {
        provider: name,
        ...health,
        lastChecked: new Date(),
      };
      this.healthCache.set(name, result);
      results.push(result);
    }
    return results;
  }

  getHealth(provider: AIProviderName): ProviderHealth | undefined {
    return this.healthCache.get(provider);
  }

  private selectBestProvider(request: ChatRequest): AIProviderName {
    // Priority: Hermes > DeepSeek > OpenRouter > NVIDIA > ZhipuAI > Ollama > OpenCode
    if (this.providers.has('hermes')) return 'hermes';
    if (this.providers.has('deepseek')) return 'deepseek';
    if (this.providers.has('openrouter')) return 'openrouter';
    if (this.providers.has('nvidia')) return 'nvidia';
    if (this.providers.has('zhipuai')) return 'zhipuai';
    if (this.providers.has('ollama')) return 'ollama';
    if (this.providers.has('opencode')) return 'opencode';
    throw new Error('No AI providers configured');
  }
}

export const createRegistry = (config: RegistryConfig): AIProviderRegistry => {
  return new AIProviderRegistry(config);
};
