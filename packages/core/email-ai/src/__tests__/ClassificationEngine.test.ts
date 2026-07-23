import { describe, it, expect, beforeEach } from 'vitest';
import { ClassificationEngine } from '../ClassificationEngine.js';
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

describe('ClassificationEngine', () => {
  let engine: ClassificationEngine;

  beforeEach(() => { engine = new ClassificationEngine(); });

  it('creates engine with default categories', () => {
    expect(engine.getCategories().length).toBe(9);
  });

  it('classifies comercial email', async () => {
    const result = await engine.classify(makeMsg('Proposta de venda', 'Segue proposta comercial'));
    expect(result.category).toBe('Comercial');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('classifies financeiro email', async () => {
    const result = await engine.classify(makeMsg('Fatura', 'Segue nota fiscal e fatura'));
    expect(result.category).toBe('Financeiro');
  });

  it('addCategory adds new', () => {
    engine.addCategory({ name: 'Test', keywords: ['test'], patterns: [], color: '#000', icon: '🧪' });
    expect(engine.getCategories().length).toBe(10);
  });

  it('setConfidenceThreshold works', () => {
    engine.setConfidenceThreshold(0.8);
    expect(engine.getConfidenceThreshold()).toBe(0.8);
  });
});
