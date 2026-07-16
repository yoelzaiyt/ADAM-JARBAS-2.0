import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { Release, ReleaseType } from '../interfaces.js';

export class ReleaseManager {
  private releases: Map<string, Release> = new Map();
  private log = createLogger('ReleaseManager');

  createRelease(release: Omit<Release, 'id' | 'createdAt'>): Release {
    const newRelease: Release = {
      ...release,
      id: generateId(),
      createdAt: new Date()
    };
    this.releases.set(newRelease.id, newRelease);
    this.log(`Created release: ${newRelease.version}`);
    return newRelease;
  }

  updateStatus(id: string, status: Release['status']): boolean {
    const release = this.releases.get(id);
    if (!release) return false;
    release.status = status;
    if (status === 'released') release.releasedAt = new Date();
    return true;
  }

  getById(id: string): Release | undefined {
    return this.releases.get(id);
  }

  getAll(): Release[] {
    return Array.from(this.releases.values());
  }

  getLatest(): Release | undefined {
    const released = Array.from(this.releases.values()).filter(r => r.status === 'released');
    return released.sort((a, b) => b.version.localeCompare(a.version))[0];
  }

  getByType(type: ReleaseType): Release[] {
    return Array.from(this.releases.values()).filter(r => r.type === type);
  }

  getChangelog(): string[] {
    return Array.from(this.releases.values())
      .filter(r => r.status === 'released')
      .sort((a, b) => (b.releasedAt?.getTime() || 0) - (a.releasedAt?.getTime() || 0))
      .flatMap(r => [`## ${r.version}`, ...r.changelog, '']);
  }

  getNextVersion(type: ReleaseType): string {
    const latest = this.getLatest();
    if (!latest) return type === 'major' ? '1.0.0' : type === 'minor' ? '0.1.0' : '0.0.1';
    const [major, minor, patch] = latest.version.split('.').map(Number);
    switch (type) {
      case 'major': return `${major + 1}.0.0`;
      case 'minor': return `${major}.${minor + 1}.0`;
      case 'patch': return `${major}.${minor}.${patch + 1}`;
      case 'hotfix': return `${major}.${minor}.${patch + 1}-hotfix`;
      default: return `${major}.${minor}.${patch + 1}`;
    }
  }
}
