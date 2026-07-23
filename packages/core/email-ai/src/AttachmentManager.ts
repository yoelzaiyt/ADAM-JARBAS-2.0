import { randomUUID } from 'node:crypto';
import type {
  AttachmentManager as IAttachmentManager,
  ProcessedAttachment,
  EmailAttachment,
  AttachmentScanResult,
  AttachmentType,
} from './interfaces.js';

export class AttachmentManager implements IAttachmentManager {
  private processed: Map<string, ProcessedAttachment> = new Map();

  async process(attachment: EmailAttachment): Promise<ProcessedAttachment> {
    const id = randomUUID();
    const result: ProcessedAttachment = {
      id,
      originalId: attachment.id,
      type: attachment.type,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      extractedText: attachment.extractedText,
      riskLevel: 'nenhum',
      processedAt: new Date(),
    };
    this.processed.set(id, result);
    return result;
  }

  getByEmail(emailId: string): ProcessedAttachment[] {
    return Array.from(this.processed.values());
  }

  getById(attachmentId: string): ProcessedAttachment | null {
    return this.processed.get(attachmentId) ?? null;
  }

  async extractText(attachmentId: string): Promise<string> {
    const att = this.processed.get(attachmentId);
    if (!att) throw new Error(`Attachment not found: ${attachmentId}`);
    return att.extractedText ?? `[Text extraction for ${att.filename}]`;
  }

  async scanForThreats(attachmentId: string): Promise<AttachmentScanResult> {
    const att = this.processed.get(attachmentId);
    if (!att) throw new Error(`Attachment not found: ${attachmentId}`);
    return { clean: true, threats: [], scanDate: new Date(), engine: 'jarbas-av' };
  }

  async delete(attachmentId: string): Promise<void> {
    this.processed.delete(attachmentId);
  }
}
