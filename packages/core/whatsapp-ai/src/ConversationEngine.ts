import { randomUUID } from 'node:crypto';
import type {
  ConversationEngine as IConversationEngine,
  ConversationContext,
  ConversationMessage,
  ConversationStatus,
  TaskPriority,
  ApprovalMode,
  MessageType,
  MessageDirection,
  MessageStatus,
} from './interfaces.js';

export class ConversationEngine implements IConversationEngine {
  private contexts: Map<string, ConversationContext> = new Map();
  private messages: Map<string, ConversationMessage[]> = new Map();

  async getOrCreate(contactId: string, contactName: string): Promise<ConversationContext> {
    for (const ctx of this.contexts.values()) {
      if (ctx.contactId === contactId && ctx.status === 'active') return ctx;
    }
    const id = randomUUID();
    const context: ConversationContext = {
      id,
      contactId,
      contactName,
      status: 'active',
      priority: 'media',
      lastInteraction: new Date(),
      messageCount: 0,
      tags: [],
      approvalMode: 'assistido',
      metadata: {},
    };
    this.contexts.set(id, context);
    this.messages.set(id, []);
    return context;
  }

  getContext(conversationId: string): ConversationContext | null {
    return this.contexts.get(conversationId) ?? null;
  }

  async addMessage(conversationId: string, message: Omit<ConversationMessage, 'id' | 'timestamp'>): Promise<ConversationMessage> {
    const ctx = this.contexts.get(conversationId);
    if (!ctx) throw new Error(`Conversation not found: ${conversationId}`);

    const full: ConversationMessage = { ...message, id: randomUUID(), timestamp: new Date() };
    const msgs = this.messages.get(conversationId) ?? [];
    msgs.push(full);
    this.messages.set(conversationId, msgs);
    ctx.lastInteraction = new Date();
    ctx.messageCount++;
    return full;
  }

  getHistory(conversationId: string, limit: number = 50): ConversationMessage[] {
    const msgs = this.messages.get(conversationId) ?? [];
    return msgs.slice(-limit);
  }

  async updateContext(conversationId: string, updates: Partial<ConversationContext>): Promise<ConversationContext> {
    const ctx = this.contexts.get(conversationId);
    if (!ctx) throw new Error(`Conversation not found: ${conversationId}`);
    Object.assign(ctx, updates, { id: conversationId });
    return ctx;
  }

  async closeConversation(conversationId: string): Promise<void> {
    const ctx = this.contexts.get(conversationId);
    if (ctx) ctx.status = 'closed';
  }

  getActiveConversations(): ConversationContext[] {
    return Array.from(this.contexts.values()).filter(c => c.status === 'active');
  }

  search(query: string): ConversationContext[] {
    const lower = query.toLowerCase();
    return Array.from(this.contexts.values()).filter(c =>
      c.contactName.toLowerCase().includes(lower) || c.tags.some(t => t.toLowerCase().includes(lower))
    );
  }
}
