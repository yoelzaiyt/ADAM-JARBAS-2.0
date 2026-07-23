import { describe, it, expect, beforeEach } from 'vitest';
import { AudioCacheEngine } from '../AudioCacheEngine.js';
import type { AudioBuffer, TTSConfig } from '../interfaces.js';

const mockAudio: AudioBuffer = {
  data: Buffer.alloc(1024),
  sampleRate: 16000,
  channels: 1,
  format: 'wav',
  durationMs: 1000,
};

const mockConfig: TTSConfig = {
  provider: 'kokoro',
  voice: 'pt-BR-A',
  language: 'pt',
};

describe('AudioCacheEngine', () => {
  let cache: AudioCacheEngine;
  beforeEach(() => { cache = new AudioCacheEngine(); });

  it('should return null for cache miss', async () => {
    const result = await cache.get('hello', 'voice', 'en');
    expect(result).toBeNull();
  });

  it('should set and get cache entry', async () => {
    const entry = await cache.set('hello', 'voice', 'en', mockAudio, mockConfig);
    expect(entry.id).toBeDefined();
    expect(entry.text).toBe('hello');
    expect(entry.sizeBytes).toBe(1024);
    expect(entry.accessCount).toBe(1);

    const hit = await cache.get('hello', 'voice', 'en');
    expect(hit).not.toBeNull();
    expect(hit?.accessCount).toBe(2);
  });

  it('should track hit rate', async () => {
    await cache.set('cached-text', 'v', 'en', mockAudio, mockConfig);
    await cache.get('miss', 'v', 'en');
    await cache.get('cached-text', 'v', 'en');
    const stats = cache.getStats();
    expect(stats.hitRate).toBeGreaterThan(0);
    expect(stats.entries).toBeGreaterThanOrEqual(1);
  });

  it('should delete entry', async () => {
    const entry = await cache.set('to-delete', 'v', 'en', mockAudio, mockConfig);
    await cache.delete(entry.id);
    const result = await cache.get('to-delete', 'v', 'en');
    expect(result).toBeNull();
  });

  it('should clear all entries', async () => {
    await cache.set('c1', 'v', 'en', mockAudio, mockConfig);
    await cache.set('c2', 'v', 'en', mockAudio, mockConfig);
    await cache.clear();
    const stats = cache.getStats();
    expect(stats.entries).toBe(0);
    expect(stats.hitRate).toBe(0);
  });

  it('should prune with no old entries', async () => {
    await cache.set('fresh-entry', 'v', 'en', mockAudio, mockConfig);
    const removed = await cache.prune(60 * 60 * 1000);
    expect(removed).toBe(0);
  });

  it('should get stats after operations', async () => {
    const stats = cache.getStats();
    expect(typeof stats.hitRate).toBe('number');
    expect(typeof stats.totalSizeBytes).toBe('number');
  });
});
