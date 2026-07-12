import type { ChatMessage, AIProviderName, ChatResponse } from '@jarbas/types';
import { generateId } from '@jarbas/utils';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentExecutionRequest {
  agentId: string;
  input: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

export interface AgentExecutionResult {
  agentId: string;
  output: string;
  iterations: number;
  toolCalls: { tool: string; args: unknown; result: unknown }[];
  totalTokens: number;
  totalCostUsd: number;
  latencyMs: number;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
}

export class AgentManager {
  private agents = new Map<string, AgentDefinition>();
  private sessions = new Map<string, AgentMessage[]>();

  async createAgent(definition: Omit<AgentDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentDefinition> {
    const agent: AgentDefinition = {
      ...definition,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.agents.set(agent.id, agent);
    return agent;
  }

  async getAgent(id: string): Promise<AgentDefinition | undefined> {
    return this.agents.get(id);
  }

  async listAgents(): Promise<AgentDefinition[]> {
    return Array.from(this.agents.values());
  }

  async updateAgent(id: string, updates: Partial<AgentDefinition>): Promise<AgentDefinition> {
    const existing = this.agents.get(id);
    if (!existing) throw new Error(`Agent not found: ${id}`);

    const updated: AgentDefinition = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    this.agents.set(id, updated);
    return updated;
  }

  async deleteAgent(id: string): Promise<void> {
    if (!this.agents.has(id)) throw new Error(`Agent not found: ${id}`);
    this.agents.delete(id);
  }

  getSessionMessages(sessionId: string): AgentMessage[] {
    return this.sessions.get(sessionId) ?? [];
  }

  addSessionMessage(sessionId: string, message: AgentMessage): void {
    const messages = this.sessions.get(sessionId) ?? [];
    messages.push(message);
    this.sessions.set(sessionId, messages);
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  buildAgentMessages(agent: AgentDefinition, input: string, sessionId?: string): ChatMessage[] {
    const messages: ChatMessage[] = [
      { role: 'system', content: agent.systemPrompt },
    ];

    if (sessionId) {
      const history = this.getSessionMessages(sessionId);
      for (const msg of history.slice(-20)) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: 'user', content: input });
    return messages;
  }

  async searchAgents(query: string): Promise<AgentDefinition[]> {
    const lower = query.toLowerCase();
    return Array.from(this.agents.values()).filter(
      (a) =>
        a.name.toLowerCase().includes(lower) ||
        a.description.toLowerCase().includes(lower)
    );
  }
}
