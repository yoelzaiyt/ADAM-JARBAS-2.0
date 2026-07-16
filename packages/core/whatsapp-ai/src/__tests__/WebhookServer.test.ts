import { describe, it, expect, beforeEach } from 'vitest';
import { WebhookServer } from '../WebhookServer.js';
import type { WebhookEvent } from '../interfaces.js';

describe('WebhookServer', () => {
  let server: WebhookServer;

  beforeEach(() => {
    server = new WebhookServer();
  });

  it('creates server', () => {
    expect(server).toBeDefined();
  });

  it('not running initially', () => {
    expect(server.isRunning()).toBe(false);
  });

  it('starts and stops', async () => {
    await server.start({ path: '/webhook', verifyToken: 'tok', secret: 'sec', port: 3000 });
    expect(server.isRunning()).toBe(true);
    await server.stop();
    expect(server.isRunning()).toBe(false);
  });

  it('emits events to listeners', async () => {
    const received: WebhookEvent[] = [];
    server.onEvent(e => received.push(e));
    const evt: WebhookEvent = { type: 'message', payload: {}, timestamp: new Date(), source: 'meta' };
    server.emitEvent(evt);
    expect(received.length).toBe(1);
    expect(received[0].type).toBe('message');
  });

  it('supports multiple listeners', async () => {
    const a: WebhookEvent[] = [];
    const b: WebhookEvent[] = [];
    server.onEvent(e => a.push(e));
    server.onEvent(e => b.push(e));
    server.emitEvent({ type: 'test', payload: {}, timestamp: new Date(), source: 'meta' });
    expect(a.length).toBe(1);
    expect(b.length).toBe(1);
  });
});
