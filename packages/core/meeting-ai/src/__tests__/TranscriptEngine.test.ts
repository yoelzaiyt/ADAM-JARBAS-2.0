import { describe, it, expect, beforeEach } from 'vitest';
import { TranscriptEngine } from '../TranscriptEngine.js';
import type { TranscriptionSegment } from '../interfaces.js';

const segments: TranscriptionSegment[] = [
  { id: 's1', speakerId: 'sp1', text: 'Olá pessoal', startMs: 0, endMs: 1000, confidence: 0.9, words: [] },
  { id: 's2', speakerId: 'sp2', text: 'Vamos começar', startMs: 1000, endMs: 2000, confidence: 0.85, words: [] },
  { id: 's3', speakerId: 'sp1', text: 'Decidimos usar whisper', startMs: 2000, endMs: 3000, confidence: 0.95, words: [] },
];

describe('TranscriptEngine', () => {
  let engine: TranscriptEngine;
  beforeEach(() => { engine = new TranscriptEngine(); });

  it('should generate full transcript', async () => {
    const t = await engine.generateFull('m1', segments);
    expect(t.version).toBe('completa');
    expect(t.segments).toHaveLength(3);
    expect(t.text).toContain('Olá');
  });

  it('should generate clean transcript', async () => {
    const t = await engine.generateClean('m1', segments);
    expect(t.version).toBe('limpa');
  });

  it('should generate summary transcript', async () => {
    const t = await engine.generateSummary('m1', segments);
    expect(t.version).toBe('resumida');
    expect(t.segments.length).toBeLessThanOrEqual(segments.length);
  });

  it('should get transcript by id', async () => {
    const t = await engine.generateFull('m1', segments);
    expect(engine.getTranscript(t.id)).not.toBeNull();
  });

  it('should get transcripts by meeting', async () => {
    await engine.generateFull('m1', segments);
    await engine.generateClean('m1', segments);
    expect(engine.getTranscriptsByMeeting('m1')).toHaveLength(2);
  });
});
