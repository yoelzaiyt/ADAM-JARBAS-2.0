import type {
  VoiceRouter as IVoiceRouter,
  VoiceRouterConfig,
  VoiceRoute,
  VoiceRouteRequest,
  STTProvider,
  TTSProvider,
  Language,
  VoiceEmotion,
} from './interfaces.js';

interface ProviderMeta {
  quality: number;
  costPerMinute: number;
  latency: 'low' | 'medium' | 'high';
  supportedLanguages: Language[];
  supportedEmotions: VoiceEmotion[];
}

const STT_META: Record<string, ProviderMeta> = {
  'whisper': { quality: 0.95, costPerMinute: 0.06, latency: 'medium', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'], supportedEmotions: ['neutral'] },
  'faster-whisper': { quality: 0.94, costPerMinute: 0.04, latency: 'low', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'], supportedEmotions: ['neutral'] },
  'whisper-cpp': { quality: 0.90, costPerMinute: 0.02, latency: 'medium', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'], supportedEmotions: ['neutral'] },
  'deepgram': { quality: 0.90, costPerMinute: 0.05, latency: 'low', supportedLanguages: ['en', 'es', 'fr', 'de'], supportedEmotions: ['neutral'] },
  'google-speech': { quality: 0.88, costPerMinute: 0.06, latency: 'low', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'], supportedEmotions: ['neutral'] },
  'azure-speech': { quality: 0.92, costPerMinute: 0.07, latency: 'medium', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'], supportedEmotions: ['neutral'] },
  'assemblyai': { quality: 0.91, costPerMinute: 0.07, latency: 'medium', supportedLanguages: ['en', 'es', 'fr', 'de'], supportedEmotions: ['neutral'] },
  'vosk': { quality: 0.80, costPerMinute: 0.0, latency: 'low', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de'], supportedEmotions: ['neutral'] },
  'coqui-stt': { quality: 0.78, costPerMinute: 0.0, latency: 'medium', supportedLanguages: ['pt', 'en', 'es'], supportedEmotions: ['neutral'] },
};

const TTS_META: Record<string, ProviderMeta> = {
  'kokoro': { quality: 0.93, costPerMinute: 0.04, latency: 'medium', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'], supportedEmotions: ['neutral', 'happy', 'sad'] },
  'piper': { quality: 0.80, costPerMinute: 0.01, latency: 'low', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de'], supportedEmotions: ['neutral'] },
  'mizuone': { quality: 0.85, costPerMinute: 0.03, latency: 'medium', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'], supportedEmotions: ['neutral'] },
  'elevenlabs': { quality: 0.98, costPerMinute: 0.30, latency: 'high', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'], supportedEmotions: ['neutral', 'happy', 'sad', 'angry', 'enthusiastic'] },
  'azure-speech': { quality: 0.92, costPerMinute: 0.16, latency: 'medium', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'], supportedEmotions: ['neutral', 'happy', 'sad'] },
  'google-tts': { quality: 0.88, costPerMinute: 0.04, latency: 'low', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'], supportedEmotions: ['neutral', 'happy'] },
  'openai-tts': { quality: 0.90, costPerMinute: 0.15, latency: 'medium', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'], supportedEmotions: ['neutral'] },
  'coqui-tts': { quality: 0.78, costPerMinute: 0.0, latency: 'medium', supportedLanguages: ['pt', 'en', 'es'], supportedEmotions: ['neutral'] },
  'edge-tts': { quality: 0.85, costPerMinute: 0.0, latency: 'low', supportedLanguages: ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'], supportedEmotions: ['neutral'] },
};

const LATENCY_SCORE: Record<string, number> = { low: 1.0, medium: 0.6, high: 0.3 };

const DEFAULT_VOICES: Record<Language, string> = {
  pt: 'pt-BR-Wavenet-A', en: 'en-US-Standard-A', es: 'es-ES-Standard-A',
  fr: 'fr-FR-Standard-A', it: 'it-IT-Wavenet-A', de: 'de-DE-Standard-A',
  ja: 'ja-JP-Wavenet-A',
};

export class VoiceRouter implements IVoiceRouter {
  private routes: Map<string, VoiceRoute> = new Map();
  private config: VoiceRouterConfig;

  constructor(config: VoiceRouterConfig) {
    this.config = config;
  }

  async route(request: VoiceRouteRequest): Promise<VoiceRoute> {
    const language = request.language ?? 'pt';
    const emotion = request.emotion ?? 'neutral';

    const sttProviders: STTProvider[] = ['whisper', 'deepgram', 'google-speech', 'azure-speech', 'faster-whisper', 'vosk'];
    const ttsProviders: TTSProvider[] = ['kokoro', 'piper', 'elevenlabs', 'google-tts', 'azure-speech', 'edge-tts'];

    if (request.audio) {
      const best = this.selectProvider(sttProviders, STT_META, language, emotion);
      const ttsDefault = this.selectProvider(['kokoro', 'piper', 'edge-tts'], TTS_META, language, emotion);
      return { sttProvider: best as STTProvider, ttsProvider: ttsDefault as TTSProvider, voice: DEFAULT_VOICES[language] ?? 'en-US-Standard-A', language, speed: 1.0, emotion, reason: `Best STT: ${best} for ${language}/${emotion}` };
    }

    const bestTTS = this.selectProvider(ttsProviders, TTS_META, language, emotion);
    return { sttProvider: 'whisper', ttsProvider: bestTTS as TTSProvider, voice: DEFAULT_VOICES[language] ?? 'en-US-Standard-A', language, speed: 1.0, emotion, reason: `Best TTS: ${bestTTS} for ${language}/${emotion}` };
  }

  getRoutes(): VoiceRoute[] { return Array.from(this.routes.values()); }
  addRoute(route: VoiceRoute): void { this.routes.set(route.reason, route); }
  removeRoute(id: string): void { this.routes.delete(id); }

  private selectProvider(
    candidates: string[],
    meta: Record<string, ProviderMeta>,
    language: Language,
    emotion: VoiceEmotion,
  ): string {
    let bestScore = -1;
    let best = candidates[0]!;

    for (const name of candidates) {
      const m = meta[name];
      if (!m) continue;
      if (!m.supportedLanguages.includes(language)) continue;

      const emotionBonus = m.supportedEmotions.includes(emotion) ? 0.1 : 0;
      const costScore = 1 - Math.min(m.costPerMinute / 0.3, 1);
      const latScore = LATENCY_SCORE[m.latency] ?? 0.5;
      const score = m.quality * this.config.qualityWeight + costScore * this.config.costWeight + latScore * (1 - this.config.qualityWeight - this.config.costWeight) + emotionBonus;

      if (score > bestScore) { bestScore = score; best = name; }
    }
    return best;
  }
}
