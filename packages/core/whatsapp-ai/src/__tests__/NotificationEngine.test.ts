import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationEngine } from '../NotificationEngine.js';

describe('NotificationEngine', () => {
  let engine: NotificationEngine;

  beforeEach(() => {
    engine = new NotificationEngine();
  });

  it('sends notification', async () => {
    const n = await engine.send({
      channel: 'whatsapp', recipient: 'user1', subject: 'Hi', body: 'Hello',
    });
    expect(n.sent).toBe(true);
    expect(n.sentAt).toBeDefined();
  });

  it('getNotifications by recipient', async () => {
    await engine.send({ channel: 'whatsapp', recipient: 'a', subject: 'A', body: '' });
    await engine.send({ channel: 'email', recipient: 'b', subject: 'B', body: '' });
    expect(engine.getNotifications('a').length).toBe(1);
  });

  it('retry re-sends', async () => {
    const n = await engine.send({
      channel: 'whatsapp', recipient: 'u', subject: 'Test', body: '',
    });
    const retried = await engine.retry(n.id);
    expect(retried.sent).toBe(true);
  });
});
