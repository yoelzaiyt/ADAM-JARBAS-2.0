import type { SynthesisEngine as ISynthesisEngine, SynthesisConfig, SynthesisResult, AudioBuffer } from './interfaces.js';

function mockAudio(durationMs: number): AudioBuffer {
  return {
    data: Buffer.alloc(0),
    sampleRate: 16000,
    channels: 1,
    format: 'wav',
    durationMs,
  };
}

export class SynthesisEngine implements ISynthesisEngine {
  constructor() {}

  async synthesize(text: string, config: SynthesisConfig): Promise<SynthesisResult> {
    const charsPerMs = 0.05 * config.speed;
    const durationMs = Math.round(text.length / charsPerMs);
    return {
      audio: mockAudio(durationMs),
      text,
      durationMs,
      prosody: { speed: config.speed, pitch: config.pitch, emotion: config.emotion },
    };
  }

  adjustProsody(audio: AudioBuffer, prosody: Record<string, unknown>): AudioBuffer {
    const speed = (prosody.speed as number) ?? 1;
    const newDuration = Math.round(audio.durationMs / speed);
    return { ...audio, durationMs: newDuration };
  }

  addBreathing(audio: AudioBuffer, rate: number): AudioBuffer {
    const breathCount = Math.floor(audio.durationMs / (1000 / rate));
    return { ...audio, durationMs: audio.durationMs + breathCount * 200 };
  }

  addPause(audio: AudioBuffer, positionMs: number, durationMs: number): AudioBuffer {
    if (positionMs > audio.durationMs) {
      return { ...audio, durationMs: positionMs + durationMs };
    }
    return { ...audio, durationMs: audio.durationMs + durationMs };
  }
}
