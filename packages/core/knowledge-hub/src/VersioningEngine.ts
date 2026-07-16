import type { VersioningEngine as IVersioningEngine, DocumentVersion, Document } from './interfaces.js';
import { randomUUID } from 'node:crypto';

export class VersioningEngine implements IVersioningEngine {
  private versions: Map<string, DocumentVersion[]> = new Map();
  private documents: Map<string, Document> = new Map();

  async createVersion(
    documentId: string,
    content: string,
    metadata?: Record<string, unknown>,
  ): Promise<DocumentVersion> {
    const hash = this.simpleHash(content);
    const checksum = this.generateChecksum(content);
    const currentVersions = this.versions.get(documentId) || [];

    const versionNumber = currentVersions.length + 1;

    for (const v of currentVersions) {
      if (v.status === 'current') {
        v.status = 'archived';
      }
    }

    const newVersion: DocumentVersion = {
      documentId,
      version: versionNumber,
      hash,
      checksum,
      author: (metadata?.author as string) ?? undefined,
      source: (metadata?.source as string) ?? 'internal',
      changeDescription: (metadata?.changeDescription as string) ?? undefined,
      createdAt: new Date(),
      status: 'current',
    };

    currentVersions.push(newVersion);
    this.versions.set(documentId, currentVersions);

    return newVersion;
  }

  async getVersion(documentId: string, version: number): Promise<DocumentVersion | null> {
    const currentVersions = this.versions.get(documentId);
    if (!currentVersions) return null;

    const found = currentVersions.find(v => v.version === version);
    return found ?? null;
  }

  async getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
    return this.versions.get(documentId) || [];
  }

  async revertToVersion(documentId: string, version: number): Promise<Document> {
    const targetVersion = await this.getVersion(documentId, version);
    if (!targetVersion) {
      throw new Error(`Version ${version} not found for document ${documentId}`);
    }

    const existingDoc = this.documents.get(documentId);
    if (!existingDoc) {
      throw new Error(`Document ${documentId} not found`);
    }

    const revertedDoc: Document = {
      ...existingDoc,
      content: `[REVERTED to version ${version}] ${existingDoc.content}`,
      version,
      checksum: targetVersion.checksum,
      hash: targetVersion.hash,
      updatedAt: new Date(),
    };

    this.documents.set(documentId, revertedDoc);
    return revertedDoc;
  }

  async getCurrentVersion(documentId: string): Promise<DocumentVersion | null> {
    const currentVersions = this.versions.get(documentId);
    if (!currentVersions) return null;

    const current = currentVersions.find(v => v.status === 'current');
    return current ?? null;
  }

  storeDocument(doc: Document): void {
    this.documents.set(doc.id, doc);
  }

  private simpleHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  private generateChecksum(content: string): string {
    const length = content.length;
    let charSum = 0;
    for (let i = 0; i < content.length; i++) {
      charSum += content.charCodeAt(i);
    }
    return `${length}:${charSum}`;
  }
}

export { VersioningEngine as Versioning };
