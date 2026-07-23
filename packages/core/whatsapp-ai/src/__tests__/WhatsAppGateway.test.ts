import { describe, it, expect, beforeEach } from 'vitest';
import { WhatsAppGateway } from '../WhatsAppGateway.js';
import type { GatewayConfig } from '../interfaces.js';

const config: GatewayConfig = {
  provider: 'meta',
  phoneNumberId: '12345',
  accessToken: 'token123',
  webhookVerifyToken: 'verify123',
  apiVersion: 'v18.0',
  baseUrl: 'https://graph.facebook.com',
};

describe('WhatsAppGateway', () => {
  let gw: WhatsAppGateway;

  beforeEach(() => {
    gw = new WhatsAppGateway(config);
  });

  it('creates gateway', () => {
    expect(gw).toBeDefined();
  });

  it('returns provider', () => {
    expect(gw.getProvider()).toBe('meta');
  });

  it('is connected by default', () => {
    expect(gw.isConnected()).toBe(true);
  });

  it('sendText creates message', async () => {
    const msg = await gw.sendText('5511999', 'hello');
    expect(msg.type).toBe('text');
    expect(msg.text).toBe('hello');
    expect(msg.direction).toBe('outbound');
    expect(msg.from).toBe('12345');
    expect(msg.to).toBe('5511999');
    expect(msg.id).toBeDefined();
  });

  it('sendAudio creates message', async () => {
    const msg = await gw.sendAudio('5511999', 'audio.mp3');
    expect(msg.type).toBe('audio');
    expect(msg.mediaUrl).toBe('audio.mp3');
  });

  it('sendDocument creates message', async () => {
    const msg = await gw.sendDocument('5511999', 'file.pdf', 'file.pdf');
    expect(msg.type).toBe('document');
    expect(msg.mediaUrl).toBe('file.pdf');
  });

  it('sendImage creates message with caption', async () => {
    const msg = await gw.sendImage('5511999', 'img.jpg', 'nice photo');
    expect(msg.type).toBe('image');
    expect(msg.caption).toBe('nice photo');
  });

  it('verifyWebhook validates token', () => {
    expect(gw.verifyWebhook('subscribe', 'verify123')).toBe(true);
    expect(gw.verifyWebhook('subscribe', 'wrong')).toBe(false);
    expect(gw.verifyWebhook('unsubscribe', 'verify123')).toBe(false);
  });

  it('parseWebhook parses body', () => {
    const events = gw.parseWebhook({ entry: [] });
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('message_received');
  });
});
