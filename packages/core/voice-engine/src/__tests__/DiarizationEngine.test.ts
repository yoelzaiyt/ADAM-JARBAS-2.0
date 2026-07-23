import { describe, it, expect } from 'vitest';
import { DiarizationEngine } from '../DiarizationEngine.js';
import type { AudioBuffer, SpeakerSegment } from '../interfaces.js';

const mockAudio: AudioBuffer = {
  data: Buffer.alloc(1024),
  sampleRate: 16000,
  channels: 1,
  format: 'wav',
  durationMs: 30000,
};

describe('DiarizationEngine', () => {
  const engine = new DiarizationEngine();

  it('should diarize with specified speakers', async () => {
    const result = await engine.diarize(mockAudio, 3);
    expect(result.speakerCount).toBe(3);
    expect(result.segments.length).toBe(6);
    expect(result.speakers).toHaveLength(3);
    expect(result.durationMs).toBe(30000);
  });

  it('should diarize without specifying speakers', async () => {
    const result = await engine.diarize(mockAudio);
    expect(result.speakerCount).toBeGreaterThanOrEqual(2);
    expect(result.segments.length).toBeGreaterThan(0);
  });

  it('should identify speaker', async () => {
    const profiles = [{ id: 'sp-1', totalSpeakingMs: 5000, segmentCount: 2, averageConfidence: 0.9 }];
    const result = await engine.identifySpeaker(mockAudio, profiles);
    expect(result?.id).toBe('sp-1');
  });

  it('should return null for empty profiles', async () => {
    const result = await engine.identifySpeaker(mockAudio, []);
    expect(result).toBeNull();
  });

  it('should merge adjacent segments', () => {
    const segments: SpeakerSegment[] = [
      { speakerId: 'A', startMs: 0, endMs: 1000, confidence: 0.9 },
      { speakerId: 'A', startMs: 900, endMs: 2000, confidence: 0.85 },
      { speakerId: 'B', startMs: 2000, endMs: 3000, confidence: 0.88 },
    ];
    const merged = engine.mergeSegments(segments);
    expect(merged).toHaveLength(2);
    expect(merged[0].endMs).toBe(2000);
  });

  it('should merge non-overlapping segments', () => {
    const segments: SpeakerSegment[] = [
      { speakerId: 'A', startMs: 0, endMs: 1000, confidence: 0.9 },
      { speakerId: 'B', startMs: 1000, endMs: 2000, confidence: 0.85 },
    ];
    const merged = engine.mergeSegments(segments);
    expect(merged).toHaveLength(2);
  });

  it('should handle empty segments', () => {
    expect(engine.mergeSegments([])).toHaveLength(0);
  });
});
