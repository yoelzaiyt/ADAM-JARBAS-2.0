import type { MemoryEntry, MemorySearchQuery, MemorySearchResult } from '@jarbas/types';
import { generateId } from '@jarbas/utils';

export interface QdrantConfig {
  url: string;
  apiKey?: string;
  collection: string;
  vectorSize: number;
}

export class MemoryManager {
  private config: QdrantConfig;

  constructor(config: QdrantConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      const collections = await this.qdrantFetch<{ result: { collections: { name: string }[] } }>('GET', '/collections');
      const exists = collections.result.collections.some((c) => c.name === this.config.collection);

      if (!exists) {
        await this.qdrantFetch('PUT', `/collections/${this.config.collection}`, {
          vectors: {
            size: this.config.vectorSize,
            distance: 'Cosine',
          },
          optimizers_config: {
            indexing_threshold: 20000,
          },
        });
        console.log(`[MemoryManager] Created collection: ${this.config.collection}`);
      }
    } catch (error) {
      console.warn('[MemoryManager] Qdrant initialization failed:', (error as Error).message);
    }
  }

  async store(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryEntry> {
    const id = generateId();
    const now = new Date();

    const fullEntry: MemoryEntry = {
      ...entry,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await this.qdrantFetch('PUT', `/collections/${this.config.collection}/points`, {
      points: [
        {
          id,
          vector: entry.embedding ?? [],
          payload: {
            content: entry.content,
            metadata: entry.metadata,
            tenantId: entry.tenantId,
            sessionId: entry.sessionId,
            ttl: entry.ttl,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          },
        },
      ],
    });

    return fullEntry;
  }

  async search(query: MemorySearchQuery): Promise<MemorySearchResult[]> {
    const results = await this.qdrantFetch<{
      result: { id: string; score: number; payload: Record<string, unknown> }[];
    }>('POST', `/collections/${this.config.collection}/points/search`, {
      vector: [],
      query: query.query,
      limit: query.limit,
      score_threshold: query.threshold,
      filter: {
        must: [
          { key: 'tenantId', match: { value: query.tenantId } },
        ],
      },
    });

    return results.result.map((r) => ({
      entry: {
        id: r.id,
        content: r.payload.content as string,
        metadata: r.payload.metadata as Record<string, unknown>,
        tenantId: r.payload.tenantId as string,
        sessionId: r.payload.sessionId as string | undefined,
        createdAt: new Date(r.payload.createdAt as string),
        updatedAt: new Date(r.payload.updatedAt as string),
        ttl: r.payload.ttl as number | undefined,
      },
      score: r.score,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.qdrantFetch('POST', `/collections/${this.config.collection}/points/delete`, {
      points: [id],
    });
  }

  async getConversationHistory(sessionId: string, limit = 50): Promise<MemoryEntry[]> {
    const results = await this.qdrantFetch<{
      result: { id: string; score: number; payload: Record<string, unknown> }[];
    }>('POST', `/collections/${this.config.collection}/points/scroll`, {
      filter: {
        must: [{ key: 'sessionId', match: { value: sessionId } }],
      },
      limit,
      with_payload: true,
    });

    return results.result.map((r) => ({
      id: r.id,
      content: r.payload.content as string,
      metadata: r.payload.metadata as Record<string, unknown>,
      tenantId: r.payload.tenantId as string,
      sessionId: r.payload.sessionId as string | undefined,
      createdAt: new Date(r.payload.createdAt as string),
      updatedAt: new Date(r.payload.updatedAt as string),
      ttl: r.payload.ttl as number | undefined,
    }));
  }

  private async qdrantFetch<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    const url = `${this.config.url}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['api-key'] = this.config.apiKey;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Qdrant error ${response.status}: ${errorBody}`);
    }

    return response.json() as Promise<T>;
  }
}
