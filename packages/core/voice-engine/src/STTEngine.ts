import type {
  STTEngine as ISTTEngine,
  STTConfig,
  STTResult,
  STTProvider,
  AudioBuffer,
  AudioChunk,
  Language,
  WordTiming,
} from './interfaces.js';

const ALL_LANGUAGES: Language[] = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'];

interface STTAdapter {
  transcribe(audio: AudioBuffer, config?: STTConfig): Promise<STTResult>;
  getSupportedLanguages(): Language[];
  getProviderName(): STTProvider;
}

function splitIntoWords(text: string, durationMs: number): WordTiming[] {
  const words = text.split(' ');
  const wordDuration = durationMs / words.length;
  return words.map((word, i) => ({
    word,
    startMs: Math.round(i * wordDuration),
    endMs: Math.round((i + 1) * wordDuration),
    confidence: 0.85 + Math.random() * 0.15,
  }));
}

function buildMockResult(
  provider: STTProvider,
  audio: AudioBuffer,
  config?: STTConfig,
): STTResult {
  const text = `Transcribed text from ${provider}`;
  const language = config?.language ?? 'en';
  const confidence = 0.85 + Math.random() * 0.15;
  return {
    text,
    confidence,
    language,
    words: splitIntoWords(text, audio.durationMs),
    durationMs: audio.durationMs,
    provider,
    latencyMs: 50 + Math.random() * 200,
  };
}

class WhisperAdapter implements STTAdapter {
  private readonly provider: STTProvider = 'whisper';

  getProviderName(): STTProvider {
    return this.provider;
  }

  getSupportedLanguages(): Language[] {
    return [...ALL_LANGUAGES];
  }

  async transcribe(audio: AudioBuffer, config?: STTConfig): Promise<STTResult> {
    return buildMockResult(this.provider, audio, config);
  }
}

class FasterWhisperAdapter implements STTAdapter {
  private readonly provider: STTProvider = 'faster-whisper';

  getProviderName(): STTProvider {
    return this.provider;
  }

  getSupportedLanguages(): Language[] {
    return [...ALL_LANGUAGES];
  }

  async transcribe(audio: AudioBuffer, config?: STTConfig): Promise<STTResult> {
    return buildMockResult(this.provider, audio, config);
  }
}

class WhisperCppAdapter implements STTAdapter {
  private readonly provider: STTProvider = 'whisper-cpp';

  getProviderName(): STTProvider {
    return this.provider;
  }

  getSupportedLanguages(): Language[] {
    return [...ALL_LANGUAGES];
  }

  async transcribe(audio: AudioBuffer, config?: STTConfig): Promise<STTResult> {
    return buildMockResult(this.provider, audio, config);
  }
}

class DeepgramAdapter implements STTAdapter {
  private readonly provider: STTProvider = 'deepgram';

  getProviderName(): STTProvider {
    return this.provider;
  }

  getSupportedLanguages(): Language[] {
    return [...ALL_LANGUAGES];
  }

  async transcribe(audio: AudioBuffer, config?: STTConfig): Promise<STTResult> {
    return buildMockResult(this.provider, audio, config);
  }
}

class GoogleSpeechAdapter implements STTAdapter {
  private readonly provider: STTProvider = 'google-speech';

  getProviderName(): STTProvider {
    return this.provider;
  }

  getSupportedLanguages(): Language[] {
    return [...ALL_LANGUAGES];
  }

  async transcribe(audio: AudioBuffer, config?: STTConfig): Promise<STTResult> {
    return buildMockResult(this.provider, audio, config);
  }
}

class AzureSpeechAdapter implements STTAdapter {
  private readonly provider: STTProvider = 'azure-speech';

  getProviderName(): STTProvider {
    return this.provider;
  }

  getSupportedLanguages(): Language[] {
    return [...ALL_LANGUAGES];
  }

  async transcribe(audio: AudioBuffer, config?: STTConfig): Promise<STTResult> {
    return buildMockResult(this.provider, audio, config);
  }
}

class AssemblyAIAdapter implements STTAdapter {
  private readonly provider: STTProvider = 'assemblyai';

  getProviderName(): STTProvider {
    return this.provider;
  }

  getSupportedLanguages(): Language[] {
    return [...ALL_LANGUAGES];
  }

  async transcribe(audio: AudioBuffer, config?: STTConfig): Promise<STTResult> {
    return buildMockResult(this.provider, audio, config);
  }
}

class VoskAdapter implements STTAdapter {
  private readonly provider: STTProvider = 'vosk';

  getProviderName(): STTProvider {
    return this.provider;
  }

  getSupportedLanguages(): Language[] {
    return [...ALL_LANGUAGES];
  }

  async transcribe(audio: AudioBuffer, config?: STTConfig): Promise<STTResult> {
    return buildMockResult(this.provider, audio, config);
  }
}

class CoquiSTTAdapter implements STTAdapter {
  private readonly provider: STTProvider = 'coqui-stt';

  getProviderName(): STTProvider {
    return this.provider;
  }

  getSupportedLanguages(): Language[] {
    return [...ALL_LANGUAGES];
  }

  async transcribe(audio: AudioBuffer, config?: STTConfig): Promise<STTResult> {
    return buildMockResult(this.provider, audio, config);
  }
}

export class STTEngine implements ISTTEngine {
  private readonly defaultConfig: STTConfig;
  private readonly adapters: Map<STTProvider, STTAdapter>;

  constructor(defaultConfig: STTConfig) {
    this.defaultConfig = defaultConfig;
    this.adapters = new Map<STTProvider, STTAdapter>([
      ['whisper', new WhisperAdapter()],
      ['faster-whisper', new FasterWhisperAdapter()],
      ['whisper-cpp', new WhisperCppAdapter()],
      ['deepgram', new DeepgramAdapter()],
      ['google-speech', new GoogleSpeechAdapter()],
      ['azure-speech', new AzureSpeechAdapter()],
      ['assemblyai', new AssemblyAIAdapter()],
      ['vosk', new VoskAdapter()],
      ['coqui-stt', new CoquiSTTAdapter()],
    ]);
  }

  async transcribe(audio: AudioBuffer, config?: STTConfig): Promise<STTResult> {
    const resolved = { ...this.defaultConfig, ...config };
    const adapter = this.adapters.get(resolved.provider);
    if (!adapter) {
      throw new Error(`Unknown STT provider: ${resolved.provider}`);
    }
    return adapter.transcribe(audio, resolved);
  }

  async *transcribeStream(audioChunk: AudioChunk): AsyncIterable<Partial<STTResult>> {
    const totalDurationMs = audioChunk.durationMs;
    const chunkCount = 3;
    const chunkDuration = totalDurationMs / chunkCount;

    for (let i = 0; i < chunkCount; i++) {
      const isFinal = i === chunkCount - 1;
      const text = isFinal
        ? `Transcribed text from ${this.defaultConfig.provider}`
        : `Partial ${i + 1}/${chunkCount}...`;
      yield {
        text,
        confidence: isFinal ? 0.85 + Math.random() * 0.15 : 0.5 + Math.random() * 0.3,
        language: this.defaultConfig.language ?? 'en',
        provider: this.defaultConfig.provider,
        latencyMs: 50 + Math.random() * 200,
        ...(isFinal
          ? {
              words: splitIntoWords(
                `Transcribed text from ${this.defaultConfig.provider}`,
                totalDurationMs,
              ),
              durationMs: totalDurationMs,
            }
          : {}),
      };
    }
  }

  getProviders(): STTProvider[] {
    return Array.from(this.adapters.keys());
  }

  getSupportedLanguages(provider: STTProvider): Language[] {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Unknown STT provider: ${provider}`);
    }
    return adapter.getSupportedLanguages();
  }
}
