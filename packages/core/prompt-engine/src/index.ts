import type { ChatMessage, AIProviderName } from '@jarbas/types';
import { generateId } from '@jarbas/utils';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: PromptVariable[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  required: boolean;
  defaultValue?: unknown;
}

export interface RenderedPrompt {
  system?: string;
  messages: ChatMessage[];
  metadata: { templateId: string; variables: Record<string, unknown> };
}

export class PromptEngine {
  private templates = new Map<string, PromptTemplate>();

  async createTemplate(definition: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PromptTemplate> {
    const template: PromptTemplate = {
      ...definition,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(template.id, template);
    return template;
  }

  async getTemplate(id: string): Promise<PromptTemplate | undefined> {
    return this.templates.get(id);
  }

  async listTemplates(filters?: { tags?: string[] }): Promise<PromptTemplate[]> {
    let results = Array.from(this.templates.values());
    if (filters?.tags?.length) {
      results = results.filter((t) => filters.tags!.some((tag) => t.tags.includes(tag)));
    }
    return results;
  }

  async updateTemplate(id: string, updates: Partial<PromptTemplate>): Promise<PromptTemplate> {
    const existing = this.templates.get(id);
    if (!existing) throw new Error(`Template not found: ${id}`);

    const updated: PromptTemplate = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    this.templates.set(id, updated);
    return updated;
  }

  async deleteTemplate(id: string): Promise<void> {
    if (!this.templates.has(id)) throw new Error(`Template not found: ${id}`);
    this.templates.delete(id);
  }

  render(templateId: string, variables: Record<string, unknown>): RenderedPrompt {
    const template = this.templates.get(templateId);
    if (!template) throw new Error(`Template not found: ${templateId}`);

    for (const v of template.variables) {
      if (v.required && !(v.name in variables) && v.defaultValue === undefined) {
        throw new Error(`Missing required variable: ${v.name}`);
      }
    }

    let rendered = template.template;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      const strValue = typeof value === 'string' ? value : JSON.stringify(value);
      rendered = rendered.replaceAll(placeholder, strValue);
    }

    for (const v of template.variables) {
      if (v.defaultValue !== undefined && !(v.name in variables)) {
        const placeholder = `{{${v.name}}}`;
        const strValue = typeof v.defaultValue === 'string' ? v.defaultValue : JSON.stringify(v.defaultValue);
        rendered = rendered.replaceAll(placeholder, strValue);
      }
    }

    const systemMatch = rendered.match(/^---SYSTEM---\n([\s\S]*?)\n---END---\n/);
    const system = systemMatch?.[1]?.trim();
    const userContent = systemMatch ? rendered.slice(systemMatch[0].length).trim() : rendered;

    const messages: ChatMessage[] = [];
    if (system) {
      messages.push({ role: 'system', content: system });
    }
    messages.push({ role: 'user', content: userContent });

    return {
      system,
      messages,
      metadata: { templateId, variables },
    };
  }

  async searchTemplates(query: string): Promise<PromptTemplate[]> {
    const lower = query.toLowerCase();
    return Array.from(this.templates.values()).filter(
      (t) =>
        t.name.toLowerCase().includes(lower) ||
        t.description.toLowerCase().includes(lower) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lower))
    );
  }

  extractVariables(template: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const vars = new Set<string>();
    let match;
    while ((match = regex.exec(template)) !== null) {
      vars.add(match[1]);
    }
    return Array.from(vars);
  }
}
