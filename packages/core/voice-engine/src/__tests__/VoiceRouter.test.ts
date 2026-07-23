import { describe, it, expect } from 'vitest';
import { VoiceRouter } from '../VoiceRouter.js';
import type { VoiceRouterConfig } from '../interfaces.js';

const config: VoiceRouterConfig = {
  autoSelect: true,
  fallbackProvider: 'whisper',
  ttsFallback: 'kokoro',
  maxLatencyMs: 2000,
  qualityWeight: 0.5,
  costWeight: 0.3,
};

describe('VoiceRouter', () => {
  const router = new VoiceRouter(config);

  it('should route STT request for audio', async () => {
    const route = await router.route({
      audio: { data: Buffer.alloc(100), sampleRate: 16000, channels: 1, format: 'wav', durationMs: 1000 },
      language: 'pt',
    });
    expect(route.sttProvider).toBeDefined();
    expect(route.language).toBe('pt');
    expect(route.reason).toContain('STT');
  });

  it('should route TTS request for text', async () => {
    const route = await router.route({
      text: 'Olá',
      language: 'pt',
      emotion: 'happy',
    });
    expect(route.ttsProvider).toBeDefined();
    expect(route.language).toBe('pt');
    expect(route.reason).toContain('TTS');
  });

  it('should default to pt language', async () => {
    const route = await router.route({ text: 'hi' });
    expect(route.language).toBe('pt');
  });

  it('should default to neutral emotion', async () => {
    const route = await router.route({ text: 'hello' });
    expect(route.emotion).toBe('neutral');
  });

  it('should add and retrieve routes', () => {
    const route = {
      sttProvider: 'whisper' as const,
      ttsProvider: 'kokoro' as const,
      voice: 'test-voice',
      language: 'pt' as const,
      speed: 1.0,
      emotion: 'neutral' as const,
      reason: 'test route',
    };
    router.addRoute(route);
    expect(router.getRoutes()).toHaveLength(1);
  });
});
