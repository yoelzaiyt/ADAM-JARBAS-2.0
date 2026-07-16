import type {
  BusinessDocument,
  DocumentVersion,
  DocumentPermission,
  DocumentType,
  BusinessSuiteConfig,
} from '../interfaces.js';

class DefaultLogger {
  private context: string;
  constructor(context: string) { this.context = context; }
  async debug(msg: string, data?: unknown) { console.debug(`[${this.context}] DEBUG`, msg, data ?? ''); }
  async info(msg: string, data?: unknown) { console.log(`[${this.context}] INFO`, msg, data ?? ''); }
  async warn(msg: string, data?: unknown) { console.warn(`[${this.context}] WARN`, msg, data ?? ''); }
  async error(msg: string, data?: unknown) { console.error(`[${this.context}] ERROR`, msg, data ?? ''); }
}

export interface DocumentManagerConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export class DocumentManager {
  private logger = new DefaultLogger('document-manager');
  private documents = new Map<string, BusinessDocument>();
  private config: DocumentManagerConfig;

  constructor(config?: DocumentManagerConfig) {
    this.config = config ?? {};
  }

  async createDocument(data: Omit<BusinessDocument, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'versions' | 'permissions'>): Promise<BusinessDocument> {
    const now = new Date();
    const doc: BusinessDocument = {
      ...data,
      id: crypto.randomUUID(),
      version: 1,
      versions: [{
        version: 1,
        fileUrl: data.fileUrl,
        uploadedBy: data.uploadedBy,
        changelog: 'Initial version',
        uploadedAt: now,
      }],
      permissions: [],
      createdAt: now,
      updatedAt: now,
    };
    this.documents.set(doc.id, doc);
    await this.logger.info('Document created', { id: doc.id, name: doc.name });
    return doc;
  }

  async getDocumentById(id: string): Promise<BusinessDocument | undefined> {
    return this.documents.get(id);
  }

  async listDocuments(companyId: string, filters?: { type?: DocumentType; category?: string; tags?: string[]; search?: string }): Promise<BusinessDocument[]> {
    let results = Array.from(this.documents.values()).filter(d => d.companyId === companyId);
    if (filters?.type) results = results.filter(d => d.type === filters.type);
    if (filters?.category) results = results.filter(d => d.category === filters.category);
    if (filters?.tags && filters.tags.length > 0) {
      results = results.filter(d => filters.tags!.some(t => d.tags.includes(t)));
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(d => d.name.toLowerCase().includes(s) || (d.description?.toLowerCase().includes(s) ?? false));
    }
    return results;
  }

  async updateDocument(id: string, data: Partial<BusinessDocument>): Promise<BusinessDocument> {
    const existing = this.documents.get(id);
    if (!existing) throw new Error(`Document ${id} not found`);
    const updated: BusinessDocument = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.documents.set(id, updated);
    await this.logger.info('Document updated', { id });
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const deleted = this.documents.delete(id);
    if (deleted) await this.logger.info('Document deleted', { id });
    return deleted;
  }

  async addVersion(documentId: string, data: Omit<DocumentVersion, 'version' | 'uploadedAt'>): Promise<DocumentVersion> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);
    const versionNumber = doc.version + 1;
    const version: DocumentVersion = {
      ...data,
      version: versionNumber,
      uploadedAt: new Date(),
    };
    doc.versions.push(version);
    doc.version = versionNumber;
    doc.fileUrl = version.fileUrl;
    doc.updatedAt = new Date();
    this.documents.set(documentId, doc);
    await this.logger.info('Document version added', { documentId, version: versionNumber });
    return version;
  }

  async getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);
    return [...doc.versions].sort((a, b) => b.version - a.version);
  }

  async restoreVersion(documentId: string, version: number): Promise<BusinessDocument> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);
    const target = doc.versions.find(v => v.version === version);
    if (!target) throw new Error(`Version ${version} not found for document ${documentId}`);

    const newVersionNumber = doc.version + 1;
    const restoredVersion: DocumentVersion = {
      version: newVersionNumber,
      fileUrl: target.fileUrl,
      uploadedBy: target.uploadedBy,
      changelog: `Restored from version ${version}`,
      uploadedAt: new Date(),
    };
    doc.versions.push(restoredVersion);
    doc.version = newVersionNumber;
    doc.fileUrl = target.fileUrl;
    doc.updatedAt = new Date();
    this.documents.set(documentId, doc);
    await this.logger.info('Document version restored', { documentId, fromVersion: version, newVersion: newVersionNumber });
    return doc;
  }

  async setPermission(documentId: string, permission: DocumentPermission): Promise<BusinessDocument> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);
    const existingIdx = doc.permissions.findIndex(p => p.userId === permission.userId);
    if (existingIdx >= 0) {
      doc.permissions[existingIdx] = permission;
    } else {
      doc.permissions.push(permission);
    }
    doc.updatedAt = new Date();
    this.documents.set(documentId, doc);
    await this.logger.info('Document permission set', { documentId, userId: permission.userId, level: permission.level });
    return doc;
  }

  async removePermission(documentId: string, userId: string): Promise<BusinessDocument> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);
    doc.permissions = doc.permissions.filter(p => p.userId !== userId);
    doc.updatedAt = new Date();
    this.documents.set(documentId, doc);
    await this.logger.info('Document permission removed', { documentId, userId });
    return doc;
  }

  async checkPermission(documentId: string, userId: string, requiredLevel: 'read' | 'write' | 'admin'): Promise<boolean> {
    const doc = this.documents.get(documentId);
    if (!doc) return false;
    const perm = doc.permissions.find(p => p.userId === userId);
    if (!perm) return false;
    const levels = ['read', 'write', 'admin'];
    return levels.indexOf(perm.level) >= levels.indexOf(requiredLevel);
  }

  async addTag(documentId: string, tag: string): Promise<BusinessDocument> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);
    if (!doc.tags.includes(tag)) {
      doc.tags.push(tag);
      doc.updatedAt = new Date();
      this.documents.set(documentId, doc);
    }
    return doc;
  }

  async removeTag(documentId: string, tag: string): Promise<BusinessDocument> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);
    doc.tags = doc.tags.filter(t => t !== tag);
    doc.updatedAt = new Date();
    this.documents.set(documentId, doc);
    return doc;
  }

  async getStats(companyId: string): Promise<{ total: number; byType: Record<string, number>; totalVersions: number }> {
    const docs = Array.from(this.documents.values()).filter(d => d.companyId === companyId);
    const byType: Record<string, number> = {};
    let totalVersions = 0;
    for (const doc of docs) {
      byType[doc.type] = (byType[doc.type] ?? 0) + 1;
      totalVersions += doc.versions.length;
    }
    return { total: docs.length, byType, totalVersions };
  }
}

export { DocumentManager as default };
