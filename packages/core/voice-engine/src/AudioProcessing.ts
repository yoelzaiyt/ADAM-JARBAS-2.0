import type { AudioProcessing as IAudioProcessing, AudioProcessingConfig, AudioProcessingResult, AudioBuffer, AudioFormat } from './interfaces.js';

export class AudioProcessing implements IAudioProcessing {
  constructor() {}

  async process(audio: AudioBuffer, config?: AudioProcessingConfig): Promise<AudioProcessingResult> {
    const processed = { ...audio };
    let trimmedMs = 0;
    let normalized = false;

    if (config?.trimSilence) {
      const trimmed = this.trimSilence(processed, config.silenceThreshold);
      trimmedMs = audio.durationMs - trimmed.durationMs;
      Object.assign(processed, trimmed);
    }

    if (config?.normalize) {
      const norm = this.normalize(processed);
      normalized = true;
      Object.assign(processed, norm);
    }

    return {
      processed,
      originalDurationMs: audio.durationMs,
      processedDurationMs: processed.durationMs,
      trimmedMs,
      normalized,
    };
  }

  normalize(audio: AudioBuffer): AudioBuffer {
    return { ...audio, data: audio.data, durationMs: audio.durationMs };
  }

  trimSilence(audio: AudioBuffer, threshold?: number): AudioBuffer {
    const trimMs = (threshold ?? 0.01) * 1000;
    const newDuration = Math.max(0, audio.durationMs - trimMs * 2);
    return { ...audio, durationMs: newDuration };
  }

  convertFormat(audio: AudioBuffer, format: AudioFormat): AudioBuffer {
    return { ...audio, format };
  }

  getDuration(audio: AudioBuffer): number {
    return audio.durationMs;
  }

  mix(audios: AudioBuffer[]): AudioBuffer {
    if (audios.length === 0) {
      return { data: Buffer.alloc(0), sampleRate: 16000, channels: 1, format: 'wav', durationMs: 0 };
    }
    const maxDuration = Math.max(...audios.map((a) => a.durationMs));
    return {
      data: Buffer.alloc(0),
      sampleRate: audios[0].sampleRate,
      channels: audios[0].channels,
      format: audios[0].format,
      durationMs: maxDuration,
    };
  }
}
