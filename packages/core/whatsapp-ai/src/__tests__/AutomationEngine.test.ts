import { describe, it, expect, beforeEach } from 'vitest';
import { AutomationEngine } from '../AutomationEngine.js';
import type { ConversationMessage, ConversationContext } from '../interfaces.js';

function makeMsg(content: string): ConversationMessage {
  return {
    id: 'm1', conversationId: 'conv1', direction: 'inbound',
    type: 'text', content, timestamp: new Date(), status: 'delivered', metadata: {},
  };
}

function makeCtx(): ConversationContext {
  return {
    id: 'conv1', contactId: 'c1', contactName: 'João',
    status: 'active', priority: 'media', lastInteraction: new Date(),
    messageCount: 1, tags: [], approvalMode: 'assistido', metadata: {},
  };
}

describe('AutomationEngine', () => {
  let engine: AutomationEngine;

  beforeEach(() => {
    engine = new AutomationEngine();
  });

  it('creates rule', async () => {
    const rule = await engine.createRule({
      name: 'Greeting', enabled: true, trigger: 'mensagem',
      triggerValue: 'oi', conditions: [],
      actions: [{ action: 'responder', config: {} }],
    });
    expect(rule.id).toBeDefined();
    expect(rule.name).toBe('Greeting');
    expect(rule.triggerCount).toBe(0);
  });

  it('updates rule', async () => {
    const rule = await engine.createRule({
      name: 'Test', enabled: true, trigger: 'mensagem',
      conditions: [], actions: [],
    });
    const updated = await engine.updateRule(rule.id, { name: 'Updated' });
    expect(updated.name).toBe('Updated');
  });

  it('deletes rule', async () => {
    const rule = await engine.createRule({
      name: 'Test', enabled: true, trigger: 'mensagem',
      conditions: [], actions: [],
    });
    await engine.deleteRule(rule.id);
    expect(engine.getRule(rule.id)).toBeNull();
  });

  it('getRules returns all', async () => {
    await engine.createRule({
      name: 'A', enabled: true, trigger: 'mensagem',
      conditions: [], actions: [],
    });
    await engine.createRule({
      name: 'B', enabled: false, trigger: 'horario',
      conditions: [], actions: [],
    });
    expect(engine.getRules().length).toBe(2);
  });

  it('evaluate matches enabled rules', async () => {
    await engine.createRule({
      name: 'Greet', enabled: true, trigger: 'mensagem',
      triggerValue: 'oi', conditions: [],
      actions: [{ action: 'responder', config: {} }],
    });
    const result = await engine.evaluate(makeMsg('oi tudo bem'), makeCtx());
    expect(result.length).toBe(1);
    expect(result[0].action).toBe('responder');
  });

  it('evaluate skips disabled rules', async () => {
    await engine.createRule({
      name: 'Off', enabled: false, trigger: 'mensagem',
      triggerValue: 'oi', conditions: [],
      actions: [{ action: 'responder', config: {} }],
    });
    const result = await engine.evaluate(makeMsg('oi'), makeCtx());
    expect(result.length).toBe(0);
  });
});
