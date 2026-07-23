import { randomUUID } from 'node:crypto';
import type { AudioCache as IAudioCache, AudioCacheEntry, TTSConfig, AudioBuffer, Language, AudioCacheStats } from './interfaces.js';

export class AudioCacheEngine implements IAudioCache {
  private cache = new Map<string, AudioCacheEntry>();
  private hits = 0;
  private misses = 0;

  constructor() {}

  private compositeKey(text: string, voice: string, language: Language): string {
    return `${text}::${voice}::${language}`;
  }

  async get(text: string, voice: string, language: Language): Promise<AudioCacheEntry | null> {
    const key = this.compositeKey(text, voice, language);
    const entry = this.cache.get(key);
    if (entry) {
      this.hits++;
      entry.lastAccessed = new Date();
      entry.accessCount++;
      return { ...entry };
    }
    this.misses++;
    return null;
  }

  async set(text: string, voice: string, language: Language, audio: AudioBuffer, config: TTSConfig): Promise<AudioCacheEntry> {
    const key = this.compositeKey(text, voice, language);
    const entry: AudioCacheEntry = {
      id: randomUUID(),
      text,
      voice,
      language,
      audio,
      config,
      sizeBytes: audio.data instanceof Buffer ? audio.data.length : audio.data.byteLength,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
    };
    this.cache.set(key, entry);
    return { ...entry };
  }

  async delete(id: string): Promise<void> {
    for (const [key, entry] of this.cache) {
      if (entry.id === id) {
        this.cache.delete(key);
        return;
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats(): AudioCacheStats {
    const entries = this.cache.size;
    let totalSizeBytes = 0;
    for (const entry of this.cache.values()) {
      totalSizeBytes += entry.sizeBytes;
    }
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;
    return { entries, totalSizeBytes, hitRate };
  }

  async prune(maxAge?: number): Promise<number> {
    const age = maxAge ?? 60 * 60 * 1000;
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.cache) {
      if (now - entry.lastAccessed.getTime() > age) {
        this.cache.delete(key);
        removed++;
      }
    }
    return removed;
  }
}
