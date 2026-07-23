import { describe, it, expect, beforeEach } from 'vitest';
import { PriorityEngine } from '../PriorityEngine.js';
import type { EmailMessage } from '../interfaces.js';

function makeMsg(subject: string, body: string = '', sender: string = 'a@test.com'): EmailMessage {
  return {
    id: 'm1', messageId: '<m1@test>', from: { name: 'T', email: sender },
    to: [], subject, textBody: body, attachments: [], direction: 'inbound',
    status: 'delivered', labels: [], isRead: false, isStarred: false,
    priority: 'media', spamLevel: 'nenhum', phishingRisk: 'nenhum',
    receivedAt: new Date(), createdAt: new Date(), updatedAt: new Date(), metadata: {},
  };
}

describe('PriorityEngine', () => {
  let engine: PriorityEngine;

  beforeEach(() => { engine = new PriorityEngine(); });

  it('creates engine', () => { expect(engine).toBeDefined(); });

  it('classify with rules matches sender', async () => {
    const priority = await engine.classify(makeMsg('Hi', '', 'urgent@company.com'));
    expect(priority).toBe('urgente');
  });

  it('classify with rules matches subject', async () => {
    const priority = await engine.classify(makeMsg('Prazo para amanhã'));
    expect(priority).toBe('alta');
  });

  it('heuristic classify detects urgente', async () => {
    const priority = await engine.classify(makeMsg('Test', 'isso é urgente'));
    expect(priority).toBe('urgente');
  });

  it('heuristic classify detects baixa', async () => {
    const priority = await engine.classify(makeMsg('Test', 'quando puder'));
    expect(priority).toBe('baixa');
  });

  it('addRule and getRules', () => {
    engine.addRule({ name: 'Test', field: 'subject', operator: 'contains', value: 'test', priority: 'alta', enabled: true });
    expect(engine.getRules().length).toBe(4);
  });

  it('deleteRule removes rule', () => {
    const rules = engine.getRules();
    engine.deleteRule(rules[0].id);
    expect(engine.getRules().length).toBe(2);
  });
});
