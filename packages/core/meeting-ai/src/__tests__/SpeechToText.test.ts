import { describe, it, expect } from 'vitest';
import { SpeechToText } from '../SpeechToText.js';
import type { AudioChunk } from '../interfaces.js';

const chunk: AudioChunk = {
  meetingId: 'm1', source: 'microfone', data: Buffer.alloc(512),
  sampleRate: 16000, channels: 1, timestamp: new Date(), durationMs: 1000, sequenceNumber: 0,
};

describe('SpeechToText', () => {
  const stt = new SpeechToText();

  it('should return providers', () => {
    expect(stt.getProviders()).toContain('whisper');
    expect(stt.getProviders()).toHaveLength(5);
  });

  it('should transcribe chunks', async () => {
    const result = await stt.transcribe([chunk], { provider: 'whisper', language: 'pt' });
    expect(result).toHaveLength(1);
    expect(result[0].text).toContain('whisper');
  });

  it('should return empty for no chunks', async () => {
    expect(await stt.transcribe([], { provider: 'whisper', language: 'pt' })).toHaveLength(0);
  });

  it('should stream transcription', async () => {
    const results: any[] = [];
    for await (const r of stt.transcribeStream(chunk, { provider: 'deepgram', language: 'en' })) {
      results.push(r);
    }
    expect(results).toHaveLength(3);
    expect(results[2].words).toBeDefined();
  });
});
