import type {
  MeetingAIConfig,
  MeetingConfig,
  Meeting,
  Transcript,
  Summary,
  GeneratedTask,
  Decision,
  ExtractedEntity,
  MeetingAnalytics,
  Timeline,
  GeneratedDocument,
  MeetingSentiment,
} from './interfaces.js';
import { MeetingController } from './MeetingController.js';
import { AudioCapture } from './AudioCapture.js';
import { SpeechToText } from './SpeechToText.js';
import { SpeakerDiarization } from './SpeakerDiarization.js';
import { MeetingMemory } from './MeetingMemory.js';
import { TranscriptEngine } from './TranscriptEngine.js';
import { Summarizer } from './Summarizer.js';
import { ActionExtractor } from './ActionExtractor.js';
import { DecisionEngine } from './DecisionEngine.js';
import { TaskGenerator } from './TaskGenerator.js';
import { FollowUpEngine } from './FollowUpEngine.js';
import { CalendarSync } from './CalendarSync.js';
import { CRMSync } from './CRMSync.js';
import { ProjectSync } from './ProjectSync.js';
import { EmailGenerator } from './EmailGenerator.js';
import { DocumentGenerator } from './DocumentGenerator.js';
import { RealtimeStream } from './RealtimeStream.js';
import { SentimentAnalysis } from './SentimentAnalysis.js';
import { MeetingAnalyticsEngine } from './MeetingAnalytics.js';
import { TimelineEngine } from './TimelineEngine.js';
import { RecordingManager } from './RecordingManager.js';
import { PermissionManager } from './PermissionManager.js';
import { MonitoringEngine } from './Monitoring.js';

const DEFAULT_CONFIG: MeetingAIConfig = {
  defaultLanguage: 'pt',
  defaultSTTProvider: 'whisper',
  autoTranscribe: true,
  autoSummarize: true,
  autoExtractTasks: true,
  autoExtractDecisions: true,
  maxConcurrentMeetings: 5,
  recordingEnabled: true,
  retentionDays: 365,
  logLevel: 'info',
};

export class MeetingAI {
  readonly controller: MeetingController;
  readonly audioCapture: AudioCapture;
  readonly speechToText: SpeechToText;
  readonly diarization: SpeakerDiarization;
  readonly memory: MeetingMemory;
  readonly transcriptEngine: TranscriptEngine;
  readonly summarizer: Summarizer;
  readonly actionExtractor: ActionExtractor;
  readonly decisionEngine: DecisionEngine;
  readonly taskGenerator: TaskGenerator;
  readonly followUpEngine: FollowUpEngine;
  readonly calendarSync: CalendarSync;
  readonly crmSync: CRMSync;
  readonly projectSync: ProjectSync;
  readonly emailGenerator: EmailGenerator;
  readonly documentGenerator: DocumentGenerator;
  readonly realtimeStream: RealtimeStream;
  readonly sentimentAnalysis: SentimentAnalysis;
  readonly analyticsEngine: MeetingAnalyticsEngine;
  readonly timelineEngine: TimelineEngine;
  readonly recordingManager: RecordingManager;
  readonly permissionManager: PermissionManager;
  readonly monitoring: MonitoringEngine;
  private config: MeetingAIConfig;

  constructor(config?: Partial<MeetingAIConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.controller = new MeetingController();
    this.audioCapture = new AudioCapture();
    this.speechToText = new SpeechToText();
    this.diarization = new SpeakerDiarization();
    this.memory = new MeetingMemory();
    this.transcriptEngine = new TranscriptEngine();
    this.summarizer = new Summarizer();
    this.actionExtractor = new ActionExtractor();
    this.decisionEngine = new DecisionEngine();
    this.taskGenerator = new TaskGenerator();
    this.followUpEngine = new FollowUpEngine();
    this.calendarSync = new CalendarSync();
    this.crmSync = new CRMSync();
    this.projectSync = new ProjectSync();
    this.emailGenerator = new EmailGenerator();
    this.documentGenerator = new DocumentGenerator();
    this.realtimeStream = new RealtimeStream();
    this.sentimentAnalysis = new SentimentAnalysis();
    this.analyticsEngine = new MeetingAnalyticsEngine();
    this.timelineEngine = new TimelineEngine();
    this.recordingManager = new RecordingManager();
    this.permissionManager = new PermissionManager();
    this.monitoring = new MonitoringEngine();
  }

  async startMeeting(config: MeetingConfig): Promise<Meeting> {
    this.monitoring.recordMetric('totalMeetings', 1);
    return this.controller.startMeeting(config);
  }

  async endMeeting(meetingId: string): Promise<Meeting> {
    return this.controller.endMeeting(meetingId);
  }

  async processMeeting(meetingId: string): Promise<{
    transcript: Transcript;
    summary: Summary;
    tasks: GeneratedTask[];
    decisions: Decision[];
    entities: ExtractedEntity[];
    analytics: MeetingAnalytics;
    sentiment: MeetingSentiment;
    timeline: Timeline;
  }> {
    const segments = await this.speechToText.transcribe([], { provider: this.config.defaultSTTProvider, language: this.config.defaultLanguage });

    const transcript = await this.transcriptEngine.generateFull(meetingId, segments);
    const summary = await this.summarizer.generate(transcript, 'executivo');
    const entities = await this.actionExtractor.extract(segments);
    const tasks = await this.taskGenerator.generateFromEntities(entities, meetingId);

    const decisions: Decision[] = [];
    const decisionEntities = entities.filter(e => e.type === 'decisao');
    for (const entity of decisionEntities) {
      const d = await this.decisionEngine.record({
        meetingId,
        description: entity.value,
        decidedBy: entity.speakerId ?? 'unknown',
        decidedAt: new Date(),
        reason: entity.context,
        impact: 'medium',
        relatedEntities: [],
      });
      decisions.push(d);
    }

    const analytics = this.analyticsEngine.calculate(segments, entities, decisions, tasks);
    const sentiment = await this.sentimentAnalysis.analyze(segments);
    const timeline = this.timelineEngine.generate(segments, entities);

    await this.memory.save({
      meetingId,
      participants: [],
      projects: [],
      topics: entities.map(e => e.value),
      decisions: decisions.map(d => d.description),
      actions: tasks.map(t => t.title),
      files: [],
      relationships: {},
    });

    this.monitoring.recordMetric('totalTranscriptions', 1);
    this.monitoring.recordMetric('totalSummaries', 1);
    this.monitoring.recordMetric('totalTasksGenerated', tasks.length);
    this.monitoring.recordMetric('totalDecisionsRecorded', decisions.length);

    return { transcript, summary, tasks, decisions, entities, analytics, sentiment, timeline };
  }

  async exportMeeting(meetingId: string, format: 'pdf' | 'docx' | 'markdown' | 'json'): Promise<GeneratedDocument> {
    const meeting = this.controller.getMeeting(meetingId);
    if (!meeting) throw new Error(`Meeting not found: ${meetingId}`);

    const content = `Ata: ${meeting.title}\nDuração: ${meeting.durationMs}ms\nParticipantes: ${meeting.participants.length}`;
    switch (format) {
      case 'pdf': return this.documentGenerator.generatePDF(meetingId, content, meeting.title);
      case 'docx': return this.documentGenerator.generateDOCX(meetingId, content, meeting.title);
      case 'markdown': return this.documentGenerator.generateMarkdown(meetingId, content, meeting.title);
      case 'json': return this.documentGenerator.generateJSON(meetingId, meeting as unknown as Record<string, unknown>);
    }
  }

  getConfig(): MeetingAIConfig {
    return { ...this.config };
  }
}
