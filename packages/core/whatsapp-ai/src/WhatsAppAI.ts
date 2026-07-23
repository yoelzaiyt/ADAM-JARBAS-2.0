import { WhatsAppGateway } from './WhatsAppGateway.js';
import { WebhookServer } from './WebhookServer.js';
import { MessageRouter } from './MessageRouter.js';
import { ConversationEngine } from './ConversationEngine.js';
import { ContactManager } from './ContactManager.js';
import { MediaManager } from './MediaManager.js';
import { VoiceHandler } from './VoiceHandler.js';
import { DocumentHandler } from './DocumentHandler.js';
import { ImageHandler } from './ImageHandler.js';
import { AIResponseEngine } from './AIResponseEngine.js';
import { ApprovalWorkflow } from './ApprovalWorkflow.js';
import { AutomationEngine } from './AutomationEngine.js';
import { CRMSync } from './CRMSync.js';
import { CalendarSync } from './CalendarSync.js';
import { TaskSync } from './TaskSync.js';
import { NotificationEngine } from './NotificationEngine.js';
import { BusinessManager } from './BusinessManager.js';
import { QueueManager } from './QueueManager.js';
import { RetryEngine } from './RetryEngine.js';
import { AnalyticsEngine } from './Analytics.js';
import { MonitoringEngine } from './Monitoring.js';
import { SecurityEngine } from './Security.js';
import type {
  WhatsAppAIConfig,
  GatewayConfig,
  ConversationMessage,
  MessageRouter as MessageRouterType,
  RouteDecision,
} from './interfaces.js';

export class WhatsAppAI {
  readonly gateway: WhatsAppGateway;
  readonly webhook: WebhookServer;
  readonly router: MessageRouter;
  readonly conversations: ConversationEngine;
  readonly contacts: ContactManager;
  readonly media: MediaManager;
  readonly voice: VoiceHandler;
  readonly documents: DocumentHandler;
  readonly images: ImageHandler;
  readonly ai: AIResponseEngine;
  readonly approvals: ApprovalWorkflow;
  readonly automations: AutomationEngine;
  readonly crm: CRMSync;
  readonly calendar: CalendarSync;
  readonly tasks: TaskSync;
  readonly notifications: NotificationEngine;
  readonly business: BusinessManager;
  readonly queue: QueueManager;
  readonly retry: RetryEngine;
  readonly analytics: AnalyticsEngine;
  readonly monitoring: MonitoringEngine;
  readonly security: SecurityEngine;

  private config: WhatsAppAIConfig;

  constructor(config: WhatsAppAIConfig) {
    this.config = config;
    this.gateway = new WhatsAppGateway(config.gateway);
    this.webhook = new WebhookServer();
    this.router = new MessageRouter();
    this.conversations = new ConversationEngine();
    this.contacts = new ContactManager();
    this.media = new MediaManager();
    this.voice = new VoiceHandler();
    this.documents = new DocumentHandler();
    this.images = new ImageHandler();
    this.ai = new AIResponseEngine(config.defaultApprovalMode);
    this.approvals = new ApprovalWorkflow();
    this.automations = new AutomationEngine();
    this.crm = new CRMSync();
    this.calendar = new CalendarSync();
    this.tasks = new TaskSync();
    this.notifications = new NotificationEngine();
    this.business = new BusinessManager();
    this.queue = new QueueManager();
    this.retry = new RetryEngine();
    this.analytics = new AnalyticsEngine();
    this.monitoring = new MonitoringEngine();
    this.security = new SecurityEngine();
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
