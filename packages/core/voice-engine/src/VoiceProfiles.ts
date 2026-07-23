import { randomUUID } from 'node:crypto';
import type {
  VoiceProfiles as IVoiceProfiles,
  VoiceProfile,
  VoiceProfilePreset,
  VoiceGender,
  Language,
  VoiceEmotion,
  TTSProvider,
} from './interfaces.js';

const PRESETS: Record<VoiceProfilePreset, Omit<VoiceProfile, 'id' | 'createdAt' | 'updatedAt'>> = {
  jarbas: {
    name: 'Jarbas', gender: 'male', language: 'pt', speed: 1.0, pitch: 1.0, volume: 1.0,
    emotion: 'calm', pauses: 0.5, breathing: false, intonation: 'executive',
    style: 'technological', voice: 'pt-BR-Wavenet-A', provider: 'kokoro', isDefault: true, metadata: {},
  },
  'sexta-feira': {
    name: 'Sexta-feira', gender: 'female', language: 'pt', speed: 1.0, pitch: 1.1, volume: 1.0,
    emotion: 'calm', pauses: 0.6, breathing: true, intonation: 'elegant',
    style: 'natural', voice: 'pt-BR-Wavenet-B', provider: 'kokoro', isDefault: false, metadata: {},
  },
  professor: {
    name: 'Professor', gender: 'neutral', language: 'pt', speed: 0.85, pitch: 1.0, volume: 1.0,
    emotion: 'calm', pauses: 1.0, breathing: true, intonation: 'didactic',
    style: 'explanatory', voice: 'pt-BR-Wavenet-C', provider: 'kokoro', isDefault: false, metadata: {},
  },
  narrador: {
    name: 'Narrador', gender: 'neutral', language: 'pt', speed: 0.95, pitch: 1.0, volume: 1.0,
    emotion: 'neutral', pauses: 0.8, breathing: true, intonation: 'expressive',
    style: 'audiobook', voice: 'pt-BR-Wavenet-D', provider: 'kokoro', isDefault: false, metadata: {},
  },
  infantil: {
    name: 'Infantil', gender: 'neutral', language: 'pt', speed: 0.9, pitch: 1.2, volume: 1.0,
    emotion: 'happy', pauses: 0.7, breathing: true, intonation: 'playful',
    style: 'friendly', voice: 'pt-BR-Wavenet-E', provider: 'kokoro', isDefault: false, metadata: {},
  },
  executivo: {
    name: 'Executivo', gender: 'neutral', language: 'pt', speed: 1.1, pitch: 1.0, volume: 1.0,
    emotion: 'calm', pauses: 0.4, breathing: false, intonation: 'formal',
    style: 'objective', voice: 'pt-BR-Wavenet-F', provider: 'kokoro', isDefault: false, metadata: {},
  },
  mentor: {
    name: 'Mentor', gender: 'neutral', language: 'pt', speed: 0.9, pitch: 1.0, volume: 1.0,
    emotion: 'calm', pauses: 0.8, breathing: true, intonation: 'strategic',
    style: 'growth-focused', voice: 'pt-BR-Wavenet-G', provider: 'kokoro', isDefault: false, metadata: {},
  },
  coach: {
    name: 'Coach', gender: 'neutral', language: 'pt', speed: 1.0, pitch: 1.05, volume: 1.0,
    emotion: 'enthusiastic', pauses: 0.6, breathing: true, intonation: 'motivational',
    style: 'personal-development', voice: 'pt-BR-Wavenet-H', provider: 'kokoro', isDefault: false, metadata: {},
  },
  psicologo: {
    name: 'Psicólogo', gender: 'neutral', language: 'pt', speed: 0.85, pitch: 0.95, volume: 0.9,
    emotion: 'calm', pauses: 1.2, breathing: true, intonation: 'empathetic',
    style: 'supportive', voice: 'pt-BR-Wavenet-I', provider: 'kokoro', isDefault: false, metadata: {},
  },
};

export class VoiceProfiles implements IVoiceProfiles {
  private profiles: Map<string, VoiceProfile> = new Map();
  private defaultId: string | null = null;

  async create(profile: Omit<VoiceProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<VoiceProfile> {
    const id = randomUUID();
    const now = new Date();
    const created: VoiceProfile = { ...profile, id, createdAt: now, updatedAt: now };
    this.profiles.set(id, created);
    if (created.isDefault) this.defaultId = id;
    return created;
  }

  async get(profileId: string): Promise<VoiceProfile | null> {
    return this.profiles.get(profileId) ?? null;
  }

  async update(profileId: string, updates: Partial<VoiceProfile>): Promise<VoiceProfile> {
    const existing = this.profiles.get(profileId);
    if (!existing) throw new Error(`Profile not found: ${profileId}`);
    const updated = { ...existing, ...updates, id: profileId, updatedAt: new Date() };
    this.profiles.set(profileId, updated);
    return updated;
  }

  async delete(profileId: string): Promise<void> {
    this.profiles.delete(profileId);
    if (this.defaultId === profileId) this.defaultId = null;
  }

  async list(): Promise<VoiceProfile[]> {
    return Array.from(this.profiles.values());
  }

  async getDefault(): Promise<VoiceProfile | null> {
    if (!this.defaultId) return null;
    return this.profiles.get(this.defaultId) ?? null;
  }

  async setDefault(profileId: string): Promise<void> {
    if (!this.profiles.has(profileId)) throw new Error(`Profile not found: ${profileId}`);
    this.defaultId = profileId;
  }

  getPreset(preset: VoiceProfilePreset): VoiceProfile {
    const p = PRESETS[preset];
    const now = new Date();
    return { ...p, id: `preset-${preset}`, createdAt: now, updatedAt: now };
  }

  getPresets(): VoiceProfilePreset[] {
    return Object.keys(PRESETS) as VoiceProfilePreset[];
  }
}
