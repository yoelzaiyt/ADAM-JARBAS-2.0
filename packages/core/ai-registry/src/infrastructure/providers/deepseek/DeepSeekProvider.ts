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

export class DeepSeekProvider extends BaseAIProvider {
  readonly name: AIProviderName = 'deepseek';
  readonly baseUrl: string;

  private readonly PRICING: Record<string, { promptPer1k: number; completionPer1k: number }> = {
    'deepseek-chat': { promptPer1k: 0.00014, completionPer1k: 0.00028 },
    'deepseek-reasoner': { promptPer1k: 0.00055, completionPer1k: 0.00219 },
  };

  constructor(apiKey: string, baseUrl = 'https://api.deepseek.com/v1') {
    super(apiKey, 'deepseek-chat');
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
      provider: 'deepseek',
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
      throw new Error(`DeepSeek stream error ${response.status}: ${err}`);
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
    const model = request.model ?? 'deepseek-embedding';

    const response = await this.fetch<{
      data: { embedding: number[]; index: number }[];
      model: string;
    }>('/embeddings', {
      method: 'POST',
      body: JSON.stringify({ model, input }),
    });

    const embeddings = response.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);

    return {
      embeddings,
      model: response.model ?? model,
      provider: 'deepseek',
      dimensions: embeddings[0]?.length ?? 0,
    };
  }

  async listModels(): Promise<string[]> {
    return ['deepseek-chat', 'deepseek-reasoner', 'deepseek-embedding'];
  }

  protected estimateCost(promptTokens: number, completionTokens: number): number {
    const pricing = this.PRICING[this.defaultModel] ?? { promptPer1k: 0.00014, completionPer1k: 0.00028 };
    return (
      (promptTokens / 1000) * pricing.promptPer1k +
      (completionTokens / 1000) * pricing.completionPer1k
    );
  }
}
