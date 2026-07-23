import { describe, it, expect, beforeEach } from 'vitest';
import { Summarizer } from '../Summarizer.js';
import type { Transcript } from '../interfaces.js';

const transcript: Transcript = {
  id: 't1', meetingId: 'm1', version: 'completa',
  segments: [{ id: 's1', speakerId: 'sp1', text: 'Decidimos usar whisper', startMs: 0, endMs: 1000, confidence: 0.9, words: [] }],
  text: 'Decidimos usar whisper',
  createdAt: new Date(),
};

describe('Summarizer', () => {
  let summarizer: Summarizer;
  beforeEach(() => { summarizer = new Summarizer(); });

  it('should generate summary', async () => {
    const s = await summarizer.generate(transcript, '30s');
    expect(s.level).toBe('30s');
    expect(s.content).toBeDefined();
    expect(s.keyPoints).toBeDefined();
  });

  it('should generate all summary levels', async () => {
    const all = await summarizer.generateAll(transcript);
    expect(all).toHaveLength(7);
    expect(all.map(s => s.level)).toContain('executivo');
    expect(all.map(s => s.level)).toContain('tecnico');
  });

  it('should get summary by id', async () => {
    const s = await summarizer.generate(transcript, '2min');
    expect(summarizer.getSummary(s.id)).not.toBeNull();
  });

  it('should get summaries by meeting', async () => {
    await summarizer.generate(transcript, '30s');
    await summarizer.generate(transcript, 'executivo');
    expect(summarizer.getSummariesByMeeting('m1')).toHaveLength(2);
  });
});
