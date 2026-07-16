import type { CacheEngine as ICacheEngine, CacheConfig } from './interfaces.js';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
  accessCount: number;
  lastAccess: number;
  createdAt: number;
  accessTick: number;
}

export class CacheEngine implements ICacheEngine {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlMs: number;
  private maxSize: number;
  private strategy: 'lru' | 'lfu' | 'fifo';
  private hits = 0;
  private misses = 0;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private tickCounter = 0;

  constructor(config: CacheConfig = {}) {
    this.ttlMs = config.ttlMs ?? 300_000;
    this.maxSize = config.maxSize ?? 10_000;
    this.strategy = config.strategy ?? 'lru';

    this.cleanupInterval = setInterval(() => this.cleanup(), this.ttlMs);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    entry.accessCount++;
    entry.lastAccess = now;
    entry.accessTick = ++this.tickCounter;
    this.hits++;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const effectiveTtl = ttlMs ?? this.ttlMs;
    const now = Date.now();

    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      entry.value = value;
      entry.expiresAt = now + effectiveTtl;
      entry.lastAccess = now;
      entry.accessTick = ++this.tickCounter;
      entry.accessCount++;
      return;
    }

    if (this.cache.size >= this.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      expiresAt: now + effectiveTtl,
      accessCount: 1,
      lastAccess: now,
      createdAt: now,
      accessTick: ++this.tickCounter,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  getStats(): { hits: number; misses: number; size: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total === 0 ? 0 : this.hits / total,
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let targetKey: string | null = null;

    if (this.strategy === 'lru') {
      let oldestTick = Infinity;
      for (const [key, entry] of this.cache) {
        if (entry.accessTick < oldestTick) {
          oldestTick = entry.accessTick;
          targetKey = key;
        }
      }
    } else if (this.strategy === 'lfu') {
      let lowestCount = Infinity;
      let oldestTime = Infinity;
      for (const [key, entry] of this.cache) {
        if (
          entry.accessCount < lowestCount ||
          (entry.accessCount === lowestCount && entry.createdAt < oldestTime)
        ) {
          lowestCount = entry.accessCount;
          oldestTime = entry.createdAt;
          targetKey = key;
        }
      }
    } else {
      let oldestTime = Infinity;
      for (const [key, entry] of this.cache) {
        if (entry.createdAt < oldestTime) {
          oldestTime = entry.createdAt;
          targetKey = key;
        }
      }
    }

    if (targetKey !== null) {
      this.cache.delete(targetKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export { CacheEngine as Cache };
