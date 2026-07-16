import { describe, it, expect, beforeEach } from 'vitest';
import { AttachmentManager } from '../AttachmentManager.js';
import type { EmailAttachment } from '../interfaces.js';

function makeAtt(filename: string): EmailAttachment {
  return {
    id: `att-${Math.random()}`, filename, mimeType: 'application/pdf',
    sizeBytes: 1024, type: 'pdf', isInline: false,
  };
}

describe('AttachmentManager', () => {
  let mgr: AttachmentManager;

  beforeEach(() => { mgr = new AttachmentManager(); });

  it('creates manager', () => { expect(mgr).toBeDefined(); });

  it('processes attachment', async () => {
    const result = await mgr.process(makeAtt('doc.pdf'));
    expect(result.id).toBeDefined();
    expect(result.filename).toBe('doc.pdf');
  });

  it('getById returns attachment', async () => {
    const result = await mgr.process(makeAtt('test.pdf'));
    expect(mgr.getById(result.id)).toBeDefined();
  });

  it('extractText returns text', async () => {
    const result = await mgr.process(makeAtt('doc.pdf'));
    const text = await mgr.extractText(result.id);
    expect(typeof text).toBe('string');
  });

  it('scanForThreats returns clean', async () => {
    const result = await mgr.process(makeAtt('doc.pdf'));
    const scan = await mgr.scanForThreats(result.id);
    expect(scan.clean).toBe(true);
  });

  it('delete removes attachment', async () => {
    const result = await mgr.process(makeAtt('temp.pdf'));
    await mgr.delete(result.id);
    expect(mgr.getById(result.id)).toBeNull();
  });
});
