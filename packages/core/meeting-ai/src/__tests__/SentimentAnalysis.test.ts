import { describe, it, expect, beforeEach } from 'vitest';
import { SentimentAnalysis } from '../SentimentAnalysis.js';
import type { TranscriptionSegment } from '../interfaces.js';

const segments: TranscriptionSegment[] = [
  { id: 's1', speakerId: 'sp1', text: 'Isso é incrível! Estou entusiasmado!', startMs: 0, endMs: 1000, confidence: 0.9, words: [] },
  { id: 's2', speakerId: 'sp2', text: 'Eu discordo completamente', startMs: 1000, endMs: 2000, confidence: 0.85, words: [] },
];

describe('SentimentAnalysis', () => {
  let analysis: SentimentAnalysis;
  beforeEach(() => { analysis = new SentimentAnalysis(); });

  it('should analyze segments', async () => {
    const result = await analysis.analyze(segments);
    expect(result.results).toHaveLength(2);
    expect(result.overall).toBeDefined();
    expect(result.climate).toBeDefined();
  });

  it('should analyze single segment', async () => {
    const result = await analysis.analyzeSegment(segments[0]);
    expect(result.label).toBe('entusiasmo');
  });

  it('should get sentiment by speaker', async () => {
    const results = await analysis.getSentimentBySpeaker(segments, 'sp1');
    expect(results).toHaveLength(1);
    expect(results[0].speakerId).toBe('sp1');
  });
});
