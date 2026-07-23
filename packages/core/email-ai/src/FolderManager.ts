import type {
  FolderManager as IFolderManager,
  MailboxFolder,
  ProviderName,
} from './interfaces.js';

export class FolderManager implements IFolderManager {
  getDefaultFolders(): MailboxFolder[] {
    const types = ['inbox', 'sent', 'drafts', 'archive', 'spam', 'trash'] as const;
    return types.map(type => ({
      id: `default-${type}`, name: type.charAt(0).toUpperCase() + type.slice(1),
      type, unreadCount: 0, totalCount: 0,
      provider: 'gmail' as ProviderName, providerFolderId: type,
    }));
  }

  mapToProviderFolder(folderId: string, provider: ProviderName): string {
    return `${provider}/${folderId}`;
  }

  mapFromProviderFolder(providerFolderId: string, provider: ProviderName): string {
    return providerFolderId.replace(`${provider}/`, '');
  }

  async moveToFolder(emailId: string, targetFolderId: string): Promise<void> {
    // Provider-specific move
  }

  async moveToArchive(emailId: string): Promise<void> {
    await this.moveToFolder(emailId, 'archive');
  }

  async moveToTrash(emailId: string): Promise<void> {
    await this.moveToFolder(emailId, 'trash');
  }

  async moveToSpam(emailId: string): Promise<void> {
    await this.moveToFolder(emailId, 'spam');
  }

  async restoreFromTrash(emailId: string): Promise<void> {
    await this.moveToFolder(emailId, 'inbox');
  }

  async emptyTrash(provider: ProviderName): Promise<void> {
    // Provider-specific empty trash
  }
}
