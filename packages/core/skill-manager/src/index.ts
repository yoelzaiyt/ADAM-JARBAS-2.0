import type { ChatMessage, AIProviderName } from '@jarbas/types';
import { generateId } from '@jarbas/utils';

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools: SkillTool[];
  tags: string[];
  version: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillTool {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required: boolean }>;
  handler: string;
}

export interface SkillExecutionRequest {
  skillId: string;
  input: string;
  context?: Record<string, unknown>;
  provider?: AIProviderName;
}

export interface SkillExecutionResult {
  skillId: string;
  output: string;
  toolCalls: { tool: string; args: unknown; result: unknown }[];
  tokensUsed: number;
  latencyMs: number;
}

export class SkillManager {
  private skills = new Map<string, SkillDefinition>();

  async registerSkill(definition: Omit<SkillDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<SkillDefinition> {
    const skill: SkillDefinition = {
      ...definition,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.skills.set(skill.id, skill);
    return skill;
  }

  async getSkill(id: string): Promise<SkillDefinition | undefined> {
    return this.skills.get(id);
  }

  async listSkills(filters?: { tags?: string[]; author?: string }): Promise<SkillDefinition[]> {
    let results = Array.from(this.skills.values());

    if (filters?.tags?.length) {
      results = results.filter((s) => filters.tags!.some((t) => s.tools.some((tool) => tool.name.includes(t))));
    }

    if (filters?.author) {
      results = results.filter((s) => s.author === filters.author);
    }

    return results;
  }

  async updateSkill(id: string, updates: Partial<SkillDefinition>): Promise<SkillDefinition> {
    const existing = this.skills.get(id);
    if (!existing) throw new Error(`Skill not found: ${id}`);

    const updated: SkillDefinition = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    this.skills.set(id, updated);
    return updated;
  }

  async deleteSkill(id: string): Promise<void> {
    if (!this.skills.has(id)) throw new Error(`Skill not found: ${id}`);
    this.skills.delete(id);
  }

  buildMessages(skill: SkillDefinition, input: string, context?: Record<string, unknown>): ChatMessage[] {
    const messages: ChatMessage[] = [
      { role: 'system', content: skill.systemPrompt },
    ];

    if (context) {
      messages.push({
        role: 'system',
        content: `Context: ${JSON.stringify(context)}`,
      });
    }

    messages.push({ role: 'user', content: input });
    return messages;
  }

  parseToolCalls(response: string): { tool: string; args: Record<string, unknown> }[] {
    const toolCallRegex = /<tool_call>\s*<tool>(.*?)<\/tool>\s*<args>(.*?)<\/args>\s*<\/toolcall>/gs;
    const calls: { tool: string; args: Record<string, unknown> }[] = [];
    let match;

    while ((match = toolCallRegex.exec(response)) !== null) {
      try {
        calls.push({
          tool: match[1],
          args: JSON.parse(match[2]),
        });
      } catch { /* skip malformed */ }
    }

    return calls;
  }

  async searchSkills(query: string): Promise<SkillDefinition[]> {
    const lower = query.toLowerCase();
    return Array.from(this.skills.values()).filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.description.toLowerCase().includes(lower) ||
        s.tags.some((t) => t.toLowerCase().includes(lower))
    );
  }
}
