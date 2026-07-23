import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioCapture } from '../AudioCapture.js';

describe('AudioCapture', () => {
  let capture: AudioCapture;
  beforeEach(() => { capture = new AudioCapture(); });

  it('should start and stop capture', async () => {
    await capture.startCapture('m1', { sources: ['microfone'], sampleRate: 16000, channels: 1, bufferSize: 4096, noiseSuppression: true, echoCancellation: true });
    expect(capture.isCapturing('m1')).toBe(true);
    expect(capture.getActiveCaptures()).toContain('m1');
    await capture.stopCapture('m1');
    expect(capture.isCapturing('m1')).toBe(false);
  });

  it('should fire audio callback', async () => {
    const cb = vi.fn();
    capture.onAudio(cb);
    capture.emitChunk({ meetingId: 'm1', source: 'microfone', data: Buffer.alloc(100), sampleRate: 16000, channels: 1, timestamp: new Date(), durationMs: 100, sequenceNumber: 0 });
    expect(cb).toHaveBeenCalled();
  });
});
