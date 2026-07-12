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

export class OpenCodeProvider extends BaseAIProvider {
  readonly name: AIProviderName = 'opencode';
  readonly baseUrl: string;

  constructor(baseUrl = 'http://localhost:4096') {
    super('', 'opencode');
    this.baseUrl = baseUrl;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model ?? this.defaultModel,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenCode API error ${response.status}: ${err}`);
    }

    const data = await response.json() as {
      id: string;
      choices: { message: { content: string }; finish_reason: string }[];
      model: string;
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    const choice = data.choices[0];

    return {
      id: data.id ?? generateId(),
      content: choice.message.content,
      model: data.model ?? this.defaultModel,
      provider: 'opencode',
      usage: this.calculateUsage(
        data.usage?.prompt_tokens ?? 0,
        data.usage?.completion_tokens ?? 0
      ),
      latencyMs: Date.now() - startTime,
      finishReason: choice.finish_reason,
    };
  }

  async *stream(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model ?? this.defaultModel,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenCode stream error ${response.status}: ${err}`);
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
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            yield {
              id: parsed.id ?? generateId(),
              delta,
              finishReason: parsed.choices?.[0]?.finish_reason ?? undefined,
            };
          }
        } catch { /* skip malformed */ }
      }
    }
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const input = Array.isArray(request.input) ? request.input : [request.input];
    const model = request.model ?? 'opencode';

    const response = await fetch(`${this.baseUrl}/v1/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, input }),
    });

    if (!response.ok) {
      throw new Error(`OpenCode embed error ${response.status}`);
    }

    const data = await response.json() as {
      data: { embedding: number[]; index: number }[];
      model: string;
    };

    const embeddings = data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);

    return {
      embeddings,
      model: data.model ?? model,
      provider: 'opencode',
      dimensions: embeddings[0]?.length ?? 0,
    };
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`);
      if (!response.ok) return ['opencode'];
      const data = await response.json() as { data: { id: string }[] };
      return data.data?.map((m) => m.id) ?? ['opencode'];
    } catch {
      return ['opencode'];
    }
  }

  protected estimateCost(_promptTokens: number, _completionTokens: number): number {
    return 0; // OpenCode is free (local)
  }
}
