import { randomUUID } from 'node:crypto';
import type {
  EmailMessage,
  EmailSendRequest,
  EmailAddress,
  MessageDirection,
  MessageStatus,
  EmailPriority,
  AttachmentType,
  SpamLevel,
  PhishingRisk,
} from './interfaces.js';

export class EmailGateway {
  private provider: string;

  constructor(provider: string = 'gmail') {
    this.provider = provider;
  }

  async send(request: EmailSendRequest): Promise<EmailMessage> {
    return this.createMessage({
      from: { name: 'System', email: 'system@jarbas.ai' },
      to: request.to,
      cc: request.cc,
      bcc: request.bcc,
      subject: request.subject,
      textBody: request.body,
      htmlBody: request.htmlBody,
      attachments: request.attachments ?? [],
      direction: 'outbound',
      priority: request.priority ?? 'media',
      replyToId: request.replyToId,
    });
  }

  async sendRaw(to: EmailAddress[], subject: string, body: string): Promise<EmailMessage> {
    return this.send({ to, subject, body });
  }

  async reply(originalId: string, to: EmailAddress[], body: string, cc?: EmailAddress[]): Promise<EmailMessage> {
    return this.send({ to, subject: `Re: ${originalId}`, body, cc, replyToId: originalId });
  }

  async forward(originalId: string, to: EmailAddress[], body: string): Promise<EmailMessage> {
    return this.send({ to, subject: `Fwd: ${originalId}`, body });
  }

  async delete(emailId: string): Promise<void> {
    // Provider-specific delete
  }

  async archive(emailId: string): Promise<void> {
    // Provider-specific archive
  }

  async markAsRead(emailId: string): Promise<void> {
    // Provider-specific mark read
  }

  async markAsStarred(emailId: string, starred: boolean): Promise<void> {
    // Provider-specific star
  }

  getProvider(): string {
    return this.provider;
  }

  private createMessage(params: {
    from: EmailAddress;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    subject: string;
    textBody: string;
    htmlBody?: string;
    attachments: { id: string; filename: string; mimeType: string; sizeBytes: number; type: AttachmentType; isInline: boolean }[];
    direction: MessageDirection;
    priority: EmailPriority;
    replyToId?: string;
  }): EmailMessage {
    const now = new Date();
    return {
      id: randomUUID(),
      messageId: `<${randomUUID()}@jarbas.ai>`,
      from: params.from,
      to: params.to,
      cc: params.cc,
      bcc: params.bcc,
      subject: params.subject,
      textBody: params.textBody,
      htmlBody: params.htmlBody,
      attachments: params.attachments.map(a => ({
        ...a, contentId: undefined, url: undefined, content: undefined,
        extractedText: undefined, scanResult: undefined,
      })),
      direction: params.direction,
      status: 'sent' as MessageStatus,
      labels: [],
      isRead: true,
      isStarred: false,
      priority: params.priority,
      spamLevel: 'nenhum' as SpamLevel,
      phishingRisk: 'nenhum' as PhishingRisk,
      receivedAt: now,
      sentAt: now,
      createdAt: now,
      updatedAt: now,
      metadata: { replyToId: params.replyToId },
    };
  }
}
