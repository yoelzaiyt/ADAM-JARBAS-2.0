import { describe, it, expect, beforeEach } from 'vitest';
import { PhishingAnalyzer } from '../PhishingAnalyzer.js';
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

describe('PhishingAnalyzer', () => {
  let analyzer: PhishingAnalyzer;

  beforeEach(() => { analyzer = new PhishingAnalyzer(); });

  it('creates analyzer', () => { expect(analyzer).toBeDefined(); });

  it('detects phishing keywords', async () => {
    const result = await analyzer.analyze(makeMsg('Alert', 'Verificar sua senha expirada'));
    expect(result.risk).not.toBe('nenhum');
    expect(result.indicators.length).toBeGreaterThan(0);
  });

  it('detects suspicious links', async () => {
    const result = await analyzer.analyze(makeMsg('Link', 'Clique em https://phish.com/login'));
    expect(result.suspiciousLinks.length).toBeGreaterThan(0);
  });

  it('detects dangerous attachments', async () => {
    const msg = makeMsg('Attach');
    msg.attachments = [{ id: '1', filename: 'virus.exe', mimeType: 'application/exe', sizeBytes: 100, type: 'unknown', isInline: false }];
    const result = await analyzer.analyze(msg);
    expect(result.suspiciousAttachments.length).toBeGreaterThan(0);
  });

  it('addPhishingDomain adds domain', () => {
    analyzer.addPhishingDomain('new-scam.com');
    expect(analyzer.getKnownPhishingDomains()).toContain('new-scam.com');
  });

  it('clean email returns low risk', async () => {
    const result = await analyzer.analyze(makeMsg('Meeting', 'Olá, podemos marcar reunião?'));
    expect(result.score).toBeLessThan(0.3);
  });
});
