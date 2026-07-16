import { describe, it, expect } from 'vitest';
import { ReleaseManager } from '../release-manager/ReleaseManager.js';

describe('ReleaseManager', () => {
  const manager = new ReleaseManager();

  it('creates ReleaseManager', () => { expect(manager).toBeDefined(); });

  it('creates a release', () => {
    const release = manager.createRelease({
      version: '1.0.0', type: 'major', title: 'v1.0', description: 'First release',
      status: 'draft', changelog: ['Initial release'], breakingChanges: [], dependencies: [], author: 'dev'
    });
    expect(release.version).toBe('1.0.0');
  });

  it('updates status', () => {
    const release = manager.createRelease({
      version: '1.1.0', type: 'minor', title: 'v1.1', description: '',
      status: 'draft', changelog: [], breakingChanges: [], dependencies: [], author: 'dev'
    });
    manager.updateStatus(release.id, 'released');
    expect(manager.getById(release.id)!.status).toBe('released');
    expect(manager.getById(release.id)!.releasedAt).toBeDefined();
  });

  it('gets latest release', () => {
    manager.createRelease({ version: '2.0.0', type: 'major', title: 'v2', description: '', status: 'released', changelog: [], breakingChanges: [], dependencies: [], author: 'dev' });
    const latest = manager.getLatest();
    expect(latest).toBeDefined();
  });

  it('gets next version', () => {
    const next = manager.getNextVersion('patch');
    expect(next).toBeDefined();
  });

  it('gets changelog', () => {
    const changelog = manager.getChangelog();
    expect(Array.isArray(changelog)).toBe(true);
  });
});
