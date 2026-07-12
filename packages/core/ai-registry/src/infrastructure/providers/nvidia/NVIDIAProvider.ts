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

export class NVIDIAProvider extends BaseAIProvider {
  readonly name: AIProviderName = 'nvidia';
  readonly baseUrl: string;

  private readonly PRICING: Record<string, { promptPer1k: number; completionPer1k: number }> = {
    'meta/llama-3.1-405b-instruct': { promptPer1k: 0.003, completionPer1k: 0.006 },
    'meta/llama-3.1-70b-instruct': { promptPer1k: 0.00088, completionPer1k: 0.00088 },
    'meta/llama-3.1-8b-instruct': { promptPer1k: 0.00018, completionPer1k: 0.00018 },
    'nvidia/nemotron-4-340b-instruct': { promptPer1k: 0.0036, completionPer1k: 0.0048 },
    'google/gemma-2-27b-it': { promptPer1k: 0.00018, completionPer1k: 0.00018 },
    'mistralai/mixtral-8x22b-instruct-v0.1': { promptPer1k: 0.0009, completionPer1k: 0.0009 },
    'nvidia/llama-nemotron-rerank-vl-1b-v2': { promptPer1k: 0.0001, completionPer1k: 0.0001 },
  };

  private rerankModel = 'nvidia/llama-nemotron-rerank-vl-1b-v2';

  constructor(apiKey: string, baseUrl = 'https://integrate.api.nvidia.com/v1') {
    super(apiKey, 'meta/llama-3.1-70b-instruct');
    this.baseUrl = baseUrl;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const model = request.model ?? this.defaultModel;
    const startTime = Date.now();

    const response = await this.fetch<{
      id: string;
      choices: { message: { content: string }; finish_reason: string }[];
      model: string;
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    }>('/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        stream: false,
      }),
    });

    const choice = response.choices[0];
    const usage = response.usage;

    return {
      id: response.id ?? generateId(),
      content: choice.message.content,
      model: response.model ?? model,
      provider: 'nvidia',
      usage: this.calculateUsage(usage.prompt_tokens, usage.completion_tokens),
      latencyMs: Date.now() - startTime,
      finishReason: choice.finish_reason,
    };
  }

  async *stream(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const model = request.model ?? this.defaultModel;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`NVIDIA stream error ${response.status}: ${err}`);
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
    const model = request.model ?? 'nvidia/nv-embedqa-e5-v5';

    const response = await this.fetch<{
      data: { embedding: number[]; index: number }[];
      model: string;
    }>('/embeddings', {
      method: 'POST',
      body: JSON.stringify({ model, input, input_type: 'query', encoding_format: 'float' }),
    });

    const embeddings = response.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);

    return {
      embeddings,
      model: response.model ?? model,
      provider: 'nvidia',
      dimensions: embeddings[0]?.length ?? 0,
    };
  }

  async listModels(): Promise<string[]> {
    return Object.keys(this.PRICING);
  }

  async rerank(query: string, documents: string[], model?: string): Promise<{ index: number; score: number; document: string }[]> {
    const rerankModel = model ?? this.rerankModel;

    const response = await this.fetch<{
      ranks: { index: number; score: number }[];
    }>('/ranking', {
      method: 'POST',
      body: JSON.stringify({
        model: rerankModel,
        query,
        documents,
        top_n: documents.length,
      }),
    });

    return response.ranks.map((r) => ({
      index: r.index,
      score: r.score,
      document: documents[r.index],
    }));
  }

  protected estimateCost(promptTokens: number, completionTokens: number): number {
    const pricing = this.PRICING[this.defaultModel] ?? { promptPer1k: 0.001, completionPer1k: 0.001 };
    return (
      (promptTokens / 1000) * pricing.promptPer1k +
      (completionTokens / 1000) * pricing.completionPer1k
    );
  }
}
