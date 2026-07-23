import { describe, it, expect, beforeEach } from 'vitest';
import { SpamDetector } from '../SpamDetector.js';
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

describe('SpamDetector', () => {
  let detector: SpamDetector;

  beforeEach(() => { detector = new SpamDetector(); });

  it('creates detector', () => { expect(detector).toBeDefined(); });

  it('detects blocked sender', async () => {
    detector.addBlockedSender('spam@evil.com');
    const result = await detector.check(makeMsg('Hi', '', 'spam@evil.com'));
    expect(result.isSpam).toBe(true);
    expect(result.level).toBe('critico');
  });

  it('trusted sender bypasses spam', async () => {
    detector.addTrustedSender('boss@company.com');
    const result = await detector.check(makeMsg('Hi', '', 'boss@company.com'));
    expect(result.isSpam).toBe(false);
  });

  it('detects spam keywords', async () => {
    const result = await detector.check(makeMsg('Oferta', 'Clique aqui para ganhe prêmio grátis'));
    expect(result.score).toBeGreaterThan(0);
  });

  it('getBlockedSenders returns list', () => {
    detector.addBlockedSender('a@test.com');
    expect(detector.getBlockedSenders().length).toBe(1);
  });

  it('removeBlockedSender works', () => {
    detector.addBlockedSender('a@test.com');
    detector.removeBlockedSender('a@test.com');
    expect(detector.getBlockedSenders().length).toBe(0);
  });
});
