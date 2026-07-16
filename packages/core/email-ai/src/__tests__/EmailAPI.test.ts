import { describe, it, expect, beforeEach } from 'vitest';
import { EmailAPI } from '../EmailAPI.js';
import { EmailAI } from '../EmailAI.js';
import type { EmailAIConfig, EmailAPIRequest } from '../interfaces.js';

const config: EmailAIConfig = {
  providers: [{ name: 'gmail' }],
  defaultProvider: 'gmail',
  defaultApprovalMode: 'assistido',
  maxAttachmentSize: 25 * 1024 * 1024,
  language: 'pt-BR',
  autoClassify: true,
  autoPrioritize: true,
  autoSpamCheck: true,
  autoPhishingCheck: true,
  syncIntervalMinutes: 15,
  queueEnabled: true,
  retryEnabled: true,
  monitoringEnabled: true,
  logLevel: 'info',
};

function makeReq(body: unknown = {}, params: Record<string, string> = {}): EmailAPIRequest {
  return { body, params, query: {} };
}

describe('EmailAPI', () => {
  let api: EmailAPI;

  beforeEach(() => {
    const ai = new EmailAI(config);
    api = new EmailAPI(ai);
  });

  it('creates API', () => { expect(api).toBeDefined(); });

  it('send returns 201', async () => {
    const res = await api.send(makeReq({ to: [{ name: 'A', email: 'a@test.com' }], subject: 'Hi', body: 'Hello' }));
    expect(res.status).toBe(201);
  });

  it('draft returns 201', async () => {
    const res = await api.draft(makeReq({}));
    expect(res.status).toBe(201);
  });

  it('getInbox returns 200', async () => {
    const res = await api.getInbox(makeReq({}));
    expect(res.status).toBe(200);
  });

  it('getStatistics returns 200', async () => {
    const res = await api.getStatistics(makeReq({}));
    expect(res.status).toBe(200);
  });

  it('sync returns 200', async () => {
    const res = await api.sync(makeReq({ provider: 'gmail' }));
    expect(res.status).toBe(200);
  });

  it('getConversation returns 200', async () => {
    const res = await api.getConversation(makeReq({}, { id: 'test-id' }));
    expect(res.status).toBe(200);
  });
});
