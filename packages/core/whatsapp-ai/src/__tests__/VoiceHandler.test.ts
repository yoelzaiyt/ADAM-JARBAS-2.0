import { describe, it, expect, beforeEach } from 'vitest';
import { VoiceHandler } from '../VoiceHandler.js';

describe('VoiceHandler', () => {
  let handler: VoiceHandler;

  beforeEach(() => {
    handler = new VoiceHandler();
  });

  it('processes audio', async () => {
    const voice = await handler.processAudio('audio.mp3', 'c1');
    expect(voice.contactId).toBe('c1');
    expect(voice.audioUrl).toBe('audio.mp3');
    expect(voice.id).toBeDefined();
  });

  it('transcribes voice message', async () => {
    const voice = await handler.processAudio('audio.mp3', 'c1');
    const text = await handler.transcribe(voice.id);
    expect(text).toBeDefined();
    expect(typeof text).toBe('string');
  });

  it('respondWithVoice creates audio message', async () => {
    const msg = await handler.respondWithVoice('conv1', 'hello');
    expect(msg.type).toBe('audio');
    expect(msg.direction).toBe('outbound');
  });

  it('getVoiceMessage returns null for nonexistent', () => {
    expect(handler.getVoiceMessage('bad')).toBeNull();
  });
});
