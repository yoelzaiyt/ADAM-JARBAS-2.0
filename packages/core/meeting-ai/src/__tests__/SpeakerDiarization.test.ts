import { describe, it, expect } from 'vitest';
import { SpeakerDiarization } from '../SpeakerDiarization.js';
import type { AudioChunk } from '../interfaces.js';

const chunks: AudioChunk[] = [
  { meetingId: 'm1', source: 'microfone', data: Buffer.alloc(512), sampleRate: 16000, channels: 1, timestamp: new Date(), durationMs: 5000, sequenceNumber: 0 },
];

describe('SpeakerDiarization', () => {
  const diar = new SpeakerDiarization();

  it('should diarize with specified speakers', async () => {
    const result = await diar.diarize(chunks, 3);
    expect(result.speakerCount).toBe(3);
    expect(result.speakers).toHaveLength(3);
    expect(result.segments).toHaveLength(6);
  });

  it('should diarize with default speakers', async () => {
    const result = await diar.diarize(chunks);
    expect(result.speakerCount).toBe(2);
  });

  it('should identify speaker', async () => {
    await diar.identifySpeaker('Joel', chunks);
    expect(diar.getSpeakers('m1')).toHaveLength(1);
    expect(diar.getSpeakers('m1')[0].name).toBe('Joel');
  });
});
