import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentManager } from '../document-manager/DocumentManager.js';

const CID = 'comp-1';

function docData(overrides = {}) {
  return {
    companyId: CID,
    name: 'Contract v1',
    type: 'pdf' as const,
    category: 'contracts',
    fileUrl: '/docs/contract.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
    tags: ['legal'],
    metadata: {},
    uploadedBy: 'user-1',
    ...overrides,
  };
}

describe('DocumentManager', () => {
  let dm: DocumentManager;

  beforeEach(() => {
    dm = new DocumentManager();
  });

  it('creates and retrieves a document', async () => {
    const doc = await dm.createDocument(docData());
    expect(doc.id).toBeDefined();
    expect(doc.version).toBe(1);
    expect(doc.versions).toHaveLength(1);
    const found = await dm.getDocumentById(doc.id);
    expect(found?.name).toBe('Contract v1');
  });

  it('adds versions and tracks history', async () => {
    const doc = await dm.createDocument(docData());
    await dm.addVersion(doc.id, { fileUrl: '/docs/contract-v2.pdf', uploadedBy: 'user-2', changelog: 'Updated terms' });
    const history = await dm.getVersionHistory(doc.id);
    expect(history).toHaveLength(2);
    expect(history[0].version).toBe(2);
    const updated = await dm.getDocumentById(doc.id);
    expect(updated?.version).toBe(2);
    expect(updated?.fileUrl).toBe('/docs/contract-v2.pdf');
  });

  it('restores a previous version', async () => {
    const doc = await dm.createDocument(docData());
    await dm.addVersion(doc.id, { fileUrl: '/docs/v2.pdf', uploadedBy: 'u2', changelog: 'v2' });
    const restored = await dm.restoreVersion(doc.id, 1);
    expect(restored.version).toBe(3);
    expect(restored.fileUrl).toBe('/docs/contract.pdf');
    expect(restored.versions).toHaveLength(3);
  });

  it('manages permissions', async () => {
    const doc = await dm.createDocument(docData());
    await dm.setPermission(doc.id, { userId: 'u2', level: 'read' });
    expect(await dm.checkPermission(doc.id, 'u2', 'read')).toBe(true);
    expect(await dm.checkPermission(doc.id, 'u2', 'write')).toBe(false);
    await dm.setPermission(doc.id, { userId: 'u2', level: 'admin' });
    expect(await dm.checkPermission(doc.id, 'u2', 'admin')).toBe(true);
    await dm.removePermission(doc.id, 'u2');
    expect(await dm.checkPermission(doc.id, 'u2', 'read')).toBe(false);
  });

  it('manages tags', async () => {
    const doc = await dm.createDocument(docData());
    await dm.addTag(doc.id, 'important');
    expect((await dm.getDocumentById(doc.id))?.tags).toContain('important');
    await dm.removeTag(doc.id, 'legal');
    expect((await dm.getDocumentById(doc.id))?.tags).not.toContain('legal');
  });

  it('lists documents with filters', async () => {
    await dm.createDocument(docData({ name: 'A', type: 'pdf' }));
    await dm.createDocument(docData({ name: 'B', type: 'docx', category: 'finance' }));
    const pdfs = await dm.listDocuments(CID, { type: 'pdf' });
    expect(pdfs).toHaveLength(1);
    const searched = await dm.listDocuments(CID, { search: 'B' });
    expect(searched).toHaveLength(1);
  });

  it('computes stats', async () => {
    await dm.createDocument(docData({ type: 'pdf' }));
    await dm.createDocument(docData({ type: 'xlsx', name: 'X' }));
    const stats = await dm.getStats(CID);
    expect(stats.total).toBe(2);
    expect(stats.byType['pdf']).toBe(1);
    expect(stats.totalVersions).toBe(2);
  });
});
