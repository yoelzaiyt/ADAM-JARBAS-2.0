import type {
  SyncEngine as ISyncEngine,
  SyncResult,
  SyncMode,
  ProviderName,
} from './interfaces.js';

export class SyncEngine implements ISyncEngine {
  private syncing = false;
  private lastSyncDates: Map<ProviderName, Date> = new Map();
  private history: SyncResult[] = [];

  async syncAll(provider: ProviderName, mode: SyncMode): Promise<SyncResult[]> {
    this.syncing = true;
    const results: SyncResult[] = [];
    const now = new Date();

    const folders = ['inbox', 'sent', 'drafts', 'archive'];
    for (const folder of folders) {
      const result: SyncResult = {
        folderId: `${provider}/${folder}`, synced: 0, new: 0, updated: 0,
        deleted: 0, errors: [], duration: 0, lastSyncDate: now,
      };
      results.push(result);
      this.history.push(result);
    }

    this.lastSyncDates.set(provider, now);
    this.syncing = false;
    return results;
  }

  async syncFolder(folderId: string, mode: SyncMode): Promise<SyncResult> {
    const now = new Date();
    const result: SyncResult = {
      folderId, synced: 0, new: 0, updated: 0, deleted: 0,
      errors: [], duration: 0, lastSyncDate: now,
    };
    this.history.push(result);
    return result;
  }

  getLastSyncDate(provider: ProviderName): Date | null {
    return this.lastSyncDates.get(provider) ?? null;
  }

  setSyncDate(provider: ProviderName, date: Date): void {
    this.lastSyncDates.set(provider, date);
  }

  getSyncHistory(): SyncResult[] {
    return [...this.history];
  }

  isSyncing(): boolean {
    return this.syncing;
  }
}
