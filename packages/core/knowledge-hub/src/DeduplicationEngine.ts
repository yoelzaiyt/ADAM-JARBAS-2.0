import type { DeduplicationEngine as IDeduplicationEngine, DeduplicationResult, DuplicateGroup, Document } from './interfaces.js';

export class DeduplicationEngine implements IDeduplicationEngine {
  private documents: Map<string, Document> = new Map();
  private groups: Map<string, DuplicateGroup> = new Map();

  addDocument(doc: Document): void {
    this.documents.set(doc.id, doc);
  }

  async detect(documentIds: string[], threshold = 0.9): Promise<DeduplicationResult> {
    const groups: DuplicateGroup[] = [];
    const visited = new Set<string>();
    let groupCounter = 0;

    for (let i = 0; i < documentIds.length; i++) {
      if (visited.has(documentIds[i])) continue;

      const docA = this.documents.get(documentIds[i]);
      if (!docA) continue;

      const groupDocs: string[] = [documentIds[i]];
      let maxSim = 0;

      for (let j = i + 1; j < documentIds.length; j++) {
        if (visited.has(documentIds[j])) continue;

        const docB = this.documents.get(documentIds[j]);
        if (!docB) continue;

        if (docA.hash === docB.hash) {
          groupDocs.push(documentIds[j]);
          visited.add(documentIds[j]);
          maxSim = Math.max(maxSim, 1);
        } else {
          const sim = this.jaccardSimilarity(docA.content, docB.content);
          if (sim >= 0.7) {
            groupDocs.push(documentIds[j]);
            visited.add(documentIds[j]);
            maxSim = Math.max(maxSim, sim);
          }
        }
      }

      if (groupDocs.length > 1) {
        const isExact = groupDocs.every(
          id => this.documents.get(id)?.hash === this.documents.get(groupDocs[0])?.hash,
        );

        let type: 'exact' | 'near-duplicate' | 'semantic';
        if (isExact) {
          type = 'exact';
        } else if (maxSim >= threshold) {
          type = 'near-duplicate';
        } else {
          type = 'semantic';
        }

        const group: DuplicateGroup = {
          groupId: `dup-group-${groupCounter++}`,
          documents: groupDocs,
          similarity: maxSim,
          type,
        };

        groups.push(group);
        this.groups.set(group.groupId, group);
        visited.add(documentIds[i]);
      }
    }

    const duplicatesRemoved = groups.reduce((sum, g) => sum + g.documents.length - 1, 0);

    return {
      duplicates: groups,
      uniqueDocuments: documentIds.length - duplicatesRemoved,
      duplicatesRemoved,
    };
  }

  async removeDuplicates(groupId: string): Promise<string[]> {
    const group = this.findGroupById(groupId);
    if (!group) return [];

    const kept: string[] = [];
    const toRemove = group.documents.slice(1);

    kept.push(group.documents[0]);

    for (const id of toRemove) {
      this.documents.delete(id);
    }

    return kept;
  }

  async getSimilar(documentId: string, threshold = 0.7): Promise<Document[]> {
    const docA = this.documents.get(documentId);
    if (!docA) return [];

    const similar: Document[] = [];

    for (const [id, docB] of this.documents) {
      if (id === documentId) continue;

      if (docA.hash === docB.hash) {
        similar.push(docB);
      } else {
        const sim = this.jaccardSimilarity(docA.content, docB.content);
        if (sim >= threshold) {
          similar.push(docB);
        }
      }
    }

    return similar;
  }

  private jaccardSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
    const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));

    if (wordsA.size === 0 && wordsB.size === 0) return 1;

    let intersection = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) intersection++;
    }

    const union = wordsA.size + wordsB.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  private findGroupById(groupId: string): DuplicateGroup | undefined {
    return this.groups.get(groupId);
  }
}

export { DeduplicationEngine as Deduplication };
