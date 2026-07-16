import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationEngine } from '../NotificationEngine.js';

describe('NotificationEngine', () => {
  let engine: NotificationEngine;

  beforeEach(() => { engine = new NotificationEngine(); });

  it('creates engine', () => { expect(engine).toBeDefined(); });

  it('send sends notification', async () => {
    const n = await engine.send({ channel: 'email', recipient: 'u@test.com', subject: 'Hi', body: 'Hello' });
    expect(n.sent).toBe(true);
    expect(n.sentAt).toBeDefined();
  });

  it('getNotifications by recipient', async () => {
    await engine.send({ channel: 'email', recipient: 'a@test.com', subject: 'A', body: '' });
    await engine.send({ channel: 'push', recipient: 'b@test.com', subject: 'B', body: '' });
    expect(engine.getNotifications('a@test.com').length).toBe(1);
  });

  it('retry re-sends', async () => {
    const n = await engine.send({ channel: 'email', recipient: 'u', subject: 'T', body: '' });
    const retried = await engine.retry(n.id);
    expect(retried.sent).toBe(true);
  });
});
