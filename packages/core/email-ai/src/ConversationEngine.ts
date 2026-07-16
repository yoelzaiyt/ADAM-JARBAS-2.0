import { randomUUID } from 'node:crypto';
import type {
  ConversationEngine as IConversationEngine,
  EmailConversation,
  EmailMessage,
  ConversationState,
  EmailPriority,
} from './interfaces.js';

export class ConversationEngine implements IConversationEngine {
  private conversations: Map<string, EmailConversation> = new Map();

  async getOrCreate(message: EmailMessage): Promise<EmailConversation> {
    if (message.conversationId) {
      const existing = this.conversations.get(message.conversationId);
      if (existing) {
        existing.emailIds.push(message.id);
        existing.lastMessageAt = new Date();
        existing.messageCount++;
        if (!message.isRead) existing.unreadCount++;
        return existing;
      }
    }

    const id = randomUUID();
    const conv: EmailConversation = {
      id, subject: message.subject,
      participants: [message.from, ...message.to],
      messageIds: [message.messageId], emailIds: [message.id],
      state: 'ativa', priority: message.priority ?? 'media',
      relatedTaskIds: [], messageCount: 1,
      unreadCount: message.isRead ? 0 : 1,
      lastMessageAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
      metadata: {},
    };
    this.conversations.set(id, conv);
    return conv;
  }

  get(conversationId: string): EmailConversation | null {
    return this.conversations.get(conversationId) ?? null;
  }

  getByContact(contactId: string): EmailConversation[] {
    return Array.from(this.conversations.values()).filter(c => c.contactId === contactId);
  }

  getByProject(projectId: string): EmailConversation[] {
    return Array.from(this.conversations.values()).filter(c => c.projectId === projectId);
  }

  async update(conversationId: string, updates: Partial<EmailConversation>): Promise<EmailConversation> {
    const conv = this.conversations.get(conversationId);
    if (!conv) throw new Error(`Conversation not found: ${conversationId}`);
    Object.assign(conv, updates, { id: conversationId, updatedAt: new Date() });
    return conv;
  }

  async close(conversationId: string): Promise<void> {
    const conv = this.conversations.get(conversationId);
    if (conv) conv.state = 'resolvida';
  }

  getActive(): EmailConversation[] {
    return Array.from(this.conversations.values()).filter(c => c.state === 'ativa');
  }

  search(query: string): EmailConversation[] {
    const lower = query.toLowerCase();
    return Array.from(this.conversations.values()).filter(
      c => c.subject.toLowerCase().includes(lower) || c.participants.some(p => p.email.toLowerCase().includes(lower))
    );
  }

  getByState(state: ConversationState): EmailConversation[] {
    return Array.from(this.conversations.values()).filter(c => c.state === state);
  }
}
