import type {
  AIProviderName,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  TokenUsage,
  EmbeddingRequest,
  EmbeddingResponse,
} from '@jarbas/types';

export interface AIProvider {
  readonly name: AIProviderName;
  readonly baseUrl: string;

  chat(request: ChatRequest): Promise<ChatResponse>;
  stream(request: ChatRequest): AsyncGenerator<StreamChunk>;
  embed(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  listModels(): Promise<string[]>;
  healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'down'; latencyMs: number }>;
}

export abstract class BaseAIProvider implements AIProvider {
  abstract readonly name: AIProviderName;
  abstract readonly baseUrl: string;

  protected constructor(
    protected apiKey: string,
    protected defaultModel: string
  ) {}

  abstract chat(request: ChatRequest): Promise<ChatResponse>;
  abstract stream(request: ChatRequest): AsyncGenerator<StreamChunk>;
  abstract embed(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  abstract listModels(): Promise<string[]>;

  protected async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) ?? {}),
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`${this.name} API error ${response.status}: ${errorBody}`);
    }

    return response.json() as Promise<T>;
  }

  protected calculateUsage(
    promptTokens: number,
    completionTokens: number
  ): TokenUsage {
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      estimatedCostUsd: this.estimateCost(promptTokens, completionTokens),
    };
  }

  protected abstract estimateCost(promptTokens: number, completionTokens: number): number;

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'down'; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.listModels();
      return { status: 'healthy', latencyMs: Date.now() - start };
    } catch {
      return { status: 'down', latencyMs: Date.now() - start };
    }
  }
}
