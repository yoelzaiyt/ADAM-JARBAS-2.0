import { describe, it, expect } from 'vitest';
import { STTEngine } from '../STTEngine.js';
import type { AudioBuffer, AudioChunk } from '../interfaces.js';

const mockAudio: AudioBuffer = {
  data: Buffer.alloc(1024),
  sampleRate: 16000,
  channels: 1,
  format: 'wav',
  durationMs: 2000,
};

const mockChunk: AudioChunk = {
  id: 'chunk-1',
  data: Buffer.alloc(512),
  timestamp: new Date(),
  durationMs: 1000,
  sequenceNumber: 0,
};

describe('STTEngine', () => {
  const engine = new STTEngine({ provider: 'whisper', language: 'pt' });

  it('should return all 9 providers', () => {
    expect(engine.getProviders()).toHaveLength(9);
    expect(engine.getProviders()).toContain('whisper');
    expect(engine.getProviders()).toContain('faster-whisper');
    expect(engine.getProviders()).toContain('deepgram');
    expect(engine.getProviders()).toContain('vosk');
  });

  it('should transcribe with default provider', async () => {
    const result = await engine.transcribe(mockAudio);
    expect(result.text).toContain('whisper');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.language).toBe('pt');
    expect(result.durationMs).toBe(2000);
    expect(result.words.length).toBeGreaterThan(0);
  });

  it('should transcribe with specified provider', async () => {
    const result = await engine.transcribe(mockAudio, { provider: 'deepgram', language: 'en' });
    expect(result.text).toContain('deepgram');
    expect(result.language).toBe('en');
    expect(result.provider).toBe('deepgram');
  });

  it('should throw for unknown provider', async () => {
    await expect(engine.transcribe(mockAudio, { provider: 'unknown' as any }))
      .rejects.toThrow('Unknown STT provider');
  });

  it('should get supported languages for provider', () => {
    const langs = engine.getSupportedLanguages('whisper');
    expect(langs).toContain('pt');
    expect(langs).toContain('en');
    expect(langs).toContain('ja');
    expect(langs).toHaveLength(7);
  });

  it('should throw for unknown provider languages', () => {
    expect(() => engine.getSupportedLanguages('unknown' as any))
      .toThrow('Unknown STT provider');
  });

  it('should stream transcribe in chunks', async () => {
    const chunks: any[] = [];
    for await (const chunk of engine.transcribeStream(mockChunk)) {
      chunks.push(chunk);
    }
    expect(chunks).toHaveLength(3);
    expect(chunks[0].text).toContain('Partial');
    expect(chunks[2].text).toContain('whisper');
    expect(chunks[2].words).toBeDefined();
  });
});
