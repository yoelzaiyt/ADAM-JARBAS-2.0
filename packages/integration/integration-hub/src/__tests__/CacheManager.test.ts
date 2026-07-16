import { describe, it, expect, beforeEach } from 'vitest';
import { CacheManager } from '../core/CacheManager.js';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager({
      strategy: 'memory',
      maxSize: 100,
      defaultTtl: 60,
      evictionPolicy: 'lru',
    });
  });

  it('should set and get values', () => {
    cache.set('key1', { value: 'test' });
    const result = cache.get('key1');
    expect(result).toEqual({ value: 'test' });
  });

  it('should return undefined for missing keys', () => {
    const result = cache.get('nonexistent');
    expect(result).toBeUndefined();
  });

  it('should check if key exists', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('should delete entries', () => {
    cache.set('key1', 'value1');
    const deleted = cache.delete('key1');
    expect(deleted).toBe(true);
    expect(cache.has('key1')).toBe(false);
  });

  it('should clear all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    expect(cache.has('key1')).toBe(false);
    expect(cache.has('key2')).toBe(false);
  });

  it('should respect TTL', () => {
    cache.set('key1', 'value1', 0);
    const result = cache.get('key1');
    expect(result).toBeUndefined();
  });

  it('should return stats', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    const stats = cache.getStats();
    expect(stats.size).toBe(2);
    expect(stats.maxSize).toBe(100);
  });

  it('should evict when full', () => {
    const smallCache = new CacheManager({
      strategy: 'memory',
      maxSize: 2,
      defaultTtl: 60,
      evictionPolicy: 'fifo',
    });

    smallCache.set('key1', 'value1');
    smallCache.set('key2', 'value2');
    smallCache.set('key3', 'value3');

    expect(smallCache.getStats().size).toBe(2);
  });

  it('should support pattern matching', () => {
    cache.set('user:1', { id: 1 });
    cache.set('user:2', { id: 2 });
    cache.set('api:1', { id: 1 });

    const results = cache.getPattern('user:*');
    expect(results.length).toBe(2);
  });

  it('should track hit count', () => {
    cache.set('key1', 'value1');
    cache.get('key1');
    cache.get('key1');
    cache.get('key1');

    const stats = cache.getStats();
    expect(stats.totalHits).toBe(3);
  });
});
