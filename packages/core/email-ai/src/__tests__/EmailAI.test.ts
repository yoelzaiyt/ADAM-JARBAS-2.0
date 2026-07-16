import { describe, it, expect } from 'vitest';
import { EmailAI } from '../EmailAI.js';
import type { EmailAIConfig } from '../interfaces.js';

const config: EmailAIConfig = {
  providers: [{ name: 'gmail', clientId: 'id', clientSecret: 'secret' }],
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

describe('EmailAI', () => {
  it('creates EmailAI', () => {
    const ai = new EmailAI(config);
    expect(ai).toBeDefined();
  });

  it('initializes all modules', () => {
    const ai = new EmailAI(config);
    expect(ai.gateway).toBeDefined();
    expect(ai.providers).toBeDefined();
    expect(ai.mailbox).toBeDefined();
    expect(ai.syncEngine).toBeDefined();
    expect(ai.folders).toBeDefined();
    expect(ai.conversations).toBeDefined();
    expect(ai.priority).toBeDefined();
    expect(ai.classification).toBeDefined();
    expect(ai.spam).toBeDefined();
    expect(ai.phishing).toBeDefined();
    expect(ai.attachments).toBeDefined();
    expect(ai.documents).toBeDefined();
    expect(ai.ai).toBeDefined();
    expect(ai.approvals).toBeDefined();
    expect(ai.drafts).toBeDefined();
    expect(ai.signatures).toBeDefined();
    expect(ai.contacts).toBeDefined();
    expect(ai.crm).toBeDefined();
    expect(ai.calendar).toBeDefined();
    expect(ai.tasks).toBeDefined();
    expect(ai.notifications).toBeDefined();
    expect(ai.analytics).toBeDefined();
    expect(ai.monitoring).toBeDefined();
    expect(ai.security).toBeDefined();
    expect(ai.api).toBeDefined();
  });

  it('initialize and shutdown work', async () => {
    const ai = new EmailAI(config);
    await ai.initialize();
    expect(ai.getAnalytics()).toBeDefined();
    await ai.shutdown();
  });
});
