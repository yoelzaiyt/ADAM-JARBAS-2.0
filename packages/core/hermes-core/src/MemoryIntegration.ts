import type {
  MemoryIntegration as IMemoryIntegration,
  MemoryContextRequest,
  MemoryContextResult,
  MemoryContextEntry,
  MemoryStoreRequest,
  Logger,
} from './interfaces.js';
import { generateId } from '@jarbas/utils';

interface StoredMemoryEntry extends MemoryContextEntry {
  id: string;
  type: 'conversation' | 'knowledge' | 'summary';
  tenantId: string;
  sessionId: string;
  userId?: string;
}

export class MemoryIntegration implements IMemoryIntegration {
  private memoryManager: unknown | null;
  private logger: Logger;
  private inMemoryStore: Map<string, StoredMemoryEntry> = new Map();

  constructor(memoryManager?: unknown, logger?: Logger) {
    this.memoryManager = memoryManager ?? null;
    this.logger = logger ?? {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    };
  }

  async getContext(request: MemoryContextRequest): Promise<MemoryContextResult> {
    const startTime = Date.now();

    if (this.memoryManager) {
      this.logger.debug('Delegating getContext to MemoryManager', {
        sessionId: request.sessionId,
      });
      const manager = this.memoryManager as {
        getContext: (req: MemoryContextRequest) => Promise<MemoryContextResult>;
      };
      return manager.getContext(request);
    }

    this.logger.debug('Using simulated in-memory store for getContext', {
      sessionId: request.sessionId,
    });

    const limit = request.limit ?? 10;
    const threshold = request.threshold ?? 0.5;
    const queryLower = request.query.toLowerCase();

    const matched: MemoryContextEntry[] = [];
    for (const entry of this.inMemoryStore.values()) {
      if (entry.tenantId !== request.tenantId) continue;

      const contentLower = entry.content.toLowerCase();
      const score = contentLower.includes(queryLower)
        ? 0.8 + Math.random() * 0.2
        : 0.1 + Math.random() * 0.4;

      if (score >= threshold) {
        matched.push({
          content: entry.content,
          score,
          metadata: { ...entry.metadata, id: entry.id },
          createdAt: entry.createdAt,
        });
      }

      if (matched.length >= limit) break;
    }

    matched.sort((a, b) => b.score - a.score);

    const totalTokens = matched.reduce(
      (sum, entry) => sum + Math.ceil(entry.content.length / 4),
      0
    );

    return {
      entries: matched.slice(0, limit),
      totalTokens,
      queryTimeMs: Date.now() - startTime,
    };
  }

  async store(request: MemoryStoreRequest): Promise<void> {
    if (this.memoryManager) {
      this.logger.debug('Delegating store to MemoryManager', {
        sessionId: request.sessionId,
      });
      const manager = this.memoryManager as {
        store: (req: MemoryStoreRequest) => Promise<void>;
      };
      return manager.store(request);
    }

    this.logger.debug('Using simulated in-memory store for store', {
      sessionId: request.sessionId,
    });

    const id = generateId();
    this.inMemoryStore.set(id, {
      id,
      content: request.content,
      score: 1,
      metadata: {
        ...(request.metadata ?? {}),
        type: request.type,
      },
      createdAt: new Date(),
      type: request.type,
      tenantId: request.tenantId,
      sessionId: request.sessionId,
      userId: request.userId,
    });
  }

  async search(
    query: string,
    tenantId: string,
    limit?: number
  ): Promise<MemoryContextEntry[]> {
    if (this.memoryManager) {
      this.logger.debug('Delegating search to MemoryManager', {
        tenantId,
      });
      const manager = this.memoryManager as {
        search: (
          query: string,
          tenantId: string,
          limit?: number
        ) => Promise<MemoryContextEntry[]>;
      };
      return manager.search(query, tenantId, limit);
    }

    this.logger.debug('Using simulated in-memory store for search', {
      tenantId,
    });

    const maxResults = limit ?? 10;
    const queryLower = query.toLowerCase();
    const results: MemoryContextEntry[] = [];

    for (const entry of this.inMemoryStore.values()) {
      if (entry.tenantId !== tenantId) continue;

      const contentLower = entry.content.toLowerCase();
      const score = contentLower.includes(queryLower)
        ? 0.8 + Math.random() * 0.2
        : 0.1 + Math.random() * 0.4;

      results.push({
        content: entry.content,
        score,
        metadata: { ...entry.metadata, id: entry.id },
        createdAt: entry.createdAt,
      });

      if (results.length >= maxResults) break;
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, maxResults);
  }

  async delete(entryId: string): Promise<void> {
    if (this.memoryManager) {
      this.logger.debug('Delegating delete to MemoryManager', {
        entryId,
      });
      const manager = this.memoryManager as {
        delete: (entryId: string) => Promise<void>;
      };
      return manager.delete(entryId);
    }

    this.logger.debug('Using simulated in-memory store for delete', {
      entryId,
    });

    const deleted = this.inMemoryStore.delete(entryId);
    if (!deleted) {
      this.logger.warn('Entry not found for deletion', { entryId });
    }
  }
}
