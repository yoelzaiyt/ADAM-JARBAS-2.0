import { randomUUID } from 'node:crypto';
import type {
  WhatsAppGateway as IWhatsAppGateway,
  GatewayConfig,
  GatewayMessage,
  SendOptions,
  WhatsAppEvent,
  ProviderName,
  MessageType,
  MessageStatus,
} from './interfaces.js';

export class WhatsAppGateway implements IWhatsAppGateway {
  private config: GatewayConfig;
  private connected = true;

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  async send(options: SendOptions): Promise<GatewayMessage> {
    return this.createMessage(options.to, options.type, options.text, 'outbound');
  }

  async sendText(to: string, text: string): Promise<GatewayMessage> {
    return this.createMessage(to, 'text', text, 'outbound');
  }

  async sendAudio(to: string, mediaUrl: string): Promise<GatewayMessage> {
    return this.createMessage(to, 'audio', undefined, 'outbound', mediaUrl);
  }

  async sendDocument(to: string, mediaUrl: string, filename: string): Promise<GatewayMessage> {
    return this.createMessage(to, 'document', filename, 'outbound', mediaUrl);
  }

  async sendImage(to: string, mediaUrl: string, caption?: string): Promise<GatewayMessage> {
    return this.createMessage(to, 'image', undefined, 'outbound', mediaUrl, caption);
  }

  async sendMessage(message: GatewayMessage): Promise<GatewayMessage> {
    return { ...message, status: 'sent' as MessageStatus };
  }

  verifyWebhook(mode: string, token: string): boolean {
    return mode === 'subscribe' && token === this.config.webhookVerifyToken;
  }

  parseWebhook(body: unknown): WhatsAppEvent[] {
    const events: WhatsAppEvent[] = [];
    const data = body as Record<string, unknown>;
    if (data && typeof data === 'object') {
      events.push({ type: 'message_received', timestamp: new Date(), data: data as Record<string, unknown> });
    }
    return events;
  }

  getProvider(): ProviderName {
    return this.config.provider;
  }

  isConnected(): boolean {
    return this.connected;
  }

  private createMessage(to: string, type: MessageType, text?: string, direction: 'inbound' | 'outbound' = 'outbound', mediaUrl?: string, caption?: string): GatewayMessage {
    return {
      id: randomUUID(),
      from: this.config.phoneNumberId,
      to,
      type,
      direction,
      text,
      mediaUrl,
      caption,
      timestamp: new Date(),
      status: 'pending',
      provider: this.config.provider,
      metadata: {},
    };
  }
}
