import { randomUUID } from 'node:crypto';
import type {
  MailboxManager as IMailboxManager,
  MailboxFolder,
  ProviderName,
  FolderType,
} from './interfaces.js';

export class MailboxManager implements IMailboxManager {
  private folders: Map<string, MailboxFolder> = new Map();

  constructor() {
    this.initDefaultFolders();
  }

  async getFolders(provider: ProviderName): Promise<MailboxFolder[]> {
    return Array.from(this.folders.values()).filter(f => f.provider === provider);
  }

  getFolder(folderId: string): MailboxFolder | null {
    return this.folders.get(folderId) ?? null;
  }

  async createFolder(provider: ProviderName, name: string, parentId?: string): Promise<MailboxFolder> {
    const id = randomUUID();
    const folder: MailboxFolder = {
      id, name, type: 'custom', parentId, unreadCount: 0, totalCount: 0,
      provider, providerFolderId: `${provider}/${name}`,
    };
    this.folders.set(id, folder);
    return folder;
  }

  async renameFolder(folderId: string, newName: string): Promise<void> {
    const folder = this.folders.get(folderId);
    if (folder) folder.name = newName;
  }

  async deleteFolder(folderId: string): Promise<void> {
    this.folders.delete(folderId);
  }

  async getFolderCounts(provider: ProviderName): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const [id, folder] of this.folders) {
      if (folder.provider === provider) counts[id] = folder.unreadCount;
    }
    return counts;
  }

  private initDefaultFolders(): void {
    const types: FolderType[] = ['inbox', 'sent', 'drafts', 'archive', 'spam', 'trash'];
    for (const type of types) {
      const id = `default-${type}`;
      this.folders.set(id, {
        id, name: type.charAt(0).toUpperCase() + type.slice(1), type,
        unreadCount: 0, totalCount: 0, provider: 'gmail', providerFolderId: type,
      });
    }
  }
}
