import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationEngine } from '../ConversationEngine.js';

describe('ConversationEngine', () => {
  let engine: ConversationEngine;

  beforeEach(() => {
    engine = new ConversationEngine();
  });

  it('creates new conversation', async () => {
    const ctx = await engine.getOrCreate('c1', 'João');
    expect(ctx.id).toBeDefined();
    expect(ctx.contactName).toBe('João');
    expect(ctx.status).toBe('active');
    expect(ctx.messageCount).toBe(0);
  });

  it('returns existing active conversation', async () => {
    const first = await engine.getOrCreate('c1', 'João');
    const second = await engine.getOrCreate('c1', 'João');
    expect(first.id).toBe(second.id);
  });

  it('getContext returns existing', async () => {
    const ctx = await engine.getOrCreate('c1', 'João');
    expect(engine.getContext(ctx.id)).toBeDefined();
    expect(engine.getContext('nonexistent')).toBeNull();
  });

  it('adds message and increments count', async () => {
    const ctx = await engine.getOrCreate('c1', 'João');
    const msg = await engine.addMessage(ctx.id, {
      conversationId: ctx.id, direction: 'inbound',
      type: 'text', content: 'olá', status: 'delivered', metadata: {},
    });
    expect(msg.id).toBeDefined();
    expect(msg.content).toBe('olá');
    const updated = engine.getContext(ctx.id);
    expect(updated?.messageCount).toBe(1);
  });

  it('getHistory returns messages', async () => {
    const ctx = await engine.getOrCreate('c1', 'João');
    await engine.addMessage(ctx.id, {
      conversationId: ctx.id, direction: 'inbound',
      type: 'text', content: 'msg1', status: 'delivered', metadata: {},
    });
    await engine.addMessage(ctx.id, {
      conversationId: ctx.id, direction: 'outbound',
      type: 'text', content: 'reply', status: 'sent', metadata: {},
    });
    expect(engine.getHistory(ctx.id).length).toBe(2);
  });

  it('updateContext changes fields', async () => {
    const ctx = await engine.getOrCreate('c1', 'João');
    const updated = await engine.updateContext(ctx.id, { priority: 'alta', tags: ['vip'] });
    expect(updated.priority).toBe('alta');
    expect(updated.tags).toContain('vip');
  });

  it('closeConversation sets closed', async () => {
    const ctx = await engine.getOrCreate('c1', 'João');
    await engine.closeConversation(ctx.id);
    expect(engine.getContext(ctx.id)?.status).toBe('closed');
  });

  it('getActiveConversations filters', async () => {
    await engine.getOrCreate('c1', 'A');
    const b = await engine.getOrCreate('c2', 'B');
    await engine.closeConversation(b.id);
    expect(engine.getActiveConversations().length).toBe(1);
  });

  it('search finds by name', async () => {
    await engine.getOrCreate('c1', 'João Silva');
    await engine.getOrCreate('c2', 'Maria Santos');
    expect(engine.search('joão').length).toBe(1);
  });
});
