import { describe, it, expect, beforeEach } from 'vitest';
import { SyncEngine } from '../SyncEngine.js';

describe('SyncEngine', () => {
  let engine: SyncEngine;

  beforeEach(() => { engine = new SyncEngine(); });

  it('creates engine', () => { expect(engine).toBeDefined(); });

  it('syncAll returns results', async () => {
    const results = await engine.syncAll('gmail', 'incremental');
    expect(results.length).toBeGreaterThan(0);
    expect(engine.getLastSyncDate('gmail')).toBeDefined();
  });

  it('syncFolder returns result', async () => {
    const result = await engine.syncFolder('inbox', 'manual');
    expect(result.folderId).toBe('inbox');
  });

  it('isSyncing tracks state', async () => {
    expect(engine.isSyncing()).toBe(false);
  });

  it('getSyncHistory returns history', async () => {
    await engine.syncAll('gmail', 'incremental');
    expect(engine.getSyncHistory().length).toBe(4);
  });

  it('setSyncDate and getLastSyncDate', () => {
    const now = new Date();
    engine.setSyncDate('gmail', now);
    expect(engine.getLastSyncDate('gmail')?.getTime()).toBe(now.getTime());
  });
});
