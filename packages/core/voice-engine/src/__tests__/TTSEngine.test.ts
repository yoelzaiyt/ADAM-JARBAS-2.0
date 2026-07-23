import { describe, it, expect } from 'vitest';
import { TTSEngine } from '../TTSEngine.js';

describe('TTSEngine', () => {
  const engine = new TTSEngine({ provider: 'kokoro', voice: 'pt-BR-Wavenet-A', language: 'pt' });

  it('should return all 9 providers', () => {
    expect(engine.getProviders()).toHaveLength(9);
    expect(engine.getProviders()).toContain('kokoro');
    expect(engine.getProviders()).toContain('elevenlabs');
    expect(engine.getProviders()).toContain('piper');
    expect(engine.getProviders()).toContain('edge-tts');
  });

  it('should synthesize text', async () => {
    const result = await engine.synthesize('Olá mundo');
    expect(result.text).toBe('Olá mundo');
    expect(result.provider).toBe('kokoro');
    expect(result.audio.durationMs).toBeGreaterThan(0);
    expect(result.audio.sampleRate).toBe(24000);
    expect(result.tokensUsed).toBeGreaterThan(0);
  });

  it('should synthesize with specified provider', async () => {
    const result = await engine.synthesize('Hello', { provider: 'elevenlabs' });
    expect(result.provider).toBe('elevenlabs');
  });

  it('should throw for unknown provider', async () => {
    await expect(engine.synthesize('test', { provider: 'unknown' as any }))
      .rejects.toThrow('Unknown TTS provider');
  });

  it('should get voices for provider', () => {
    const voices = engine.getVoices('kokoro', 'pt');
    expect(voices).toHaveLength(5);
    expect(voices[0].language).toBe('pt');
    expect(voices[0].id).toContain('kokoro');
  });

  it('should get voices with default language', () => {
    const voices = engine.getVoices('piper');
    expect(voices).toHaveLength(5);
    expect(voices[0].language).toBe('en');
  });

  it('should throw for unknown provider voices', () => {
    expect(() => engine.getVoices('unknown' as any))
      .toThrow('Unknown TTS provider');
  });

  it('should stream synthesize in chunks', async () => {
    const chunks: any[] = [];
    for await (const chunk of engine.synthesizeStream('Stream test text')) {
      chunks.push(chunk);
    }
    expect(chunks).toHaveLength(4);
    expect(chunks[0].sequenceNumber).toBe(0);
    expect(chunks[3].sequenceNumber).toBe(3);
    expect(chunks[0].data).toBeInstanceOf(Buffer);
  });
});
