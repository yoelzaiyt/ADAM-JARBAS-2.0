import type { AIProviderName } from '@jarbas/types';

// ─── Common ───────────────────────────────────────────────────────────────────

export type Language = 'pt' | 'en' | 'es' | 'fr' | 'it' | 'de' | 'ja';
export type AudioFormat = 'wav' | 'mp3' | 'ogg' | 'flac' | 'pcm' | 'opus';
export type VoiceGender = 'male' | 'female' | 'neutral';
export type VoiceEmotion =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'anxious'
  | 'doubtful'
  | 'enthusiastic'
  | 'urgent'
  | 'calm'
  | 'frustrated'
  | 'tired'
  | 'confident';
export type DuplexMode = 'full' | 'half' | 'push-to-talk' | 'always-listening';
export type SpeakerRole = 'user' | 'assistant' | 'moderator' | 'unknown';

export interface VoiceEvent {
  type: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

// ─── Audio ────────────────────────────────────────────────────────────────────

export interface AudioBuffer {
  data: Buffer | Float32Array;
  sampleRate: number;
  channels: number;
  format: AudioFormat;
  durationMs: number;
}

export interface AudioChunk {
  id: string;
  data: Buffer;
  timestamp: Date;
  durationMs: number;
  sequenceNumber: number;
}

// ─── STT ──────────────────────────────────────────────────────────────────────

export type STTProvider =
  | 'whisper'
  | 'faster-whisper'
  | 'whisper-cpp'
  | 'deepgram'
  | 'google-speech'
  | 'azure-speech'
  | 'assemblyai'
  | 'vosk'
  | 'coqui-stt';

export interface STTConfig {
  provider: STTProvider;
  model?: string;
  language?: Language;
  apiKey?: string;
  baseUrl?: string;
  streaming?: boolean;
}

export interface WordTiming {
  word: string;
  startMs: number;
  endMs: number;
  confidence: number;
}

export interface STTResult {
  text: string;
  confidence: number;
  language: Language;
  words: WordTiming[];
  durationMs: number;
  provider: STTProvider;
  latencyMs: number;
}

export interface STTEngine {
  transcribe(audio: AudioBuffer, config?: STTConfig): Promise<STTResult>;
  transcribeStream(audioChunk: AudioChunk): AsyncIterable<Partial<STTResult>>;
  getProviders(): STTProvider[];
  getSupportedLanguages(provider: STTProvider): Language[];
}

// ─── TTS ──────────────────────────────────────────────────────────────────────

export type TTSProvider =
  | 'kokoro'
  | 'piper'
  | 'mizuone'
  | 'elevenlabs'
  | 'azure-speech'
  | 'google-tts'
  | 'openai-tts'
  | 'coqui-tts'
  | 'edge-tts';

export interface TTSConfig {
  provider: TTSProvider;
  model?: string;
  voice?: string;
  language?: Language;
  speed?: number;
  pitch?: number;
  volume?: number;
  emotion?: VoiceEmotion;
  format?: AudioFormat;
}

export interface TTSResult {
  audio: AudioBuffer;
  text: string;
  voice: string;
  provider: TTSProvider;
  durationMs: number;
  latencyMs: number;
  tokensUsed: number;
}

export interface VoiceInfo {
  id: string;
  name: string;
  gender: VoiceGender;
  language: Language;
  preview?: string;
  styles?: string[];
}

export interface TTSEngine {
  synthesize(text: string, config?: TTSConfig): Promise<TTSResult>;
  synthesizeStream(text: string, config?: TTSConfig): AsyncIterable<AudioChunk>;
  getProviders(): TTSProvider[];
  getVoices(provider: TTSProvider, language?: Language): VoiceInfo[];
}

// ─── Voice Router ─────────────────────────────────────────────────────────────

export interface VoiceRouterConfig {
  autoSelect: boolean;
  fallbackProvider: STTProvider;
  ttsFallback: TTSProvider;
  maxLatencyMs: number;
  qualityWeight: number;
  costWeight: number;
}

export interface VoiceRoute {
  sttProvider: STTProvider;
  ttsProvider: TTSProvider;
  voice: string;
  language: Language;
  speed: number;
  emotion: VoiceEmotion;
  reason: string;
}

export interface VoiceRouteRequest {
  text?: string;
  audio?: AudioBuffer;
  language?: Language;
  emotion?: VoiceEmotion;
  userId?: string;
  context?: Record<string, unknown>;
}

export interface VoiceRouter {
  route(request: VoiceRouteRequest): Promise<VoiceRoute>;
  getRoutes(): VoiceRoute[];
  addRoute(route: VoiceRoute): void;
  removeRoute(id: string): void;
}

// ─── Wake Word ────────────────────────────────────────────────────────────────

export interface WakeWordConfig {
  words: string[];
  sensitivity: number;
  timeout: number;
  continuous: boolean;
}

export interface WakeWordResult {
  detected: boolean;
  word: string;
  confidence: number;
  timestamp: Date;
}

export interface WakeWordEngine {
  start(config: WakeWordConfig): Promise<void>;
  stop(): Promise<void>;
  addWord(word: string): void;
  removeWord(word: string): void;
  isListening(): boolean;
  onDetection(callback: (result: WakeWordResult) => void): void;
}

// ─── Streaming ────────────────────────────────────────────────────────────────

export interface StreamingConfig {
  mode: DuplexMode;
  bufferSize: number;
  sampleRate: number;
  channels: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface StreamingSession {
  id: string;
  mode: DuplexMode;
  startedAt: Date;
  status: 'active' | 'paused' | 'ended';
  chunksProcessed: number;
}

export interface StreamingEngine {
  startSession(config: StreamingConfig): Promise<StreamingSession>;
  endSession(sessionId: string): Promise<void>;
  sendAudio(sessionId: string, chunk: AudioChunk): Promise<void>;
  onAudio(callback: (chunk: AudioChunk) => void, sessionId: string): void;
  getSession(sessionId: string): StreamingSession | null;
  getActiveSessions(): StreamingSession[];
}

// ─── Conversation ─────────────────────────────────────────────────────────────

export interface ConversationTurn {
  id: string;
  role: SpeakerRole;
  content: string;
  timestamp: Date;
  emotion?: VoiceEmotion;
  language?: Language;
  metadata: Record<string, unknown>;
}

export interface ConversationSession {
  id: string;
  turns: ConversationTurn[];
  startedAt: Date;
  lastActivity: Date;
  userId?: string;
  language: Language;
  personality?: string;
  status: 'active' | 'paused' | 'ended';
}

export interface ConversationConfig {
  maxTurns: number;
  timeout: number;
  language: Language;
  personality?: string;
  memoryEnabled: boolean;
}

export interface ConversationEngine {
  startSession(config: ConversationConfig): Promise<ConversationSession>;
  addTurn(
    sessionId: string,
    turn: Omit<ConversationTurn, 'id' | 'timestamp'>,
  ): Promise<ConversationTurn>;
  getSession(sessionId: string): ConversationSession | null;
  endSession(sessionId: string): Promise<void>;
  getHistory(sessionId: string): ConversationTurn[];
  getActiveSessions(): ConversationSession[];
}

// ─── Emotion Engine ───────────────────────────────────────────────────────────

export interface EmotionDetection {
  emotion: VoiceEmotion;
  confidence: number;
  valence: number;
  arousal: number;
}

export interface EmotionProfile {
  dominant: VoiceEmotion;
  emotions: EmotionDetection[];
  mood: string;
  energy: number;
}

export interface EmotionEngine {
  detect(text: string, audio?: AudioBuffer): Promise<EmotionDetection[]>;
  getProfile(text: string): Promise<EmotionProfile>;
  adaptResponse(text: string, emotion: VoiceEmotion): string;
  getEmotions(): VoiceEmotion[];
  getEmotionDescription(emotion: VoiceEmotion): string;
}

// ─── Voice Profiles ───────────────────────────────────────────────────────────

export type VoiceProfilePreset =
  | 'jarbas'
  | 'sexta-feira'
  | 'professor'
  | 'narrador'
  | 'infantil'
  | 'executivo'
  | 'mentor'
  | 'coach'
  | 'psicologo';

export interface VoiceProfile {
  id: string;
  name: string;
  gender: VoiceGender;
  language: Language;
  speed: number;
  pitch: number;
  volume: number;
  emotion: VoiceEmotion;
  pauses: number;
  breathing: boolean;
  intonation: string;
  style: string;
  voice: string;
  provider: TTSProvider;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface VoiceProfiles {
  create(
    profile: Omit<VoiceProfile, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<VoiceProfile>;
  get(profileId: string): Promise<VoiceProfile | null>;
  update(
    profileId: string,
    updates: Partial<VoiceProfile>,
  ): Promise<VoiceProfile>;
  delete(profileId: string): Promise<void>;
  list(): Promise<VoiceProfile[]>;
  getDefault(): Promise<VoiceProfile | null>;
  setDefault(profileId: string): Promise<void>;
  getPreset(preset: VoiceProfilePreset): VoiceProfile;
  getPresets(): VoiceProfilePreset[];
}

// ─── Voice Memory ─────────────────────────────────────────────────────────────

export interface VoiceInteraction {
  id: string;
  timestamp: Date;
  type: 'speech' | 'text' | 'command';
  input: string;
  output: string;
  durationMs: number;
  emotion?: VoiceEmotion;
  language: Language;
  success: boolean;
}

export interface VoiceMemoryEntry {
  id: string;
  userId: string;
  profileId?: string;
  preferredLanguage: Language;
  preferredSpeed: number;
  preferredVoice: string;
  activePersonality: string;
  history: VoiceInteraction[];
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoiceMemory {
  get(userId: string): Promise<VoiceMemoryEntry | null>;
  save(
    entry: Omit<VoiceMemoryEntry, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<VoiceMemoryEntry>;
  update(
    userId: string,
    updates: Partial<VoiceMemoryEntry>,
  ): Promise<VoiceMemoryEntry>;
  addInteraction(
    userId: string,
    interaction: Omit<VoiceInteraction, 'id' | 'timestamp'>,
  ): Promise<VoiceInteraction>;
  getHistory(userId: string, limit?: number): Promise<VoiceInteraction[]>;
  delete(userId: string): Promise<void>;
}

// ─── Audio Processing ─────────────────────────────────────────────────────────

export interface AudioProcessingConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  normalize: boolean;
  trimSilence: boolean;
  silenceThreshold: number;
  silenceDuration: number;
}

export interface AudioProcessingResult {
  processed: AudioBuffer;
  originalDurationMs: number;
  processedDurationMs: number;
  trimmedMs: number;
  normalized: boolean;
}

export interface AudioProcessing {
  process(
    audio: AudioBuffer,
    config?: AudioProcessingConfig,
  ): Promise<AudioProcessingResult>;
  normalize(audio: AudioBuffer): AudioBuffer;
  trimSilence(audio: AudioBuffer, threshold?: number): AudioBuffer;
  convertFormat(audio: AudioBuffer, format: AudioFormat): AudioBuffer;
  getDuration(audio: AudioBuffer): number;
  mix(audios: AudioBuffer[]): AudioBuffer;
}

// ─── Noise Reduction ──────────────────────────────────────────────────────────

export interface NoiseReductionConfig {
  enabled: boolean;
  aggressiveness: number;
  echoCancellation: boolean;
  voiceIsolation: boolean;
  gainControl: boolean;
  silenceDetection: boolean;
  silenceThreshold: number;
}

export interface NoiseReductionResult {
  processed: AudioBuffer;
  noiseLevel: number;
  signalToNoiseRatio: number;
  suppressedDb: number;
}

export interface SilenceSegment {
  start: number;
  end: number;
}

export interface NoiseReduction {
  process(
    audio: AudioBuffer,
    config?: NoiseReductionConfig,
  ): Promise<NoiseReductionResult>;
  getNoiseLevel(audio: AudioBuffer): number;
  detectSilence(audio: AudioBuffer, threshold?: number): SilenceSegment[];
  applyGain(audio: AudioBuffer, gain: number): AudioBuffer;
}

// ─── Language Engine ──────────────────────────────────────────────────────────

export interface LanguageDetection {
  language: Language;
  confidence: number;
}

export interface LanguageProfile {
  language: Language;
  nativeName: string;
  englishName: string;
  code: string;
  scripts: string[];
  direction: 'ltr' | 'rtl';
}

export interface LanguageEngine {
  detect(text: string): Promise<LanguageDetection[]>;
  getProfile(language: Language): LanguageProfile;
  getSupportedLanguages(): Language[];
  isSupported(language: Language): boolean;
  getLanguageName(code: Language, inLanguage?: Language): string;
}

// ─── Translation ──────────────────────────────────────────────────────────────

export interface TranslationConfig {
  sourceLanguage: Language;
  targetLanguage: Language;
  model?: string;
  preserveFormatting: boolean;
  formal: boolean;
}

export interface TranslationResult {
  translated: string;
  source: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  confidence: number;
  latencyMs: number;
}

export interface LanguagePair {
  source: Language;
  target: Language;
}

export interface TranslationEngine {
  translate(text: string, config: TranslationConfig): Promise<TranslationResult>;
  translateBatch(
    texts: string[],
    config: TranslationConfig,
  ): Promise<TranslationResult[]>;
  getSupportedPairs(): LanguagePair[];
}

// ─── Synthesis ────────────────────────────────────────────────────────────────

export interface SynthesisPause {
  position: number;
  duration: number;
}

export interface SynthesisConfig {
  voice: string;
  speed: number;
  pitch: number;
  emotion: VoiceEmotion;
  emphasis: string[];
  pauses: SynthesisPause[];
}

export interface SynthesisResult {
  audio: AudioBuffer;
  text: string;
  durationMs: number;
  prosody: Record<string, unknown>;
}

export interface SynthesisEngine {
  synthesize(text: string, config: SynthesisConfig): Promise<SynthesisResult>;
  adjustProsody(
    audio: AudioBuffer,
    prosody: Record<string, unknown>,
  ): AudioBuffer;
  addBreathing(audio: AudioBuffer, rate: number): AudioBuffer;
  addPause(audio: AudioBuffer, positionMs: number, durationMs: number): AudioBuffer;
}

// ─── Diarization ──────────────────────────────────────────────────────────────

export interface SpeakerSegment {
  speakerId: string;
  startMs: number;
  endMs: number;
  confidence: number;
  text?: string;
  emotion?: VoiceEmotion;
}

export interface SpeakerProfile {
  id: string;
  name?: string;
  gender?: VoiceGender;
  totalSpeakingMs: number;
  segmentCount: number;
  averageConfidence: number;
}

export interface DiarizationResult {
  segments: SpeakerSegment[];
  speakerCount: number;
  durationMs: number;
  speakers: SpeakerProfile[];
}

export interface Diarization {
  diarize(
    audio: AudioBuffer,
    numSpeakers?: number,
  ): Promise<DiarizationResult>;
  identifySpeaker(
    audio: AudioBuffer,
    profiles: SpeakerProfile[],
  ): Promise<SpeakerProfile | null>;
  mergeSegments(segments: SpeakerSegment[]): SpeakerSegment[];
}

// ─── Audio Cache ──────────────────────────────────────────────────────────────

export interface AudioCacheEntry {
  id: string;
  text: string;
  voice: string;
  language: Language;
  audio: AudioBuffer;
  config: TTSConfig;
  sizeBytes: number;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
}

export interface AudioCacheStats {
  entries: number;
  totalSizeBytes: number;
  hitRate: number;
}

export interface AudioCache {
  get(
    text: string,
    voice: string,
    language: Language,
  ): Promise<AudioCacheEntry | null>;
  set(
    text: string,
    voice: string,
    language: Language,
    audio: AudioBuffer,
    config: TTSConfig,
  ): Promise<AudioCacheEntry>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  getStats(): AudioCacheStats;
  prune(maxAge?: number): Promise<number>;
}

// ─── Monitoring ───────────────────────────────────────────────────────────────

export interface VoiceError {
  id: string;
  timestamp: Date;
  module: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface VoiceMetrics {
  totalRequests: number;
  sttLatencyMs: number;
  ttsLatencyMs: number;
  endToEndLatencyMs: number;
  totalAudioProcessedMs: number;
  activeSessions: number;
  errorRate: number;
  averageConfidence: number;
  languagesUsed: Language[];
  providersUsed: string[];
  cacheHitRate: number;
  totalTokensUsed: number;
  estimatedCostUsd: number;
}

export interface VoiceDashboard {
  metrics: VoiceMetrics;
  uptime: number;
  status: 'healthy' | 'degraded' | 'down';
  recentErrors: VoiceError[];
  topLanguages: { language: Language; count: number }[];
  topVoices: { voice: string; count: number }[];
}

export interface MonitoringEngine {
  recordMetric(
    name: string,
    value: number,
    labels?: Record<string, string>,
  ): void;
  getMetrics(): VoiceMetrics;
  getDashboard(): VoiceDashboard;
  recordError(error: Omit<VoiceError, 'id' | 'timestamp'>): void;
  reset(): void;
}

// ─── Voice Engine Config ──────────────────────────────────────────────────────

export interface VoiceEngineConfig {
  defaultLanguage: Language;
  defaultVoice: string;
  defaultTTSProvider: TTSProvider;
  defaultSTTProvider: STTProvider;
  defaultSpeed: number;
  defaultPitch: number;
  defaultVolume: number;
  streamingMode: DuplexMode;
  maxConcurrentSessions: number;
  cacheEnabled: boolean;
  monitoringEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
