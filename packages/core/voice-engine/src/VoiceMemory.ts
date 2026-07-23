import { randomUUID } from 'node:crypto';
import type {
  VoiceMemory as IVoiceMemory,
  VoiceMemoryEntry,
  VoiceInteraction,
  Language,
} from './interfaces.js';

export class VoiceMemory implements IVoiceMemory {
  private readonly entries: Map<string, VoiceMemoryEntry> = new Map();

  async get(userId: string): Promise<VoiceMemoryEntry | null> {
    return this.entries.get(userId) ?? null;
  }

  async save(
    entry: Omit<VoiceMemoryEntry, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<VoiceMemoryEntry> {
    const now = new Date();
    const full: VoiceMemoryEntry = {
      ...entry,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.entries.set(full.userId, full);
    return full;
  }

  async update(
    userId: string,
    updates: Partial<VoiceMemoryEntry>,
  ): Promise<VoiceMemoryEntry> {
    const existing = this.entries.get(userId);
    if (!existing) {
      throw new Error(`Memory entry not found for user: ${userId}`);
    }
    const updated: VoiceMemoryEntry = {
      ...existing,
      ...updates,
      userId,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };
    this.entries.set(userId, updated);
    return updated;
  }

  async addInteraction(
    userId: string,
    interaction: Omit<VoiceInteraction, 'id' | 'timestamp'>,
  ): Promise<VoiceInteraction> {
    const entry = this.entries.get(userId);
    if (!entry) {
      throw new Error(`Memory entry not found for user: ${userId}`);
    }
    const fullInteraction: VoiceInteraction = {
      ...interaction,
      id: randomUUID(),
      timestamp: new Date(),
    };
    entry.history.push(fullInteraction);
    entry.updatedAt = new Date();
    return fullInteraction;
  }

  async getHistory(
    userId: string,
    limit: number = 50,
  ): Promise<VoiceInteraction[]> {
    const entry = this.entries.get(userId);
    if (!entry) {
      throw new Error(`Memory entry not found for user: ${userId}`);
    }
    return entry.history.slice(-limit);
  }

  async delete(userId: string): Promise<void> {
    if (!this.entries.has(userId)) {
      throw new Error(`Memory entry not found for user: ${userId}`);
    }
    this.entries.delete(userId);
  }
}
