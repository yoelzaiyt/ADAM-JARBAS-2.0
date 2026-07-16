import { describe, it, expect } from 'vitest';
import { VersioningEngine } from '../VersioningEngine.js';
import type { Document } from '../interfaces.js';

function makeDoc(id: string, content: string): Document {
  return {
    id,
    title: `Doc ${id}`,
    content,
    tenantId: 't1',
    sourceType: 'internal',
    hash: '0',
    checksum: '0',
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('VersioningEngine', () => {
  it('createVersion creates version 1', async () => {
    const engine = new VersioningEngine();

    const v1 = await engine.createVersion('doc1', 'initial content');

    expect(v1.version).toBe(1);
    expect(v1.status).toBe('current');
    expect(v1.documentId).toBe('doc1');
    expect(v1.hash).toBeTruthy();
    expect(v1.checksum).toBeTruthy();
  });

  it('createVersion creates version 2, archives version 1', async () => {
    const engine = new VersioningEngine();

    await engine.createVersion('doc1', 'first version');
    const v2 = await engine.createVersion('doc1', 'second version');

    expect(v2.version).toBe(2);
    expect(v2.status).toBe('current');

    const v1 = await engine.getVersion('doc1', 1);
    expect(v1?.status).toBe('archived');
  });

  it('getVersion returns specific version', async () => {
    const engine = new VersioningEngine();

    await engine.createVersion('doc1', 'v1 content');
    await engine.createVersion('doc1', 'v2 content');
    await engine.createVersion('doc1', 'v3 content');

    const v2 = await engine.getVersion('doc1', 2);

    expect(v2).not.toBeNull();
    expect(v2?.version).toBe(2);
  });

  it('getVersionHistory returns all versions', async () => {
    const engine = new VersioningEngine();

    await engine.createVersion('doc1', 'v1');
    await engine.createVersion('doc1', 'v2');
    await engine.createVersion('doc1', 'v3');

    const history = await engine.getVersionHistory('doc1');

    expect(history).toHaveLength(3);
    expect(history.map(v => v.version)).toEqual([1, 2, 3]);
  });

  it('getCurrentVersion returns latest', async () => {
    const engine = new VersioningEngine();

    await engine.createVersion('doc1', 'v1');
    await engine.createVersion('doc1', 'v2');
    await engine.createVersion('doc1', 'v3');

    const current = await engine.getCurrentVersion('doc1');

    expect(current).not.toBeNull();
    expect(current?.version).toBe(3);
    expect(current?.status).toBe('current');
  });

  it('revertToVersion restores old content', async () => {
    const engine = new VersioningEngine();

    const doc = makeDoc('doc1', 'original content');
    engine.storeDocument(doc);

    await engine.createVersion('doc1', 'original content');
    await engine.createVersion('doc1', 'updated content');

    const reverted = await engine.revertToVersion('doc1', 1);

    expect(reverted.version).toBe(1);
    expect(reverted.content).toContain('original content');
    expect(reverted.content).toContain('[REVERTED to version 1]');
    expect(reverted.hash).toBe((await engine.getVersion('doc1', 1))?.hash);
  });
});
