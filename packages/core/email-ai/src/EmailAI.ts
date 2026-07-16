import { EmailGateway } from './EmailGateway.js';
import { ProviderRegistry } from './ProviderRegistry.js';
import { MailboxManager } from './MailboxManager.js';
import { SyncEngine } from './SyncEngine.js';
import { FolderManager } from './FolderManager.js';
import { ConversationEngine } from './ConversationEngine.js';
import { PriorityEngine } from './PriorityEngine.js';
import { ClassificationEngine } from './ClassificationEngine.js';
import { SpamDetector } from './SpamDetector.js';
import { PhishingAnalyzer } from './PhishingAnalyzer.js';
import { AttachmentManager } from './AttachmentManager.js';
import { DocumentParser } from './DocumentParser.js';
import { AIResponseEngine } from './AIResponseEngine.js';
import { ApprovalWorkflow } from './ApprovalWorkflow.js';
import { DraftGenerator } from './DraftGenerator.js';
import { SignatureManager } from './SignatureManager.js';
import { ContactManager } from './ContactManager.js';
import { CRMSync } from './CRMSync.js';
import { CalendarSync } from './CalendarSync.js';
import { TaskSync } from './TaskSync.js';
import { NotificationEngine } from './NotificationEngine.js';
import { AnalyticsEngine } from './Analytics.js';
import { MonitoringEngine } from './Monitoring.js';
import { SecurityEngine } from './Security.js';
import { EmailAPI } from './EmailAPI.js';
import type { EmailAIConfig } from './interfaces.js';

export class EmailAI {
  readonly gateway: EmailGateway;
  readonly providers: ProviderRegistry;
  readonly mailbox: MailboxManager;
  readonly syncEngine: SyncEngine;
  readonly folders: FolderManager;
  readonly conversations: ConversationEngine;
  readonly priority: PriorityEngine;
  readonly classification: ClassificationEngine;
  readonly spam: SpamDetector;
  readonly phishing: PhishingAnalyzer;
  readonly attachments: AttachmentManager;
  readonly documents: DocumentParser;
  readonly ai: AIResponseEngine;
  readonly approvals: ApprovalWorkflow;
  readonly drafts: DraftGenerator;
  readonly signatures: SignatureManager;
  readonly contacts: ContactManager;
  readonly crm: CRMSync;
  readonly calendar: CalendarSync;
  readonly tasks: TaskSync;
  readonly notifications: NotificationEngine;
  readonly analytics: AnalyticsEngine;
  readonly monitoring: MonitoringEngine;
  readonly security: SecurityEngine;
  readonly api: EmailAPI;

  private config: EmailAIConfig;

  constructor(config: EmailAIConfig) {
    this.config = config;
    this.gateway = new EmailGateway(config.defaultProvider);
    this.providers = new ProviderRegistry();
    this.mailbox = new MailboxManager();
    this.syncEngine = new SyncEngine();
    this.folders = new FolderManager();
    this.conversations = new ConversationEngine();
    this.priority = new PriorityEngine();
    this.classification = new ClassificationEngine();
    this.spam = new SpamDetector();
    this.phishing = new PhishingAnalyzer();
    this.attachments = new AttachmentManager();
    this.documents = new DocumentParser();
    this.ai = new AIResponseEngine(config.defaultApprovalMode);
    this.approvals = new ApprovalWorkflow();
    this.drafts = new DraftGenerator();
    this.signatures = new SignatureManager();
    this.contacts = new ContactManager();
    this.crm = new CRMSync();
    this.calendar = new CalendarSync();
    this.tasks = new TaskSync();
    this.notifications = new NotificationEngine();
    this.analytics = new AnalyticsEngine();
    this.monitoring = new MonitoringEngine();
    this.security = new SecurityEngine();
    this.api = new EmailAPI(this);

    for (const provider of config.providers) {
      this.providers.register(provider);
    }
  }

  async initialize(): Promise<void> {
    this.analytics.recordMetric('initialized', 1);
  }

  async shutdown(): Promise<void> {
    this.analytics.recordMetric('shutdown', 1);
  }

  getAnalytics() {
    return this.analytics.getDashboard();
  }
}
