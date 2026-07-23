import { describe, it, expect } from 'vitest';
import { VoiceMemory } from '../VoiceMemory.js';

describe('VoiceMemory', () => {
  const memory = new VoiceMemory();

  it('should return null for unknown user', async () => {
    expect(await memory.get('unknown')).toBeNull();
  });

  it('should save and retrieve entry', async () => {
    const entry = await memory.save({
      userId: 'user-1',
      preferredLanguage: 'pt',
      preferredSpeed: 1.0,
      preferredVoice: 'pt-BR-Wavenet-A',
      activePersonality: 'jarbas',
      history: [],
      preferences: {},
    });
    expect(entry.id).toBeDefined();
    expect(entry.userId).toBe('user-1');

    const found = await memory.get('user-1');
    expect(found?.userId).toBe('user-1');
  });

  it('should update entry', async () => {
    await memory.save({
      userId: 'user-2', preferredLanguage: 'en', preferredSpeed: 1.0,
      preferredVoice: 'en-US-A', activePersonality: 'default', history: [], preferences: {},
    });
    const updated = await memory.update('user-2', { preferredLanguage: 'es' });
    expect(updated.preferredLanguage).toBe('es');
  });

  it('should throw update for unknown user', async () => {
    await expect(memory.update('fake', { preferredLanguage: 'pt' }))
      .rejects.toThrow('Memory entry not found');
  });

  it('should add interaction', async () => {
    await memory.save({
      userId: 'user-3', preferredLanguage: 'pt', preferredSpeed: 1.0,
      preferredVoice: 'voice', activePersonality: 'default', history: [], preferences: {},
    });
    const interaction = await memory.addInteraction('user-3', {
      type: 'speech', input: 'Olá', output: 'Oi!', durationMs: 1000,
      language: 'pt', success: true,
    });
    expect(interaction.id).toBeDefined();
    expect(interaction.input).toBe('Olá');
  });

  it('should get history with limit', async () => {
    const hist = await memory.getHistory('user-3', 10);
    expect(hist.length).toBeGreaterThanOrEqual(1);
  });

  it('should throw history for unknown user', async () => {
    await expect(memory.getHistory('fake'))
      .rejects.toThrow('Memory entry not found');
  });

  it('should delete entry', async () => {
    await memory.save({
      userId: 'user-del', preferredLanguage: 'pt', preferredSpeed: 1.0,
      preferredVoice: 'v', activePersonality: 'p', history: [], preferences: {},
    });
    await memory.delete('user-del');
    expect(await memory.get('user-del')).toBeNull();
  });

  it('should throw delete for unknown user', async () => {
    await expect(memory.delete('fake'))
      .rejects.toThrow('Memory entry not found');
  });
});
