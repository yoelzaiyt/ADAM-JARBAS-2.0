import { describe, it, expect } from 'vitest';
import { VoiceProfiles } from '../VoiceProfiles.js';

describe('VoiceProfiles', () => {
  const profiles = new VoiceProfiles();

  it('should create a profile', async () => {
    const profile = await profiles.create({
      name: 'Teste',
      gender: 'male',
      language: 'pt',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      emotion: 'neutral',
      pauses: 0.5,
      breathing: false,
      intonation: 'formal',
      style: 'test',
      voice: 'pt-BR-Wavenet-A',
      provider: 'kokoro',
      isDefault: false,
      metadata: {},
    });
    expect(profile.id).toBeDefined();
    expect(profile.name).toBe('Teste');
    expect(profile.createdAt).toBeInstanceOf(Date);
  });

  it('should get profile by id', async () => {
    const created = await profiles.create({
      name: 'GetTest', gender: 'female', language: 'en', speed: 1.0, pitch: 1.0,
      volume: 1.0, emotion: 'happy', pauses: 0.5, breathing: true, intonation: 'playful',
      style: 'test', voice: 'en-US-Standard-A', provider: 'kokoro', isDefault: false, metadata: {},
    });
    const found = await profiles.get(created.id);
    expect(found?.name).toBe('GetTest');
  });

  it('should update profile', async () => {
    const created = await profiles.create({
      name: 'UpdateMe', gender: 'neutral', language: 'pt', speed: 1.0, pitch: 1.0,
      volume: 1.0, emotion: 'neutral', pauses: 0.5, breathing: false, intonation: 'formal',
      style: 'test', voice: 'pt-BR-Wavenet-A', provider: 'kokoro', isDefault: false, metadata: {},
    });
    const updated = await profiles.update(created.id, { name: 'Updated' });
    expect(updated.name).toBe('Updated');
  });

  it('should throw update for unknown id', async () => {
    await expect(profiles.update('fake', { name: 'x' }))
      .rejects.toThrow('Profile not found');
  });

  it('should list profiles', async () => {
    const list = await profiles.list();
    expect(list.length).toBeGreaterThan(0);
  });

  it('should get and set default', async () => {
    const created = await profiles.create({
      name: 'Default', gender: 'neutral', language: 'pt', speed: 1.0, pitch: 1.0,
      volume: 1.0, emotion: 'neutral', pauses: 0.5, breathing: false, intonation: 'formal',
      style: 'test', voice: 'pt-BR-Wavenet-A', provider: 'kokoro', isDefault: true, metadata: {},
    });
    const def = await profiles.getDefault();
    expect(def?.id).toBe(created.id);
  });

  it('should get all presets', () => {
    const presets = profiles.getPresets();
    expect(presets).toContain('jarbas');
    expect(presets).toContain('sexta-feira');
    expect(presets).toContain('professor');
    expect(presets).toContain('mentor');
    expect(presets).toContain('coach');
    expect(presets).toContain('psicologo');
    expect(presets.length).toBeGreaterThanOrEqual(6);
  });

  it('should get preset by name', () => {
    const preset = profiles.getPreset('jarbas');
    expect(preset.name).toBe('Jarbas');
    expect(preset.language).toBe('pt');
    expect(preset.id).toContain('preset-jarbas');
  });

  it('should delete profile', async () => {
    const created = await profiles.create({
      name: 'DeleteMe', gender: 'neutral', language: 'pt', speed: 1.0, pitch: 1.0,
      volume: 1.0, emotion: 'neutral', pauses: 0.5, breathing: false, intonation: 'formal',
      style: 'test', voice: 'pt-BR-Wavenet-A', provider: 'kokoro', isDefault: false, metadata: {},
    });
    await profiles.delete(created.id);
    expect(await profiles.get(created.id)).toBeNull();
  });
});
