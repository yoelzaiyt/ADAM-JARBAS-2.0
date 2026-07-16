import type { CacheEntry, CacheConfig } from '../interfaces.js';
import { createLogger } from '../Logger.js';

const log = createLogger({ module: 'CacheManager' });

export class CacheManager {
  private entries: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  set(key: string, value: unknown, ttl?: number): void {
    const effectiveTtl = ttl || this.config.defaultTtl;
    const now = new Date();

    if (this.entries.size >= this.config.maxSize) {
      this.evict();
    }

    const entry: CacheEntry = {
      key,
      value,
      ttl: effectiveTtl,
      createdAt: now,
      expiresAt: new Date(now.getTime() + effectiveTtl * 1000),
      hits: 0,
    };

    this.entries.set(key, entry);
    log.debug(`Cache set: ${key}`, { ttl: effectiveTtl });
  }

  get<T = unknown>(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    if (Date.now() >= entry.expiresAt.getTime()) {
      this.entries.delete(key);
      log.debug(`Cache expired: ${key}`);
      return undefined;
    }

    entry.hits++;
    return entry.value as T;
  }

  has(key: string): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;

    if (Date.now() >= entry.expiresAt.getTime()) {
      this.entries.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
    log.info('Cache cleared');
  }

  private evict(): void {
    const entries = Array.from(this.entries.values());

    switch (this.config.evictionPolicy) {
      case 'lru': {
        const sorted = entries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        if (sorted.length > 0) {
          this.entries.delete(sorted[0].key);
        }
        break;
      }
      case 'lfu': {
        const sorted = entries.sort((a, b) => a.hits - b.hits);
        if (sorted.length > 0) {
          this.entries.delete(sorted[0].key);
        }
        break;
      }
      case 'ttl': {
        const sorted = entries.sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());
        if (sorted.length > 0) {
          this.entries.delete(sorted[0].key);
        }
        break;
      }
      case 'fifo':
      default: {
        const first = entries[0];
        if (first) {
          this.entries.delete(first.key);
        }
        break;
      }
    }

    log.debug('Cache entry evicted', { policy: this.config.evictionPolicy });
  }

  getPattern(pattern: string): Array<{ key: string; value: unknown }> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const results: Array<{ key: string; value: unknown }> = [];

    for (const [key, entry] of this.entries) {
      if (Date.now() < entry.expiresAt.getTime() && regex.test(key)) {
        results.push({ key, value: entry.value });
      }
    }

    return results;
  }

  getStats(): {
    size: number;
    maxSize: number;
    totalHits: number;
    avgHits: number;
    expiringSoon: number;
  } {
    const entries = Array.from(this.entries.values());
    const now = Date.now();
    const soonThreshold = now + 60 * 1000;

    return {
      size: this.entries.size,
      maxSize: this.config.maxSize,
      totalHits: entries.reduce((sum, e) => sum + e.hits, 0),
      avgHits: entries.length > 0 ? entries.reduce((sum, e) => sum + e.hits, 0) / entries.length : 0,
      expiringSoon: entries.filter(e => e.expiresAt.getTime() < soonThreshold).length,
    };
  }
}
