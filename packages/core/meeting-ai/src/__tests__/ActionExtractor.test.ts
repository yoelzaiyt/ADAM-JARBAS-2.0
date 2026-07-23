import { describe, it, expect } from 'vitest';
import { ActionExtractor } from '../ActionExtractor.js';
import type { TranscriptionSegment } from '../interfaces.js';

const segments: TranscriptionSegment[] = [
  { id: 's1', speakerId: 'sp1', text: 'Decidimos usar whisper para transcrição', startMs: 0, endMs: 1000, confidence: 0.9, words: [] },
  { id: 's2', speakerId: 'sp2', text: 'Temos um problema com latência', startMs: 1000, endMs: 2000, confidence: 0.85, words: [] },
  { id: 's3', speakerId: 'sp1', text: 'O prazo é 15/08/2026', startMs: 2000, endMs: 3000, confidence: 0.9, words: [] },
];

describe('ActionExtractor', () => {
  const extractor = new ActionExtractor();

  it('should extract entities', async () => {
    const entities = await extractor.extract(segments);
    expect(entities.length).toBeGreaterThan(0);
  });

  it('should filter by type', async () => {
    const entities = await extractor.extract(segments);
    const decisoes = extractor.getByType(entities, 'decisao');
    expect(Array.isArray(decisoes)).toBe(true);
  });
});
