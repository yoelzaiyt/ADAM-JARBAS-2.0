import type { VoiceEngineConfig, AudioBuffer } from './interfaces.js';
import { STTEngine } from './STTEngine.js';
import { TTSEngine } from './TTSEngine.js';
import { VoiceRouter } from './VoiceRouter.js';
import { WakeWordEngine } from './WakeWord.js';
import { StreamingEngine } from './StreamingEngine.js';
import { ConversationEngine } from './ConversationEngine.js';
import { EmotionEngine } from './EmotionEngine.js';
import { VoiceProfiles } from './VoiceProfiles.js';
import { VoiceMemory } from './VoiceMemory.js';
import { AudioProcessing } from './AudioProcessing.js';
import { NoiseReduction } from './NoiseReduction.js';
import { LanguageEngine } from './LanguageEngine.js';
import { TranslationEngine } from './TranslationEngine.js';
import { SynthesisEngine } from './SynthesisEngine.js';
import { DiarizationEngine } from './DiarizationEngine.js';
import { AudioCacheEngine } from './AudioCacheEngine.js';
import { VoiceMonitoring } from './VoiceMonitoring.js';

export class VoiceEngine {
  private config: VoiceEngineConfig;

  public stt: STTEngine;
  public tts: TTSEngine;
  public router: VoiceRouter;
  public wakeWord: WakeWordEngine;
  public streaming: StreamingEngine;
  public conversation: ConversationEngine;
  public emotion: EmotionEngine;
  public profiles: VoiceProfiles;
  public memory: VoiceMemory;
  public audioProcessing: AudioProcessing;
  public noiseReduction: NoiseReduction;
  public language: LanguageEngine;
  public translation: TranslationEngine;
  public synthesis: SynthesisEngine;
  public diarization: DiarizationEngine;
  public cache: AudioCacheEngine;
  public monitoring: VoiceMonitoring;

  constructor(config: VoiceEngineConfig) {
    this.config = config;

    this.stt = new STTEngine({
      provider: config.defaultSTTProvider,
      language: config.defaultLanguage,
    });

    this.tts = new TTSEngine({
      provider: config.defaultTTSProvider,
      voice: config.defaultVoice,
      speed: config.defaultSpeed,
    });

    this.router = new VoiceRouter({
      autoSelect: true,
      fallbackProvider: config.defaultSTTProvider,
      ttsFallback: config.defaultTTSProvider,
      maxLatencyMs: 2000,
      qualityWeight: 0.6,
      costWeight: 0.4,
    });

    this.wakeWord = new WakeWordEngine();
    this.streaming = new StreamingEngine();
    this.conversation = new ConversationEngine();
    this.emotion = new EmotionEngine();
    this.profiles = new VoiceProfiles();
    this.memory = new VoiceMemory();
    this.audioProcessing = new AudioProcessing();
    this.noiseReduction = new NoiseReduction();
    this.language = new LanguageEngine();
    this.translation = new TranslationEngine();
    this.synthesis = new SynthesisEngine();
    this.diarization = new DiarizationEngine();
    this.cache = new AudioCacheEngine();
    this.monitoring = new VoiceMonitoring();
  }

  async initialize(): Promise<void> {
    const defaultProfile = await this.profiles.getDefault();
    if (defaultProfile) {
      this.config.defaultVoice = defaultProfile.voice;
      this.config.defaultLanguage = defaultProfile.language;
    }
  }

  async shutdown(): Promise<void> {
    await this.wakeWord.stop();

    const activeSessions = this.streaming.getActiveSessions();
    for (const session of activeSessions) {
      await this.streaming.endSession(session.id);
    }
  }

  async speak(
    text: string,
    options?: { profileId?: string; language?: string; emotion?: string },
  ): Promise<{ audio: AudioBuffer; duration: number }> {
    const result = await this.tts.synthesize(text, {
      provider: this.config.defaultTTSProvider,
      voice: this.config.defaultVoice,
      speed: this.config.defaultSpeed,
    });

    this.monitoring.recordMetric('tts_requests', 1);

    return { audio: result.audio, duration: result.durationMs };
  }

  async listen(
    audio: AudioBuffer,
  ): Promise<{ text: string; confidence: number; language: string }> {
    const result = await this.stt.transcribe(audio, {
      provider: this.config.defaultSTTProvider,
      language: this.config.defaultLanguage,
    });

    this.monitoring.recordMetric('stt_requests', 1);

    return { text: result.text, confidence: result.confidence, language: result.language };
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    const result = await this.translation.translate(text, {
      sourceLanguage: from as any,
      targetLanguage: to as any,
      preserveFormatting: true,
      formal: false,
    });

    return result.translated;
  }

  getHealth(): {
    status: string;
    uptime: number;
    modules: Record<string, string>;
  } {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      modules: {
        stt: 'ok',
        tts: 'ok',
        router: 'ok',
        wakeWord: 'ok',
        streaming: 'ok',
        conversation: 'ok',
        emotion: 'ok',
        profiles: 'ok',
        memory: 'ok',
        audioProcessing: 'ok',
        noiseReduction: 'ok',
        language: 'ok',
        translation: 'ok',
        synthesis: 'ok',
        diarization: 'ok',
        cache: 'ok',
        monitoring: 'ok',
      },
    };
  }

  getConfig(): VoiceEngineConfig {
    return { ...this.config };
  }

  static createDefault(): VoiceEngine {
    return new VoiceEngine({
      defaultLanguage: 'pt',
      defaultVoice: 'jarbas',
      defaultTTSProvider: 'kokoro',
      defaultSTTProvider: 'whisper',
      defaultSpeed: 1.0,
      defaultPitch: 1.0,
      defaultVolume: 1.0,
      streamingMode: 'push-to-talk',
      maxConcurrentSessions: 5,
      cacheEnabled: true,
      monitoringEnabled: true,
      logLevel: 'info',
    });
  }
}
