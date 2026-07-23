import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentHandler } from '../DocumentHandler.js';

describe('DocumentHandler', () => {
  let handler: DocumentHandler;

  beforeEach(() => {
    handler = new DocumentHandler();
  });

  it('processes document', async () => {
    const doc = await handler.processDocument('https://example.com/file.pdf', 'c1', 'file.pdf');
    expect(doc.filename).toBe('file.pdf');
    expect(doc.contactId).toBe('c1');
  });

  it('sendDocument creates message', async () => {
    const msg = await handler.sendDocument('5511999', 'url', 'file.pdf');
    expect(msg.type).toBe('document');
    expect(msg.mediaUrl).toBe('url');
  });

  it('getDocument returns null for nonexistent', () => {
    expect(handler.getDocument('bad')).toBeNull();
  });

  it('summarizes document', async () => {
    const doc = await handler.processDocument('url', 'c1', 'report.pdf');
    const summary = await handler.summarizeDocument(doc.id);
    expect(summary).toContain('report.pdf');
  });
});
