import { randomUUID } from 'node:crypto';
import type {
  DocumentHandler as IDocumentHandler,
  ReceivedDocument,
  GatewayMessage,
} from './interfaces.js';

export class DocumentHandler implements IDocumentHandler {
  private documents: Map<string, ReceivedDocument> = new Map();

  async processDocument(url: string, contactId: string, filename: string): Promise<ReceivedDocument> {
    const id = randomUUID();
    const doc: ReceivedDocument = {
      id, contactId, documentUrl: url, filename,
      mimeType: 'application/pdf', sizeBytes: 2048, receivedAt: new Date(),
    };
    this.documents.set(id, doc);
    return doc;
  }

  async sendDocument(to: string, url: string, filename: string): Promise<GatewayMessage> {
    return {
      id: randomUUID(), from: 'system', to, type: 'document',
      direction: 'outbound', mediaUrl: url, timestamp: new Date(),
      status: 'pending', provider: 'meta',
      metadata: { filename },
    };
  }

  getDocument(docId: string): ReceivedDocument | null {
    return this.documents.get(docId) ?? null;
  }

  async summarizeDocument(docId: string): Promise<string> {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error(`Document not found: ${docId}`);
    doc.summary = `Summary of ${doc.filename}`;
    return doc.summary;
  }
}
