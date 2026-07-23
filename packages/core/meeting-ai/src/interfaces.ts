// ─── Common ───────────────────────────────────────────────────────────────────

export type MeetingType = 'presencial' | 'online' | 'hibrido';
export type MeetingStatus = 'agendada' | 'em_andamento' | 'processando' | 'concluida' | 'cancelada';
export type AudioSource = 'microfone' | 'desktop' | 'browser' | 'zoom' | 'teams' | 'meet' | 'discord' | 'slack' | 'arquivo';
export type ExportFormat = 'pdf' | 'docx' | 'markdown' | 'txt' | 'json' | 'csv';
export type TranscriptVersion = 'completa' | 'limpa' | 'resumida' | 'executiva' | 'tecnica' | 'cronologica';
export type SummaryLevel = '30s' | '2min' | 'executivo' | 'tecnico' | 'por_participante' | 'por_assunto' | 'por_projeto';
export type Severity = 'baixa' | 'media' | 'alta' | 'critica';
export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type SentimentLabel = 'entusiasmo' | 'concordancia' | 'discordancia' | 'urgencia' | 'neutro';
export type CalendarProvider = 'google' | 'outlook' | 'apple';
export type CRMProvider = 'hubspot' | 'salesforce' | 'pipedrive';
export type ProjectProvider = 'github' | 'jira' | 'trello' | 'kanban';
export type EmailType = 'ata' | 'resumo' | 'follow_up' | 'pendencias' | 'proxima_reuniao';
export type PermissionAction = 'gravar' | 'transcrever' | 'exportar' | 'compartilhar' | 'excluir';

export interface MeetingEvent {
  type: string;
  meetingId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

// ─── Meeting Controller ───────────────────────────────────────────────────────

export interface Participant {
  id: string;
  name: string;
  email?: string;
  role?: string;
  company?: string;
  isHost: boolean;
}

export interface MeetingConfig {
  title: string;
  type: MeetingType;
  participants: Participant[];
  sources: AudioSource[];
  language: string;
  autoTranscribe: boolean;
  autoSummarize: boolean;
  autoExtractTasks: boolean;
  recordingConsent: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  status: MeetingStatus;
  participants: Participant[];
  sources: AudioSource[];
  language: string;
  startedAt: Date;
  endedAt?: Date;
  durationMs: number;
  transcriptId?: string;
  summaryId?: string;
  metadata: Record<string, unknown>;
}

export interface MeetingController {
  startMeeting(config: MeetingConfig): Promise<Meeting>;
  endMeeting(meetingId: string): Promise<Meeting>;
  getMeeting(meetingId: string): Meeting | null;
  listMeetings(limit?: number): Meeting[];
  updateMeeting(meetingId: string, updates: Partial<Meeting>): Promise<Meeting>;
  deleteMeeting(meetingId: string): Promise<void>;
}

// ─── Audio Capture ────────────────────────────────────────────────────────────

export interface AudioChunk {
  meetingId: string;
  source: AudioSource;
  data: Buffer;
  sampleRate: number;
  channels: number;
  timestamp: Date;
  durationMs: number;
  sequenceNumber: number;
}

export interface CaptureConfig {
  sources: AudioSource[];
  sampleRate: number;
  channels: number;
  bufferSize: number;
  noiseSuppression: boolean;
  echoCancellation: boolean;
}

export interface AudioCapture {
  startCapture(meetingId: string, config: CaptureConfig): Promise<void>;
  stopCapture(meetingId: string): Promise<void>;
  onAudio(callback: (chunk: AudioChunk) => void): void;
  getActiveCaptures(): string[];
  isCapturing(meetingId: string): boolean;
}

// ─── Speech To Text ───────────────────────────────────────────────────────────

export type STTProvider = 'whisper' | 'faster-whisper' | 'deepgram' | 'azure-speech' | 'google-speech';

export interface STTConfig {
  provider: STTProvider;
  model?: string;
  language: string;
  apiKey?: string;
}

export interface TranscriptionSegment {
  id: string;
  speakerId: string;
  text: string;
  startMs: number;
  endMs: number;
  confidence: number;
  words: WordTiming[];
}

export interface WordTiming {
  word: string;
  startMs: number;
  endMs: number;
  confidence: number;
}

export interface SpeechToText {
  transcribe(audioChunks: AudioChunk[], config: STTConfig): Promise<TranscriptionSegment[]>;
  transcribeStream(audioChunk: AudioChunk, config: STTConfig): AsyncIterable<Partial<TranscriptionSegment>>;
  getProviders(): STTProvider[];
}

// ─── Speaker Diarization ──────────────────────────────────────────────────────

export interface Speaker {
  id: string;
  name?: string;
  totalSpeakingMs: number;
  segmentCount: number;
  averageConfidence: number;
}

export interface SpeakerSegment {
  speakerId: string;
  startMs: number;
  endMs: number;
  confidence: number;
}

export interface DiarizationResult {
  speakers: Speaker[];
  segments: SpeakerSegment[];
  speakerCount: number;
}

export interface SpeakerDiarization {
  diarize(audioChunks: AudioChunk[], numSpeakers?: number): Promise<DiarizationResult>;
  identifySpeaker(name: string, audioChunks: AudioChunk[]): Promise<void>;
  getSpeakers(meetingId: string): Speaker[];
}

// ─── Meeting Memory ───────────────────────────────────────────────────────────

export interface MemoryEntry {
  meetingId: string;
  participants: Participant[];
  projects: string[];
  topics: string[];
  decisions: string[];
  actions: string[];
  files: string[];
  relationships: Record<string, string[]>;
}

export interface MeetingMemory {
  save(entry: MemoryEntry): Promise<void>;
  get(meetingId: string): MemoryEntry | null;
  search(query: string): MemoryEntry[];
  linkMeetings(id1: string, id2: string): Promise<void>;
  getRelatedMeetings(meetingId: string): string[];
}

// ─── Transcript Engine ────────────────────────────────────────────────────────

export interface Transcript {
  id: string;
  meetingId: string;
  version: TranscriptVersion;
  segments: TranscriptionSegment[];
  text: string;
  createdAt: Date;
}

export interface TranscriptEngine {
  generateFull(meetingId: string, segments: TranscriptionSegment[]): Promise<Transcript>;
  generateClean(meetingId: string, segments: TranscriptionSegment[]): Promise<Transcript>;
  generateSummary(meetingId: string, segments: TranscriptionSegment[]): Promise<Transcript>;
  generateExecutive(meetingId: string, segments: TranscriptionSegment[]): Promise<Transcript>;
  generateTechnical(meetingId: string, segments: TranscriptionSegment[]): Promise<Transcript>;
  generateChronological(meetingId: string, segments: TranscriptionSegment[]): Promise<Transcript>;
  getTranscript(transcriptId: string): Transcript | null;
  getTranscriptsByMeeting(meetingId: string): Transcript[];
}

// ─── Summarizer ───────────────────────────────────────────────────────────────

export interface Summary {
  id: string;
  meetingId: string;
  level: SummaryLevel;
  content: string;
  keyPoints: string[];
  createdAt: Date;
}

export interface Summarizer {
  generate(transcript: Transcript, level: SummaryLevel): Promise<Summary>;
  generateAll(transcript: Transcript): Promise<Summary[]>;
  getSummary(summaryId: string): Summary | null;
  getSummariesByMeeting(meetingId: string): Summary[];
}

// ─── Action Extractor ─────────────────────────────────────────────────────────

export type ExtractedEntityType = 'decisao' | 'pendencia' | 'ideia' | 'problema' | 'risco' | 'cliente' | 'empresa' | 'data' | 'valor' | 'prazo';

export interface ExtractedEntity {
  type: ExtractedEntityType;
  value: string;
  context: string;
  confidence: number;
  speakerId?: string;
  startMs?: number;
}

export interface ActionExtractor {
  extract(segments: TranscriptionSegment[]): Promise<ExtractedEntity[]>;
  getByType(entities: ExtractedEntity[], type: ExtractedEntityType): ExtractedEntity[];
  getEntitiesByMeeting(meetingId: string): ExtractedEntity[];
}

// ─── Decision Engine ──────────────────────────────────────────────────────────

export interface Decision {
  id: string;
  meetingId: string;
  description: string;
  decidedBy: string;
  decidedAt: Date;
  reason: string;
  impact: string;
  adrId?: string;
  relatedEntities: string[];
}

export interface DecisionEngine {
  record(decision: Omit<Decision, 'id'>): Promise<Decision>;
  getDecision(decisionId: string): Decision | null;
  getByMeeting(meetingId: string): Decision[];
  linkADR(decisionId: string, adrId: string): Promise<void>;
  getAll(): Decision[];
}

// ─── Task Generator ───────────────────────────────────────────────────────────

export interface GeneratedTask {
  id: string;
  meetingId: string;
  title: string;
  description: string;
  assignee?: string;
  deadline?: Date;
  priority: Priority;
  source: string;
  createdAt: Date;
  status: 'pendente' | 'em_progresso' | 'concluida';
}

export interface TaskGenerator {
  generateFromEntities(entities: ExtractedEntity[], meetingId: string): Promise<GeneratedTask[]>;
  generateFromText(text: string, meetingId: string): Promise<GeneratedTask[]>;
  getTask(taskId: string): GeneratedTask | null;
  getByMeeting(meetingId: string): GeneratedTask[];
  updateStatus(taskId: string, status: GeneratedTask['status']): Promise<GeneratedTask>;
}

// ─── Follow-up Engine ─────────────────────────────────────────────────────────

export interface FollowUp {
  id: string;
  meetingId: string;
  type: EmailType;
  recipients: string[];
  subject: string;
  content: string;
  sendAt?: Date;
  sent: boolean;
  createdAt: Date;
}

export interface FollowUpEngine {
  generateFollowUp(meetingId: string): Promise<FollowUp>;
  generatePendencias(meetingId: string): Promise<FollowUp>;
  generateProximaReuniao(meetingId: string): Promise<FollowUp>;
  scheduleFollowUp(followUp: FollowUp, sendAt: Date): Promise<FollowUp>;
  getFollowUpsByMeeting(meetingId: string): FollowUp[];
}

// ─── Calendar Sync ────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  meetingId: string;
  title: string;
  start: Date;
  end: Date;
  participants: string[];
  description?: string;
  provider: CalendarProvider;
}

export interface CalendarSync {
  createEvent(meeting: Meeting): Promise<CalendarEvent>;
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteEvent(eventId: string): Promise<void>;
  getEvents(start: Date, end: Date): Promise<CalendarEvent[]>;
  sync(): Promise<void>;
}

// ─── CRM Sync ─────────────────────────────────────────────────────────────────

export interface CRMContact {
  id: string;
  name: string;
  email?: string;
  company?: string;
  meetingIds: string[];
}

export interface CRMDeal {
  id: string;
  name: string;
  contactId: string;
  stage: string;
  value?: number;
  meetingIds: string[];
}

export interface CRMSync {
  updateContact(contact: CRMContact): Promise<void>;
  updateDeal(deal: CRMDeal): Promise<void>;
  addMeetingNote(meetingId: string, contactId: string, note: string): Promise<void>;
  getContacts(): Promise<CRMContact[]>;
  getDeals(): Promise<CRMDeal[]>;
  sync(): Promise<void>;
}

// ─── Project Sync ─────────────────────────────────────────────────────────────

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: string;
  assignee?: string;
  project: string;
  meetingId: string;
  provider: ProjectProvider;
}

export interface ProjectSync {
  createTask(task: ProjectTask): Promise<void>;
  updateTask(taskId: string, updates: Partial<ProjectTask>): Promise<void>;
  getTasks(project: string): Promise<ProjectTask[]>;
  sync(): Promise<void>;
}

// ─── Email Generator ──────────────────────────────────────────────────────────

export interface GeneratedEmail {
  id: string;
  meetingId: string;
  type: EmailType;
  to: string[];
  subject: string;
  body: string;
  format: 'plain' | 'html';
  createdAt: Date;
}

export interface EmailGenerator {
  generateAta(meetingId: string, transcript: Transcript): Promise<GeneratedEmail>;
  generateResumo(meetingId: string, summary: Summary): Promise<GeneratedEmail>;
  generateFollowUp(meetingId: string, tasks: GeneratedTask[]): Promise<GeneratedEmail>;
  generatePendencias(meetingId: string, entities: ExtractedEntity[]): Promise<GeneratedEmail>;
  generateProximaReuniao(meetingId: string, nextDate: Date): Promise<GeneratedEmail>;
}

// ─── Document Generator ───────────────────────────────────────────────────────

export interface GeneratedDocument {
  id: string;
  meetingId: string;
  title: string;
  format: ExportFormat;
  content: string;
  sizeBytes: number;
  createdAt: Date;
}

export interface DocumentGenerator {
  generatePDF(meetingId: string, content: string, title: string): Promise<GeneratedDocument>;
  generateDOCX(meetingId: string, content: string, title: string): Promise<GeneratedDocument>;
  generateMarkdown(meetingId: string, content: string, title: string): Promise<GeneratedDocument>;
  generateHTML(meetingId: string, content: string, title: string): Promise<GeneratedDocument>;
  generateJSON(meetingId: string, data: Record<string, unknown>): Promise<GeneratedDocument>;
  generateCSV(meetingId: string, data: Record<string, unknown>[]): Promise<GeneratedDocument>;
}

// ─── Realtime Stream ──────────────────────────────────────────────────────────

export interface StreamEvent {
  type: 'transcript' | 'diarization' | 'entity' | 'decision' | 'task' | 'sentiment' | 'error';
  meetingId: string;
  timestamp: Date;
  data: unknown;
}

export interface RealtimeStream {
  subscribe(meetingId: string, callback: (event: StreamEvent) => void): void;
  unsubscribe(meetingId: string, callback: (event: StreamEvent) => void): void;
  broadcast(event: StreamEvent): void;
  getSubscribers(meetingId: string): number;
}

// ─── Sentiment Analysis ───────────────────────────────────────────────────────

export interface SentimentResult {
  label: SentimentLabel;
  confidence: number;
  context: string;
  speakerId?: string;
  startMs?: number;
}

export interface MeetingSentiment {
  overall: SentimentLabel;
  score: number;
  results: SentimentResult[];
  climate: string;
}

export interface SentimentAnalysis {
  analyze(segments: TranscriptionSegment[]): Promise<MeetingSentiment>;
  analyzeSegment(segment: TranscriptionSegment): Promise<SentimentResult>;
  getSentimentBySpeaker(segments: TranscriptionSegment[], speakerId: string): Promise<SentimentResult[]>;
}

// ─── Meeting Analytics ────────────────────────────────────────────────────────

export interface ParticipantStats {
  speakerId: string;
  speakingTimeMs: number;
  interventionCount: number;
  averageConfidence: number;
}

export interface TopicStats {
  topic: string;
  durationMs: number;
  mentions: number;
}

export interface MeetingAnalytics {
  totalDurationMs: number;
  participantStats: ParticipantStats[];
  topicStats: TopicStats[];
  totalTasks: number;
  totalDecisions: number;
  totalTopics: number;
  participationBalance: number;
}

export interface MeetingAnalyticsEngine {
  calculate(segments: TranscriptionSegment[], entities: ExtractedEntity[], decisions: Decision[], tasks: GeneratedTask[]): MeetingAnalytics;
  getParticipantStats(segments: TranscriptionSegment[]): ParticipantStats[];
  getTopicStats(entities: ExtractedEntity[]): TopicStats[];
}

// ─── Timeline Engine ──────────────────────────────────────────────────────────

export interface TimelineEntry {
  time: Date;
  offsetMs: number;
  title: string;
  description: string;
  speakerId?: string;
  type: 'topic_change' | 'decision' | 'action' | 'important';
}

export interface Timeline {
  id: string;
  meetingId: string;
  entries: TimelineEntry[];
  createdAt: Date;
}

export interface TimelineEngine {
  generate(segments: TranscriptionSegment[], entities: ExtractedEntity[]): Timeline;
  getTimeline(meetingId: string): Timeline | null;
  addEntry(meetingId: string, entry: Omit<TimelineEntry, 'offsetMs'>): void;
}

// ─── Recording Manager ────────────────────────────────────────────────────────

export interface Recording {
  id: string;
  meetingId: string;
  filePath: string;
  format: string;
  sizeBytes: number;
  durationMs: number;
  createdAt: Date;
  encrypted: boolean;
}

export interface RecordingManager {
  startRecording(meetingId: string): Promise<Recording>;
  stopRecording(meetingId: string): Promise<Recording>;
  getRecording(meetingId: string): Recording | null;
  deleteRecording(recordingId: string): Promise<void>;
  getRecordings(): Recording[];
}

// ─── Permission Manager ───────────────────────────────────────────────────────

export interface Permission {
  userId: string;
  meetingId: string;
  action: PermissionAction;
  granted: boolean;
  grantedAt?: Date;
}

export interface ConsentRecord {
  userId: string;
  meetingId: string;
  consented: boolean;
  timestamp: Date;
  ipAddress?: string;
}

export interface PermissionManager {
  checkPermission(userId: string, meetingId: string, action: PermissionAction): boolean;
  grantPermission(userId: string, meetingId: string, action: PermissionAction): void;
  revokePermission(userId: string, meetingId: string, action: PermissionAction): void;
  recordConsent(consent: ConsentRecord): void;
  getConsent(meetingId: string): ConsentRecord[];
  hasConsent(meetingId: string, userId: string): boolean;
}

// ─── Monitoring ───────────────────────────────────────────────────────────────

export interface MeetingMetrics {
  totalMeetings: number;
  totalDurationMs: number;
  totalTranscriptions: number;
  totalSummaries: number;
  totalTasksGenerated: number;
  totalDecisionsRecorded: number;
  averageMeetingDurationMs: number;
  errorRate: number;
  avgLatencyMs: number;
}

export interface MeetingDashboard {
  metrics: MeetingMetrics;
  uptime: number;
  status: 'healthy' | 'degraded' | 'down';
  recentErrors: MeetingError[];
}

export interface MeetingError {
  id: string;
  timestamp: Date;
  module: string;
  message: string;
  severity: Severity;
}

export interface MonitoringEngine {
  recordMetric(name: string, value: number): void;
  recordError(error: Omit<MeetingError, 'id' | 'timestamp'>): void;
  getMetrics(): MeetingMetrics;
  getDashboard(): MeetingDashboard;
  reset(): void;
}

// ─── Meeting AI Config ────────────────────────────────────────────────────────

export interface MeetingAIConfig {
  defaultLanguage: string;
  defaultSTTProvider: STTProvider;
  autoTranscribe: boolean;
  autoSummarize: boolean;
  autoExtractTasks: boolean;
  autoExtractDecisions: boolean;
  maxConcurrentMeetings: number;
  recordingEnabled: boolean;
  retentionDays: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
