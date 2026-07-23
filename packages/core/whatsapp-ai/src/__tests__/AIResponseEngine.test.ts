import { describe, it, expect, beforeEach } from 'vitest';
import { AIResponseEngine } from '../AIResponseEngine.js';
import type { ConversationMessage, ConversationContext } from '../interfaces.js';

function makeMessage(content: string): ConversationMessage {
  return {
    id: 'm1', conversationId: 'conv1', direction: 'inbound',
    type: 'text', content, timestamp: new Date(), status: 'delivered',
    metadata: {},
  };
}

function makeContext(): ConversationContext {
  return {
    id: 'conv1', contactId: 'c1', contactName: 'João',
    status: 'active', priority: 'media', lastInteraction: new Date(),
    messageCount: 5, tags: [], approvalMode: 'assistido', metadata: {},
  };
}

describe('AIResponseEngine', () => {
  let engine: AIResponseEngine;

  beforeEach(() => {
    engine = new AIResponseEngine();
  });

  it('creates engine with default mode', () => {
    expect(engine.getMode()).toBe('assistido');
  });

  it('setMode changes mode', () => {
    engine.setMode('automatico');
    expect(engine.getMode()).toBe('automatico');
  });

  it('generates response', async () => {
    const resp = await engine.generateResponse(makeMessage('olá'), makeContext());
    expect(resp.text).toBeDefined();
    expect(resp.confidence).toBeGreaterThan(0);
    expect(resp.action).toBe('respond');
  });

  it('shouldAutoRespond is true for keywords', () => {
    expect(engine.shouldAutoRespond(makeMessage('oi'), {
      mode: 'assistido', autoRespondKeywords: ['oi'],
      ignoreKeywords: [], maxResponseLength: 4096, language: 'pt-BR',
    })).toBe(true);
  });

  it('shouldAutoRespond is false for ignored', () => {
    expect(engine.shouldAutoRespond(makeMessage('parar'), {
      mode: 'assistido', autoRespondKeywords: ['oi'],
      ignoreKeywords: ['parar'], maxResponseLength: 4096, language: 'pt-BR',
    })).toBe(false);
  });

  it('getSuggestedActions suggests task for tarefa', () => {
    const actions = engine.getSuggestedActions(makeMessage('criar tarefa'));
    expect(actions).toContain('criar_tarefa');
  });

  it('getSuggestedActions suggests meeting for reunião', () => {
    const actions = engine.getSuggestedActions(makeMessage('agendar reunião'));
    expect(actions).toContain('agendar_reuniao');
  });
});
