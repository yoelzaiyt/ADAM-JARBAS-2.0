export type AIProviderName = 'openrouter' | 'deepseek' | 'nvidia' | 'ollama' | 'opencode' | 'zhipuai' | 'hermes';

export interface AIProviderConfig {
  name: AIProviderName;
  apiKey?: string;
  baseUrl: string;
  models: string[];
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  provider?: AIProviderName;
}

export interface ChatResponse {
  id: string;
  content: string;
  model: string;
  provider: AIProviderName;
  usage: TokenUsage;
  latencyMs: number;
  finishReason: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface ProviderHealth {
  provider: AIProviderName;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  lastChecked: Date;
  error?: string;
}

export interface StreamChunk {
  id: string;
  delta: string;
  finishReason?: string;
}

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  provider: AIProviderName;
  dimensions: number;
}
