import { randomUUID } from 'node:crypto';
import type {
  DocumentParser as IDocumentParser,
  ParsedDocument,
} from './interfaces.js';

export class DocumentParser implements IDocumentParser {
  private supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/csv',
    'text/plain',
    'image/png',
    'image/jpeg',
  ];

  async parse(buffer: Buffer, mimeType: string, filename: string): Promise<ParsedDocument> {
    const text = buffer.toString('utf-8');
    const words = text.split(/\s+/).filter(Boolean);
    return {
      id: randomUUID(),
      text,
      wordCount: words.length,
      metadata: { filename, mimeType, size: buffer.length },
      createdAt: new Date(),
    };
  }

  parseEmailBody(html: string, text: string): ParsedDocument {
    const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return {
      id: randomUUID(),
      text: cleanText,
      wordCount: cleanText.split(/\s+/).filter(Boolean).length,
      metadata: { source: 'email_body' },
      createdAt: new Date(),
    };
  }

  supportsMimeType(mimeType: string): boolean {
    return this.supportedTypes.includes(mimeType);
  }

  getSupportedTypes(): string[] {
    return [...this.supportedTypes];
  }
}
