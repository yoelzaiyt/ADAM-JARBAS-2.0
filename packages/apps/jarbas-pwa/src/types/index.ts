export type AIProviderName = 'openrouter' | 'deepseek' | 'nvidia' | 'ollama' | 'opencode' | 'zhipuai' | 'hermes' | 'qwen';

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  provider?: AIProviderName;
  model?: string;
  usage?: TokenUsage;
  isStreaming?: boolean;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  skills: string[];
  memoryEnabled: boolean;
  maxIterations: number;
  provider: AIProviderName;
  model: string;
  temperature: number;
}

export interface ProviderConfig {
  name: AIProviderName;
  displayName: string;
  models: string[];
  isAvailable: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  agentId?: string;
  provider?: AIProviderName;
  projectId?: string | null;
  mode?: 'chat' | 'codex';
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
}
