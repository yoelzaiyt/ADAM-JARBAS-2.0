import { describe, it, expect, vi } from 'vitest';
import { StreamingEngine } from '../StreamingEngine.js';
import type { StreamingConfig, AudioChunk } from '../interfaces.js';

const config: StreamingConfig = {
  mode: 'full',
  bufferSize: 4096,
  sampleRate: 16000,
  channels: 1,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

const mockChunk: AudioChunk = {
  id: 'c1',
  data: Buffer.alloc(512),
  timestamp: new Date(),
  durationMs: 100,
  sequenceNumber: 0,
};

describe('StreamingEngine', () => {
  const engine = new StreamingEngine();

  it('should start and end session', async () => {
    const session = await engine.startSession(config);
    expect(session.id).toBeDefined();
    expect(session.mode).toBe('full');
    expect(session.status).toBe('active');
    expect(session.chunksProcessed).toBe(0);

    await engine.endSession(session.id);
    const ended = engine.getSession(session.id);
    expect(ended?.status).toBe('ended');
  });

  it('should send audio and trigger callback', async () => {
    const session = await engine.startSession(config);
    const callback = vi.fn();
    engine.onAudio(callback, session.id);
    await engine.sendAudio(session.id, mockChunk);
    expect(callback).toHaveBeenCalledWith(mockChunk);
    expect(engine.getSession(session.id)?.chunksProcessed).toBe(1);
    await engine.endSession(session.id);
  });

  it('should return null for unknown session', () => {
    expect(engine.getSession('nonexistent')).toBeNull();
  });

  it('should track active sessions', async () => {
    const s1 = await engine.startSession(config);
    const s2 = await engine.startSession(config);
    expect(engine.getActiveSessions().length).toBeGreaterThanOrEqual(2);
    await engine.endSession(s1.id);
    await engine.endSession(s2.id);
  });
});
