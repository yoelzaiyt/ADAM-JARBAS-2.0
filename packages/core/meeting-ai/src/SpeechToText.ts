import { randomUUID } from 'node:crypto';
import type {
  SpeechToText as ISpeechToText,
  STTConfig,
  STTProvider,
  TranscriptionSegment,
  AudioChunk,
  WordTiming,
} from './interfaces.js';

function splitIntoWords(text: string, startMs: number, endMs: number): WordTiming[] {
  const words = text.split(' ');
  const duration = endMs - startMs;
  const wordDuration = duration / words.length;
  return words.map((word, i) => ({
    word,
    startMs: Math.round(startMs + i * wordDuration),
    endMs: Math.round(startMs + (i + 1) * wordDuration),
    confidence: 0.85 + Math.random() * 0.15,
  }));
}

export class SpeechToText implements ISpeechToText {
  private providers: STTProvider[] = ['whisper', 'faster-whisper', 'deepgram', 'azure-speech', 'google-speech'];

  async transcribe(audioChunks: AudioChunk[], config: STTConfig): Promise<TranscriptionSegment[]> {
    if (audioChunks.length === 0) return [];

    const segments: TranscriptionSegment[] = [];
    let currentMs = 0;

    for (let i = 0; i < audioChunks.length; i++) {
      const chunk = audioChunks[i]!;
      const endMs = currentMs + chunk.durationMs;
      const text = `Transcrição do chunk ${i + 1} (${config.provider})`;
      segments.push({
        id: randomUUID(),
        speakerId: `speaker-unknown`,
        text,
        startMs: currentMs,
        endMs,
        confidence: 0.85 + Math.random() * 0.15,
        words: splitIntoWords(text, currentMs, endMs),
      });
      currentMs = endMs;
    }

    return segments;
  }

  async *transcribeStream(audioChunk: AudioChunk, config: STTConfig): AsyncIterable<Partial<TranscriptionSegment>> {
    const chunkCount = 3;
    for (let i = 0; i < chunkCount; i++) {
      const isFinal = i === chunkCount - 1;
      yield {
        id: randomUUID(),
        text: isFinal ? `Transcrição final (${config.provider})` : `Parcial ${i + 1}/${chunkCount}...`,
        confidence: isFinal ? 0.9 : 0.5 + Math.random() * 0.3,
        speakerId: 'speaker-unknown',
        startMs: 0,
        endMs: audioChunk.durationMs,
        ...(isFinal ? { words: splitIntoWords(`Transcrição final (${config.provider})`, 0, audioChunk.durationMs) } : {}),
      };
    }
  }

  getProviders(): STTProvider[] {
    return [...this.providers];
  }
}
