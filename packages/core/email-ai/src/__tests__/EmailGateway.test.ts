import { describe, it, expect, beforeEach } from 'vitest';
import { EmailGateway } from '../EmailGateway.js';

describe('EmailGateway', () => {
  let gw: EmailGateway;

  beforeEach(() => { gw = new EmailGateway('gmail'); });

  it('creates gateway', () => { expect(gw).toBeDefined(); });
  it('returns provider', () => { expect(gw.getProvider()).toBe('gmail'); });

  it('send creates message', async () => {
    const msg = await gw.send({ to: [{ name: 'João', email: 'j@test.com' }], subject: 'Hi', body: 'Hello' });
    expect(msg.to.length).toBe(1);
    expect(msg.subject).toBe('Hi');
    expect(msg.direction).toBe('outbound');
    expect(msg.status).toBe('sent');
  });

  it('sendRaw creates message', async () => {
    const msg = await gw.sendRaw([{ name: 'A', email: 'a@test.com' }], 'Test', 'Body');
    expect(msg.subject).toBe('Test');
  });

  it('reply creates message', async () => {
    const msg = await gw.reply('orig-123', [{ name: 'A', email: 'a@test.com' }], 'Reply body');
    expect(msg.subject).toContain('Re:');
  });

  it('forward creates message', async () => {
    const msg = await gw.forward('orig-123', [{ name: 'A', email: 'a@test.com' }], 'Fwd body');
    expect(msg.subject).toContain('Fwd:');
  });
});
