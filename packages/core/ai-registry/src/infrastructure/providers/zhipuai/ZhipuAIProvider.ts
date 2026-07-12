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

export class ZhipuAIProvider extends BaseAIProvider {
  readonly name: AIProviderName = 'zhipuai';
  readonly baseUrl: string;

  private readonly PRICING: Record<string, { promptPer1k: number; completionPer1k: number }> = {
    'glm-4-plus': { promptPer1k: 0.0071, completionPer1k: 0.0071 },
    'glm-4-flash': { promptPer1k: 0.000071, completionPer1k: 0.000071 },
    'glm-4-long': { promptPer1k: 0.000071, completionPer1k: 0.000071 },
    'glm-4-air': { promptPer1k: 0.000071, completionPer1k: 0.000071 },
    'glm-4-airx': { promptPer1k: 0.00214, completionPer1k: 0.00214 },
    'glm-4': { promptPer1k: 0.0071, completionPer1k: 0.0071 },
    'embedding-3': { promptPer1k: 0.000071, completionPer1k: 0.000071 },
  };

  constructor(apiKey: string, baseUrl = 'https://open.bigmodel.cn/api/paas/v4') {
    super(apiKey, 'glm-4-flash');
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
      provider: 'zhipuai',
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
      throw new Error(`ZhipuAI stream error ${response.status}: ${err}`);
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
    const model = request.model ?? 'embedding-3';

    const embeddings: number[][] = [];

    for (const text of input) {
      const response = await this.fetch<{
        data: { embedding: number[] }[];
        model: string;
      }>('/embeddings', {
        method: 'POST',
        body: JSON.stringify({ model, input: text }),
      });

      embeddings.push(response.data[0].embedding);
    }

    return {
      embeddings,
      model,
      provider: 'zhipuai',
      dimensions: embeddings[0]?.length ?? 0,
    };
  }

  async listModels(): Promise<string[]> {
    return Object.keys(this.PRICING);
  }

  protected estimateCost(promptTokens: number, completionTokens: number): number {
    const pricing = this.PRICING[this.defaultModel] ?? { promptPer1k: 0.000071, completionPer1k: 0.000071 };
    return (
      (promptTokens / 1000) * pricing.promptPer1k +
      (completionTokens / 1000) * pricing.completionPer1k
    );
  }
}
