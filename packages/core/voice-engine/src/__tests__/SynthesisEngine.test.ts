import { describe, it, expect } from 'vitest';
import { SynthesisEngine } from '../SynthesisEngine.js';
import type { AudioBuffer } from '../interfaces.js';

const mockAudio: AudioBuffer = {
  data: Buffer.alloc(1024),
  sampleRate: 16000,
  channels: 1,
  format: 'wav',
  durationMs: 5000,
};

describe('SynthesisEngine', () => {
  const engine = new SynthesisEngine();

  it('should synthesize text', async () => {
    const result = await engine.synthesize('Olá mundo', { voice: 'pt-BR-A', speed: 1.0, pitch: 1.0, emotion: 'neutral', emphasis: [], pauses: [] });
    expect(result.text).toBe('Olá mundo');
    expect(result.durationMs).toBeGreaterThan(0);
    expect(result.prosody).toBeDefined();
  });

  it('should adjust prosody speed', () => {
    const result = engine.adjustProsody(mockAudio, { speed: 2.0 });
    expect(result.durationMs).toBe(2500);
  });

  it('should adjust prosody default speed', () => {
    const result = engine.adjustProsody(mockAudio, {});
    expect(result.durationMs).toBe(5000);
  });

  it('should add breathing', () => {
    const result = engine.addBreathing(mockAudio, 2);
    expect(result.durationMs).toBeGreaterThan(5000);
  });

  it('should add pause within audio', () => {
    const result = engine.addPause(mockAudio, 2000, 500);
    expect(result.durationMs).toBe(5500);
  });

  it('should add pause beyond audio', () => {
    const result = engine.addPause(mockAudio, 10000, 500);
    expect(result.durationMs).toBe(10500);
  });
});
