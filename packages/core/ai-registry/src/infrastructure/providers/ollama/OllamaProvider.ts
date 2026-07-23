import { BaseAIProvider } from '../../domain/BaseAIProvider.js';
import type {
  AIProviderName,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  EmbeddingRequest,
  EmbeddingResponse,
} from '@jarbas/types';
import { generateId } from '@jarbas/utils';

export class OllamaProvider extends BaseAIProvider {
  readonly name: AIProviderName = 'ollama';
  readonly baseUrl: string;

  constructor(baseUrl = 'http://localhost:11434') {
    super('', 'llama3.1');
    this.baseUrl = baseUrl;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const model = request.model ?? this.defaultModel;
    const startTime = Date.now();

    const response = await this.fetch<{
      message: { content: string };
      model: string;
      eval_count: number;
      prompt_eval_count: number;
      total_duration: number;
    }>({
      endpoint: '/api/chat',
      method: 'POST',
      body: JSON.stringify({
        model,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: false,
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: request.maxTokens ?? 4096,
        },
      }),
    } as any);

    return {
      id: generateId(),
      content: response.message.content,
      model: response.model ?? model,
      provider: 'ollama',
      usage: this.calculateUsage(
        response.prompt_eval_count ?? 0,
        response.eval_count ?? 0
      ),
      latencyMs: Date.now() - startTime,
      finishReason: 'stop',
    };
  }

  async *stream(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const model = request.model ?? this.defaultModel;

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: request.maxTokens ?? 4096,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Ollama stream error ${response.status}: ${err}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            yield {
              id: generateId(),
              delta: parsed.message.content,
              finishReason: parsed.done ? 'stop' : undefined,
            };
          }
        } catch { /* skip malformed */ }
      }
    }
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const input = Array.isArray(request.input) ? request.input : [request.input];
    const model = request.model ?? 'nomic-embed-text';

    const embeddings: number[][] = [];
    for (const text of input) {
      const response = await this.fetch<{
        embedding: number[];
      }>({
        endpoint: '/api/embeddings',
        method: 'POST',
        body: JSON.stringify({ model, prompt: text }),
      } as any);
      embeddings.push(response.embedding);
    }

    return {
      embeddings,
      model,
      provider: 'ollama',
      dimensions: embeddings[0]?.length ?? 0,
    };
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.fetch<{ models: { name: string }[] }>({
        endpoint: '/api/tags',
        method: 'GET',
      } as any);
      return response.models.map((m) => m.name);
    } catch {
      return [];
    }
  }

  protected estimateCost(_promptTokens: number, _completionTokens: number): number {
    return 0; // Ollama is free (local)
  }

  private async fetch<T>(options: { endpoint: string; method: string; body?: string }): Promise<T> {
    const url = `${this.baseUrl}${options.endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Ollama API error ${response.status}: ${errorBody}`);
    }

    return response.json() as Promise<T>;
  }
}
