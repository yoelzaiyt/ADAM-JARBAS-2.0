import { describe, it, expect } from 'vitest';
import { WhatsAppAI } from '../WhatsAppAI.js';
import type { WhatsAppAIConfig } from '../interfaces.js';

const config: WhatsAppAIConfig = {
  gateway: {
    provider: 'meta', phoneNumberId: '12345', accessToken: 'tok',
    webhookVerifyToken: 'v', apiVersion: 'v18', baseUrl: 'https://graph.facebook.com',
  },
  defaultApprovalMode: 'assistido',
  maxMessageLength: 4096,
  language: 'pt-BR',
  autoTranscribeAudio: true,
  autoProcessDocuments: true,
  autoProcessImages: true,
  queueEnabled: true,
  retryEnabled: true,
  monitoringEnabled: true,
  logLevel: 'info',
};

describe('WhatsAppAI', () => {
  it('creates WhatsAppAI', () => {
    const ai = new WhatsAppAI(config);
    expect(ai).toBeDefined();
  });

  it('initializes all modules', () => {
    const ai = new WhatsAppAI(config);
    expect(ai.gateway).toBeDefined();
    expect(ai.webhook).toBeDefined();
    expect(ai.router).toBeDefined();
    expect(ai.conversations).toBeDefined();
    expect(ai.contacts).toBeDefined();
    expect(ai.media).toBeDefined();
    expect(ai.voice).toBeDefined();
    expect(ai.documents).toBeDefined();
    expect(ai.images).toBeDefined();
    expect(ai.ai).toBeDefined();
    expect(ai.approvals).toBeDefined();
    expect(ai.automations).toBeDefined();
    expect(ai.crm).toBeDefined();
    expect(ai.calendar).toBeDefined();
    expect(ai.tasks).toBeDefined();
    expect(ai.notifications).toBeDefined();
    expect(ai.business).toBeDefined();
    expect(ai.queue).toBeDefined();
    expect(ai.retry).toBeDefined();
    expect(ai.analytics).toBeDefined();
    expect(ai.monitoring).toBeDefined();
    expect(ai.security).toBeDefined();
  });

  it('initialize and shutdown work', async () => {
    const ai = new WhatsAppAI(config);
    await ai.initialize();
    expect(ai.getAnalytics()).toBeDefined();
    await ai.shutdown();
    expect(ai.getAnalytics()).toBeDefined();
  });
});
