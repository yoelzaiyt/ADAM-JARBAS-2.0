import { randomUUID } from 'node:crypto';
import type {
  TTSEngine as ITTSEngine,
  TTSConfig,
  TTSResult,
  TTSProvider,
  AudioBuffer,
  Language,
  VoiceInfo,
  AudioChunk,
  VoiceGender,
} from './interfaces.js';

const ALL_LANGUAGES: Language[] = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'];

interface TTSAdapter {
  synthesize(text: string, config?: TTSConfig): Promise<TTSResult>;
  getVoices(language?: Language): VoiceInfo[];
  getProviderName(): TTSProvider;
}

function buildMockResult(
  provider: TTSProvider,
  text: string,
  config?: TTSConfig,
): TTSResult {
  const voice = config?.voice ?? `${provider}-default`;
  return {
    audio: {
      data: Buffer.alloc(1024),
      sampleRate: 24000,
      channels: 1,
      format: 'mp3',
      durationMs: text.length * 80,
    },
    text,
    voice,
    provider,
    durationMs: text.length * 80,
    latencyMs: 100 + Math.random() * 300,
    tokensUsed: text.split(' ').length,
  };
}

function buildMockVoices(provider: TTSProvider, language?: Language): VoiceInfo[] {
  const lang = language ?? 'en';
  const genders: VoiceGender[] = ['male', 'female', 'neutral'];
  return Array.from({ length: 5 }, (_, i) => ({
    id: `${provider}-${lang}-${i}`,
    name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Voice ${i + 1}`,
    gender: genders[i % genders.length],
    language: lang,
    preview: `https://mock.voices/${provider}/${lang}/${i}.mp3`,
    styles: ['default', 'narration', 'conversational'],
  }));
}

class KokoroAdapter implements TTSAdapter {
  private readonly provider: TTSProvider = 'kokoro';

  getProviderName(): TTSProvider {
    return this.provider;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    return buildMockResult(this.provider, text, config);
  }

  getVoices(language?: Language): VoiceInfo[] {
    return buildMockVoices(this.provider, language);
  }
}

class PiperAdapter implements TTSAdapter {
  private readonly provider: TTSProvider = 'piper';

  getProviderName(): TTSProvider {
    return this.provider;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    return buildMockResult(this.provider, text, config);
  }

  getVoices(language?: Language): VoiceInfo[] {
    return buildMockVoices(this.provider, language);
  }
}

class MizuOneAdapter implements TTSAdapter {
  private readonly provider: TTSProvider = 'mizuone';

  getProviderName(): TTSProvider {
    return this.provider;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    return buildMockResult(this.provider, text, config);
  }

  getVoices(language?: Language): VoiceInfo[] {
    return buildMockVoices(this.provider, language);
  }
}

class ElevenLabsAdapter implements TTSAdapter {
  private readonly provider: TTSProvider = 'elevenlabs';

  getProviderName(): TTSProvider {
    return this.provider;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    return buildMockResult(this.provider, text, config);
  }

  getVoices(language?: Language): VoiceInfo[] {
    return buildMockVoices(this.provider, language);
  }
}

class AzureSpeechTTSAdapter implements TTSAdapter {
  private readonly provider: TTSProvider = 'azure-speech';

  getProviderName(): TTSProvider {
    return this.provider;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    return buildMockResult(this.provider, text, config);
  }

  getVoices(language?: Language): VoiceInfo[] {
    return buildMockVoices(this.provider, language);
  }
}

class GoogleTTSAdapter implements TTSAdapter {
  private readonly provider: TTSProvider = 'google-tts';

  getProviderName(): TTSProvider {
    return this.provider;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    return buildMockResult(this.provider, text, config);
  }

  getVoices(language?: Language): VoiceInfo[] {
    return buildMockVoices(this.provider, language);
  }
}

class OpenAITTSAdapter implements TTSAdapter {
  private readonly provider: TTSProvider = 'openai-tts';

  getProviderName(): TTSProvider {
    return this.provider;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    return buildMockResult(this.provider, text, config);
  }

  getVoices(language?: Language): VoiceInfo[] {
    return buildMockVoices(this.provider, language);
  }
}

class CoquiTTSAdapter implements TTSAdapter {
  private readonly provider: TTSProvider = 'coqui-tts';

  getProviderName(): TTSProvider {
    return this.provider;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    return buildMockResult(this.provider, text, config);
  }

  getVoices(language?: Language): VoiceInfo[] {
    return buildMockVoices(this.provider, language);
  }
}

class EdgeTTSAdapter implements TTSAdapter {
  private readonly provider: TTSProvider = 'edge-tts';

  getProviderName(): TTSProvider {
    return this.provider;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    return buildMockResult(this.provider, text, config);
  }

  getVoices(language?: Language): VoiceInfo[] {
    return buildMockVoices(this.provider, language);
  }
}

export class TTSEngine implements ITTSEngine {
  private readonly defaultConfig: TTSConfig;
  private readonly adapters: Map<TTSProvider, TTSAdapter>;

  constructor(defaultConfig: TTSConfig) {
    this.defaultConfig = defaultConfig;
    this.adapters = new Map<TTSProvider, TTSAdapter>([
      ['kokoro', new KokoroAdapter()],
      ['piper', new PiperAdapter()],
      ['mizuone', new MizuOneAdapter()],
      ['elevenlabs', new ElevenLabsAdapter()],
      ['azure-speech', new AzureSpeechTTSAdapter()],
      ['google-tts', new GoogleTTSAdapter()],
      ['openai-tts', new OpenAITTSAdapter()],
      ['coqui-tts', new CoquiTTSAdapter()],
      ['edge-tts', new EdgeTTSAdapter()],
    ]);
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    const resolved = { ...this.defaultConfig, ...config };
    const adapter = this.adapters.get(resolved.provider);
    if (!adapter) {
      throw new Error(`Unknown TTS provider: ${resolved.provider}`);
    }
    return adapter.synthesize(text, resolved);
  }

  async *synthesizeStream(text: string, config?: TTSConfig): AsyncIterable<AudioChunk> {
    const resolved = { ...this.defaultConfig, ...config };
    const result = await this.synthesize(text, resolved);
    const totalDurationMs = result.audio.durationMs;
    const chunkCount = 4;
    const chunkDuration = Math.floor(totalDurationMs / chunkCount);

    for (let i = 0; i < chunkCount; i++) {
      yield {
        id: randomUUID(),
        data: Buffer.alloc(256),
        timestamp: new Date(),
        durationMs: i === chunkCount - 1 ? totalDurationMs - chunkDuration * (chunkCount - 1) : chunkDuration,
        sequenceNumber: i,
      };
    }
  }

  getProviders(): TTSProvider[] {
    return Array.from(this.adapters.keys());
  }

  getVoices(provider: TTSProvider, language?: Language): VoiceInfo[] {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Unknown TTS provider: ${provider}`);
    }
    return adapter.getVoices(language);
  }
}
