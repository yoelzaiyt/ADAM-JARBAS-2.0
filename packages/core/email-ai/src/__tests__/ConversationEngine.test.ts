import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationEngine } from '../ConversationEngine.js';
import type { EmailMessage } from '../interfaces.js';

function makeMsg(subject: string, from: string = 'a@test.com'): EmailMessage {
  return {
    id: `msg-${Math.random()}`, messageId: `<${Math.random()}@test>`,
    from: { name: 'Test', email: from }, to: [{ name: 'B', email: 'b@test.com' }],
    subject, textBody: '', attachments: [], direction: 'inbound',
    status: 'delivered', labels: [], isRead: false, isStarred: false,
    priority: 'media', spamLevel: 'nenhum', phishingRisk: 'nenhum',
    receivedAt: new Date(), createdAt: new Date(), updatedAt: new Date(), metadata: {},
  };
}

describe('ConversationEngine', () => {
  let engine: ConversationEngine;

  beforeEach(() => { engine = new ConversationEngine(); });

  it('creates engine', () => { expect(engine).toBeDefined(); });

  it('getOrCreate creates new conversation', async () => {
    const conv = await engine.getOrCreate(makeMsg('Test Subject'));
    expect(conv.id).toBeDefined();
    expect(conv.subject).toBe('Test Subject');
    expect(conv.state).toBe('ativa');
  });

  it('get returns conversation', async () => {
    const conv = await engine.getOrCreate(makeMsg('Hi'));
    expect(engine.get(conv.id)).toBeDefined();
  });

  it('getActive returns active conversations', async () => {
    await engine.getOrCreate(makeMsg('A'));
    const b = await engine.getOrCreate(makeMsg('B'));
    await engine.close(b.id);
    expect(engine.getActive().length).toBe(1);
  });

  it('update changes conversation', async () => {
    const conv = await engine.getOrCreate(makeMsg('Test'));
    const updated = await engine.update(conv.id, { priority: 'urgente' });
    expect(updated.priority).toBe('urgente');
  });

  it('close sets state to resolvida', async () => {
    const conv = await engine.getOrCreate(makeMsg('Test'));
    await engine.close(conv.id);
    expect(engine.get(conv.id)?.state).toBe('resolvida');
  });

  it('search finds by subject', async () => {
    await engine.getOrCreate(makeMsg('Important meeting'));
    await engine.getOrCreate(makeMsg('Random'));
    expect(engine.search('meeting').length).toBe(1);
  });
});
