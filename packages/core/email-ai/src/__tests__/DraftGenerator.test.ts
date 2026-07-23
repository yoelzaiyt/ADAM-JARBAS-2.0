import { describe, it, expect, beforeEach } from 'vitest';
import { DraftGenerator } from '../DraftGenerator.js';
import type { EmailMessage } from '../interfaces.js';

function makeMsg(subject: string): EmailMessage {
  return {
    id: 'm1', messageId: '<m1@test>', from: { name: 'João', email: 'j@test.com' },
    to: [], subject, textBody: '', attachments: [], direction: 'inbound',
    status: 'delivered', labels: [], isRead: false, isStarred: false,
    priority: 'media', spamLevel: 'nenhum', phishingRisk: 'nenhum',
    receivedAt: new Date(), createdAt: new Date(), updatedAt: new Date(), metadata: {},
  };
}

describe('DraftGenerator', () => {
  let gen: DraftGenerator;

  beforeEach(() => { gen = new DraftGenerator(); });

  it('creates generator', () => { expect(gen).toBeDefined(); });

  it('generate creates draft', async () => {
    const result = await gen.generate(makeMsg('Test'), 'agradecimento');
    expect(result.draft.id).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('generateReply creates reply', async () => {
    const result = await gen.generateReply(makeMsg('Hello'));
    expect(result.draft.replyToId).toBe('m1');
  });

  it('generateForward creates forward', async () => {
    const result = await gen.generateForward(makeMsg('Fwd'), [{ name: 'A', email: 'a@test.com' }]);
    expect(result.draft.forwardFromId).toBe('m1');
    expect(result.draft.to[0].email).toBe('a@test.com');
  });

  it('getTemplates returns templates', () => {
    expect(gen.getTemplates().length).toBe(3);
  });

  it('addTemplate adds', () => {
    gen.addTemplate({ name: 'Test', type: 'tecnico', subjectTemplate: 'T', bodyTemplate: 'B', variables: [], language: 'pt-BR' });
    expect(gen.getTemplates().length).toBe(4);
  });
});
