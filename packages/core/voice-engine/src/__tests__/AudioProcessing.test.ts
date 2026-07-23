import { describe, it, expect } from 'vitest';
import { AudioProcessing } from '../AudioProcessing.js';
import type { AudioBuffer } from '../interfaces.js';

const mockAudio: AudioBuffer = {
  data: Buffer.alloc(1024),
  sampleRate: 16000,
  channels: 1,
  format: 'wav',
  durationMs: 3000,
};

describe('AudioProcessing', () => {
  const processor = new AudioProcessing();

  it('should process audio without config', async () => {
    const result = await processor.process(mockAudio);
    expect(result.originalDurationMs).toBe(3000);
    expect(result.trimmedMs).toBe(0);
    expect(result.normalized).toBe(false);
  });

  it('should process with normalize', async () => {
    const result = await processor.process(mockAudio, { normalize: true } as any);
    expect(result.normalized).toBe(true);
  });

  it('should process with trimSilence', async () => {
    const result = await processor.process(mockAudio, { trimSilence: true, silenceThreshold: 0.05 } as any);
    expect(result.trimmedMs).toBeGreaterThan(0);
  });

  it('should normalize audio', () => {
    const result = processor.normalize(mockAudio);
    expect(result.durationMs).toBe(3000);
  });

  it('should trim silence', () => {
    const result = processor.trimSilence(mockAudio, 0.02);
    expect(result.durationMs).toBeLessThan(3000);
  });

  it('should convert format', () => {
    const result = processor.convertFormat(mockAudio, 'mp3');
    expect(result.format).toBe('mp3');
  });

  it('should get duration', () => {
    expect(processor.getDuration(mockAudio)).toBe(3000);
  });

  it('should mix audios', () => {
    const a1: AudioBuffer = { ...mockAudio, durationMs: 2000 };
    const a2: AudioBuffer = { ...mockAudio, durationMs: 4000 };
    const mixed = processor.mix([a1, a2]);
    expect(mixed.durationMs).toBe(4000);
  });

  it('should return empty for empty mix', () => {
    const mixed = processor.mix([]);
    expect(mixed.durationMs).toBe(0);
  });
});
