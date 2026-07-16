import { describe, it, expect, beforeEach } from 'vitest';
import { AIResponseEngine } from '../AIResponseEngine.js';
import type { EmailMessage } from '../interfaces.js';

function makeMsg(subject: string, body: string = ''): EmailMessage {
  return {
    id: 'm1', messageId: '<m1@test>', from: { name: 'T', email: 'a@test.com' },
    to: [], subject, textBody: body, attachments: [], direction: 'inbound',
    status: 'delivered', labels: [], isRead: false, isStarred: false,
    priority: 'media', spamLevel: 'nenhum', phishingRisk: 'nenhum',
    receivedAt: new Date(), createdAt: new Date(), updatedAt: new Date(), metadata: {},
  };
}

describe('AIResponseEngine', () => {
  let engine: AIResponseEngine;

  beforeEach(() => { engine = new AIResponseEngine(); });

  it('creates engine', () => { expect(engine).toBeDefined(); });

  it('generateResponse returns response', async () => {
    const resp = await engine.generateResponse(makeMsg('Test', 'Olá'));
    expect(resp.actions.length).toBeGreaterThan(0);
    expect(resp.summary).toBeDefined();
  });

  it('shouldAutoReply detects keywords', () => {
    expect(engine.shouldAutoReply(makeMsg('Thanks', 'obrigado pela ajuda'))).toBe(true);
  });

  it('getSuggestedActions detects meeting', () => {
    const actions = engine.getSuggestedActions(makeMsg('Reunião', 'Vamos marcar reunião'));
    expect(actions.some(a => a.type === 'meeting')).toBe(true);
  });

  it('setMode changes mode', () => {
    engine.setMode('automatico');
    expect(engine.getMode()).toBe('automatico');
  });

  it('updateConfig changes config', () => {
    engine.updateConfig({ tone: 'informal' });
    expect(engine.getConfig().tone).toBe('informal');
  });
});
