import { describe, it, expect, beforeEach } from 'vitest';
import { MessageRouter } from '../MessageRouter.js';
import type { MessageContext, GatewayMessage } from '../interfaces.js';

function makeContext(text: string, type: 'text' | 'audio' | 'document' | 'image' = 'text'): MessageContext {
  const msg: GatewayMessage = {
    id: 'msg1', from: 'user', to: 'bot', type, direction: 'inbound',
    text, timestamp: new Date(), status: 'delivered', provider: 'meta', metadata: {},
  };
  return {
    conversationId: 'conv1', contactId: 'c1', contactName: 'User',
    isGroup: false, message: msg, tags: [],
  };
}

describe('MessageRouter', () => {
  let router: MessageRouter;

  beforeEach(() => {
    router = new MessageRouter();
  });

  it('routes text messages', async () => {
    const ctx = makeContext('hello');
    const decision = await router.route(ctx);
    expect(decision.action).toBe('respond');
  });

  it('routes audio to voice', async () => {
    const ctx = makeContext('audio data', 'audio');
    const decision = await router.route(ctx);
    expect(decision.action).toBe('voice');
  });

  it('routes documents to task', async () => {
    const ctx = makeContext('doc', 'document');
    const decision = await router.route(ctx);
    expect(decision.action).toBe('task');
  });

  it('registers and matches handlers', async () => {
    router.registerHandler('ajuda', 'helpHandler');
    const ctx = makeContext('preciso de ajuda');
    const decision = await router.route(ctx);
    expect(decision.handler).toBe('helpHandler');
    expect(decision.confidence).toBe(0.9);
  });

  it('getRegisteredHandlers returns map', () => {
    router.registerHandler('test', 'handler');
    const handlers = router.getRegisteredHandlers();
    expect(handlers.size).toBe(1);
    expect(handlers.get('test')).toBe('handler');
  });
});
