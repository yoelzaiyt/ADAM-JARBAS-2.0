import { describe, it, expect, vi } from 'vitest';
import { MemoryIntegration } from '../MemoryIntegration.js';
import type { MemoryStoreRequest, MemoryContextRequest } from '../interfaces.js';

function storeReq(overrides: Partial<MemoryStoreRequest> = {}): MemoryStoreRequest {
  return {
    content: 'test content',
    tenantId: 't1',
    sessionId: 's1',
    type: 'knowledge',
    ...overrides,
  };
}

function ctxReq(overrides: Partial<MemoryContextRequest> = {}): MemoryContextRequest {
  return {
    sessionId: 's1',
    tenantId: 't1',
    query: 'test',
    ...overrides,
  };
}

describe('MemoryIntegration', () => {
  it('store: stores a memory entry', async () => {
    const mem = new MemoryIntegration();
    await mem.store(storeReq({ content: 'hello world' }));
    const result = await mem.search('hello', 't1');
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].content).toBe('hello world');
  });

  it('getContext: returns matching entries for query', async () => {
    const mem = new MemoryIntegration();
    await mem.store(storeReq({ content: 'javascript tips' }));
    await mem.store(storeReq({ content: 'python tips' }));
    const result = await mem.getContext(ctxReq({ query: 'javascript' }));
    expect(result.entries.length).toBeGreaterThanOrEqual(1);
    expect(result.totalTokens).toBeGreaterThanOrEqual(0);
    expect(typeof result.queryTimeMs).toBe('number');
  });

  it('search: returns entries matching query', async () => {
    const mem = new MemoryIntegration();
    await mem.store(storeReq({ content: 'alpha bravo' }));
    await mem.store(storeReq({ content: 'charlie delta' }));
    const results = await mem.search('alpha', 't1');
    expect(results.length).toBeGreaterThanOrEqual(1);
    const contents = results.map((r) => r.content);
    expect(contents).toContain('alpha bravo');
  });

  it('search: respects limit', async () => {
    const mem = new MemoryIntegration();
    for (let i = 0; i < 5; i++) {
      await mem.store(storeReq({ content: `item ${i}` }));
    }
    const results = await mem.search('item', 't1', 2);
    expect(results).toHaveLength(2);
  });

  it('delete: removes entry', async () => {
    const mem = new MemoryIntegration();
    await mem.store(storeReq({ content: 'delete me' }));
    const before = await mem.search('delete', 't1');
    expect(before.length).toBeGreaterThanOrEqual(1);

    const entryId = before[0].metadata.id as string;
    await mem.delete(entryId);

    const after = await mem.search('delete', 't1');
    const remaining = after.filter((e) => (e.metadata.id as string) === entryId);
    expect(remaining).toHaveLength(0);
  });

  it('getContext: respects limit and threshold', async () => {
    const mem = new MemoryIntegration();
    for (let i = 0; i < 10; i++) {
      await mem.store(storeReq({ content: `entry number ${i}` }));
    }
    const result = await mem.getContext(ctxReq({ query: 'entry', limit: 3, threshold: 0.0 }));
    expect(result.entries.length).toBeLessThanOrEqual(3);
  });

  it('getContext: filters by tenantId', async () => {
    const mem = new MemoryIntegration();
    await mem.store(storeReq({ content: 'tenant1 data', tenantId: 't1' }));
    await mem.store(storeReq({ content: 'tenant2 data', tenantId: 't2' }));
    const result = await mem.getContext(ctxReq({ query: 'data', tenantId: 't1' }));
    const tenantIds = result.entries.map((e) => e.content);
    expect(tenantIds).not.toContain('tenant2 data');
  });

  it('works without MemoryManager (in-memory fallback)', async () => {
    const mem = new MemoryIntegration(undefined, {
      info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(),
    });
    await mem.store(storeReq({ content: 'fallback test' }));
    const results = await mem.search('fallback', 't1');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('delegates to MemoryManager when provided', async () => {
    const mockManager = {
      store: vi.fn().mockResolvedValue(undefined),
      getContext: vi.fn().mockResolvedValue({ entries: [], totalTokens: 0, queryTimeMs: 0 }),
      search: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    const mem = new MemoryIntegration(mockManager);
    await mem.store(storeReq());
    expect(mockManager.store).toHaveBeenCalledOnce();

    await mem.getContext(ctxReq());
    expect(mockManager.getContext).toHaveBeenCalledOnce();

    await mem.search('q', 't1');
    expect(mockManager.search).toHaveBeenCalledOnce();

    await mem.delete('id1');
    expect(mockManager.delete).toHaveBeenCalledWith('id1');
  });
});
