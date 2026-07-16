import { describe, it, expect, afterEach } from 'vitest';
import { CacheEngine } from '../CacheEngine.js';

describe('CacheEngine', () => {
  let cache: CacheEngine;

  afterEach(() => {
    cache?.destroy();
  });

  it('should create with default config', () => {
    cache = new CacheEngine();
    const stats = cache.getStats();
    expect(stats.size).toBe(0);
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
    expect(stats.hitRate).toBe(0);
  });

  it('should set and get values', async () => {
    cache = new CacheEngine();
    await cache.set('key1', 'value1');
    const result = await cache.get<string>('key1');
    expect(result).toBe('value1');
  });

  it('should return null for expired keys', async () => {
    cache = new CacheEngine({ ttlMs: 1 });
    await cache.set('key1', 'value1');
    await new Promise(r => setTimeout(r, 10));
    const result = await cache.get<string>('key1');
    expect(result).toBeNull();
  });

  it('should delete entries', async () => {
    cache = new CacheEngine();
    await cache.set('key1', 'value1');
    await cache.delete('key1');
    const result = await cache.get<string>('key1');
    expect(result).toBeNull();
  });

  it('should clear all entries', async () => {
    cache = new CacheEngine();
    await cache.set('a', 1);
    await cache.set('b', 2);
    await cache.clear();
    expect(await cache.get('a')).toBeNull();
    expect(await cache.get('b')).toBeNull();
  });

  it('should check existence with has', async () => {
    cache = new CacheEngine();
    await cache.set('key1', 'value1');
    expect(await cache.has('key1')).toBe(true);
    expect(await cache.has('missing')).toBe(false);
  });

  it('should return false for expired key in has', async () => {
    cache = new CacheEngine({ ttlMs: 1 });
    await cache.set('key1', 'value1');
    await new Promise(r => setTimeout(r, 10));
    expect(await cache.has('key1')).toBe(false);
  });

  it('should track hits and misses', async () => {
    cache = new CacheEngine();
    await cache.set('key1', 'value1');
    await cache.get('key1');
    await cache.get('missing');
    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBe(0.5);
  });

  it('should perform LRU eviction', async () => {
    cache = new CacheEngine({ maxSize: 3, strategy: 'lru' });
    await cache.set('a', 1);
    await cache.set('b', 2);
    await cache.set('c', 3);
    await cache.get('a');
    await cache.get('b');
    await cache.set('d', 4);
    expect(await cache.get('c')).toBeNull();
    expect(await cache.get('a')).toBe(1);
  });

  it('should perform LFU eviction', async () => {
    cache = new CacheEngine({ maxSize: 3, strategy: 'lfu' });
    await cache.set('a', 1);
    await cache.set('b', 2);
    await cache.set('c', 3);
    await cache.get('a');
    await cache.get('a');
    await cache.get('b');
    await cache.set('d', 4);
    expect(await cache.get('c')).toBeNull();
    expect(await cache.get('a')).toBe(1);
  });

  it('should perform FIFO eviction', async () => {
    cache = new CacheEngine({ maxSize: 3, strategy: 'fifo' });
    await cache.set('a', 1);
    await cache.set('b', 2);
    await cache.set('c', 3);
    await cache.set('d', 4);
    expect(await cache.get('a')).toBeNull();
    expect(await cache.get('b')).toBe(2);
  });
});
