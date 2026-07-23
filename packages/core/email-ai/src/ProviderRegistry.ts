import type {
  ProviderConfig,
  ProviderCapabilities,
  ProviderRegistry as IProviderRegistry,
  ProviderName,
} from './interfaces.js';

export class ProviderRegistry implements IProviderRegistry {
  private providers: Map<ProviderName, ProviderConfig> = new Map();
  private capabilities: Map<ProviderName, ProviderCapabilities> = new Map();

  register(provider: ProviderConfig): void {
    this.providers.set(provider.name, provider);
    this.capabilities.set(provider.name, this.inferCapabilities(provider));
  }

  get(name: ProviderName): ProviderConfig | null {
    return this.providers.get(name) ?? null;
  }

  getAll(): ProviderConfig[] {
    return Array.from(this.providers.values());
  }

  getCapabilities(name: ProviderName): ProviderCapabilities {
    return this.capabilities.get(name) ?? this.defaultCapabilities();
  }

  remove(name: ProviderName): void {
    this.providers.delete(name);
    this.capabilities.delete(name);
  }

  private inferCapabilities(provider: ProviderConfig): ProviderCapabilities {
    const isImap = provider.name === 'imap_smtp' || provider.name === 'exchange';
    return {
      canSend: true,
      canReceive: true,
      supportsOAuth: provider.name === 'gmail' || provider.name === 'outlook',
      supportsIMAP: isImap || provider.name === 'yahoo',
      supportsSMTP: true,
      supportsLabels: provider.name === 'gmail',
      supportsFolders: true,
      supportsSearch: true,
      supportsRealtime: provider.name === 'gmail' || provider.name === 'outlook',
      maxAttachmentSize: 25 * 1024 * 1024,
      supportedAttachmentTypes: ['pdf', 'docx', 'xlsx', 'pptx', 'csv', 'txt', 'image', 'zip'],
    };
  }

  private defaultCapabilities(): ProviderCapabilities {
    return {
      canSend: false, canReceive: false, supportsOAuth: false,
      supportsIMAP: false, supportsSMTP: false, supportsLabels: false,
      supportsFolders: false, supportsSearch: false, supportsRealtime: false,
      maxAttachmentSize: 0, supportedAttachmentTypes: [],
    };
  }
}
