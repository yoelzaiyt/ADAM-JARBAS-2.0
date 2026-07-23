import { describe, it, expect, beforeEach } from 'vitest';
import { FolderManager } from '../FolderManager.js';

describe('FolderManager', () => {
  let mgr: FolderManager;

  beforeEach(() => { mgr = new FolderManager(); });

  it('creates manager', () => { expect(mgr).toBeDefined(); });

  it('getDefaultFolders returns 6 folders', () => {
    expect(mgr.getDefaultFolders().length).toBe(6);
  });

  it('mapToProviderFolder maps', () => {
    expect(mgr.mapToProviderFolder('inbox', 'gmail')).toBe('gmail/inbox');
  });

  it('mapFromProviderFolder maps', () => {
    expect(mgr.mapFromProviderFolder('gmail/inbox', 'gmail')).toBe('inbox');
  });
});
