import { describe, it, expect } from 'vitest';
import { DeduplicationEngine } from '../DeduplicationEngine.js';
import type { Document } from '../interfaces.js';

function makeDoc(id: string, content: string, hash?: string): Document {
  return {
    id,
    title: `Doc ${id}`,
    content,
    tenantId: 't1',
    sourceType: 'internal',
    hash: hash ?? content,
    checksum: `${content.length}`,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('DeduplicationEngine', () => {
  it('detect finds exact duplicates by hash', async () => {
    const engine = new DeduplicationEngine();
    const docA = makeDoc('a', 'hello world', 'hash1');
    const docB = makeDoc('b', 'hello world', 'hash1');
    const docC = makeDoc('c', 'different content', 'hash2');
    engine.addDocument(docA);
    engine.addDocument(docB);
    engine.addDocument(docC);

    const result = await engine.detect(['a', 'b', 'c']);

    expect(result.duplicates.length).toBe(1);
    expect(result.duplicates[0].type).toBe('exact');
    expect(result.duplicates[0].documents).toContain('a');
    expect(result.duplicates[0].documents).toContain('b');
    expect(result.duplicatesRemoved).toBe(1);
  });

  it('detect finds near-duplicates by Jaccard similarity', async () => {
    const engine = new DeduplicationEngine();
    const docA = makeDoc('a', 'the quick brown fox jumps over the lazy dog', 'h1');
    const docB = makeDoc('b', 'the quick brown fox jumps over a lazy dog', 'h2');
    engine.addDocument(docA);
    engine.addDocument(docB);

    const result = await engine.detect(['a', 'b'], 0.7);

    expect(result.duplicates.length).toBe(1);
    expect(result.duplicates[0].type).toBe('near-duplicate');
    expect(result.duplicates[0].similarity).toBeGreaterThanOrEqual(0.7);
  });

  it('removeDuplicates keeps first document', async () => {
    const engine = new DeduplicationEngine();
    const docA = makeDoc('a', 'content', 'hash1');
    const docB = makeDoc('b', 'content', 'hash1');
    const docC = makeDoc('c', 'content', 'hash1');
    engine.addDocument(docA);
    engine.addDocument(docB);
    engine.addDocument(docC);

    const result = await engine.detect(['a', 'b', 'c']);
    const groupId = result.duplicates[0].groupId;
    const kept = await engine.removeDuplicates(groupId);

    expect(kept).toEqual(['a']);
  });

  it('getSimilar finds similar documents', async () => {
    const engine = new DeduplicationEngine();
    const docA = makeDoc('a', 'machine learning is a subset of artificial intelligence', 'h1');
    const docB = makeDoc('b', 'machine learning is a part of artificial intelligence', 'h2');
    const docC = makeDoc('c', 'completely different topic about cooking recipes', 'h3');
    engine.addDocument(docA);
    engine.addDocument(docB);
    engine.addDocument(docC);

    const similar = await engine.getSimilar('a', 0.5);

    expect(similar.some(d => d.id === 'b')).toBe(true);
    expect(similar.some(d => d.id === 'c')).toBe(false);
  });

  it('Empty input returns empty result', async () => {
    const engine = new DeduplicationEngine();

    const result = await engine.detect([]);

    expect(result.duplicates).toEqual([]);
    expect(result.uniqueDocuments).toBe(0);
    expect(result.duplicatesRemoved).toBe(0);
  });
});
