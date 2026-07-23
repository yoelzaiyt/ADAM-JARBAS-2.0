import { describe, it, expect } from 'vitest';
import { NoiseReduction } from '../NoiseReduction.js';
import type { AudioBuffer } from '../interfaces.js';

const mockAudio: AudioBuffer = {
  data: Buffer.alloc(1024),
  sampleRate: 16000,
  channels: 1,
  format: 'wav',
  durationMs: 10000,
};

describe('NoiseReduction', () => {
  const nr = new NoiseReduction();

  it('should process audio with config enabled', async () => {
    const result = await nr.process(mockAudio, { enabled: true, aggressiveness: 5 } as any);
    expect(result.noiseLevel).toBe(0.05);
    expect(result.suppressedDb).toBe(-30);
    expect(result.signalToNoiseRatio).toBeGreaterThan(0);
  });

  it('should process audio without config', async () => {
    const result = await nr.process(mockAudio);
    expect(result.noiseLevel).toBeGreaterThanOrEqual(0.1);
  });

  it('should get noise level', () => {
    const level = nr.getNoiseLevel(mockAudio);
    expect(level).toBeGreaterThanOrEqual(0.1);
    expect(level).toBeLessThanOrEqual(0.5);
  });

  it('should detect silence segments', () => {
    const segments = nr.detectSilence(mockAudio);
    expect(segments.length).toBeGreaterThanOrEqual(1);
    expect(segments[0].start).toBe(0);
  });

  it('should detect silence with custom threshold', () => {
    const segments = nr.detectSilence(mockAudio, 0.1);
    expect(segments.length).toBeGreaterThanOrEqual(0);
  });

  it('should apply gain', () => {
    const result = nr.applyGain(mockAudio, 1.5);
    expect(result.durationMs).toBe(10000);
  });
});
