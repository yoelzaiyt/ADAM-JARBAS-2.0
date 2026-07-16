import { describe, it, expect, beforeEach } from 'vitest';
import { MailboxManager } from '../MailboxManager.js';

describe('MailboxManager', () => {
  let mgr: MailboxManager;

  beforeEach(() => { mgr = new MailboxManager(); });

  it('creates manager', () => { expect(mgr).toBeDefined(); });

  it('getFolders returns default folders', async () => {
    const folders = await mgr.getFolders('gmail');
    expect(folders.length).toBeGreaterThanOrEqual(6);
  });

  it('createFolder creates new folder', async () => {
    const folder = await mgr.createFolder('gmail', 'Projects');
    expect(folder.name).toBe('Projects');
    expect(folder.type).toBe('custom');
  });

  it('getFolder returns folder', async () => {
    const folder = await mgr.createFolder('gmail', 'Test');
    expect(mgr.getFolder(folder.id)).toBeDefined();
  });

  it('renameFolder works', async () => {
    const folder = await mgr.createFolder('gmail', 'Old');
    await mgr.renameFolder(folder.id, 'New');
    expect(mgr.getFolder(folder.id)?.name).toBe('New');
  });

  it('deleteFolder removes folder', async () => {
    const folder = await mgr.createFolder('gmail', 'Temp');
    await mgr.deleteFolder(folder.id);
    expect(mgr.getFolder(folder.id)).toBeNull();
  });
});
