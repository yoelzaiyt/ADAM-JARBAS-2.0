// ─── Common ───────────────────────────────────────────────────────────────────

export type MessageDirection = 'inbound' | 'outbound';
export type MessageType = 'text' | 'image' | 'audio' | 'document' | 'video' | 'location' | 'contact' | 'sticker';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ConversationStatus = 'active' | 'paused' | 'closed' | 'archived';
export type ApprovalMode = 'manual' | 'assistido' | 'automatico';
export type ApprovalStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'expirado';
export type MediaType = 'image' | 'audio' | 'document' | 'video';
export type ProviderName = 'meta' | 'evolution' | 'baileys' | 'wwebjs';
export type AutomationTrigger = 'mensagem' | 'palavra_chave' | 'horario' | 'novo_contato' | 'audio_recebido';
export type AutomationAction = 'responder' | 'criar_tarefa' | 'atualizar_crm' | 'agendar' | 'encaminhar' | 'notificar';
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type QueuePriority = 'low' | 'normal' | 'high' | 'critical';
export type NotificationChannel = 'whatsapp' | 'email' | 'push' | 'webhook';
export type SecurityLevel = 'publico' | 'interno' | 'confidencial' | 'restrito';
export type BusinessHourAction = 'auto_reply' | 'queue' | 'ignore';

export interface WhatsAppEvent {
  type: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

// ─── Gateway ──────────────────────────────────────────────────────────────────

export interface GatewayConfig {
  provider: ProviderName;
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  apiVersion: string;
  baseUrl: string;
}

export interface SendOptions {
  to: string;
  type: MessageType;
  text?: string;
  mediaUrl?: string;
  caption?: string;
  templateName?: string;
  templateParams?: string[];
}

export interface GatewayMessage {
  id: string;
  from: string;
  to: string;
  type: MessageType;
  direction: MessageDirection;
  text?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  caption?: string;
  timestamp: Date;
  status: MessageStatus;
  provider: ProviderName;
  metadata: Record<string, unknown>;
}

export interface WhatsAppGateway {
  send(options: SendOptions): Promise<GatewayMessage>;
  sendText(to: string, text: string): Promise<GatewayMessage>;
  sendAudio(to: string, mediaUrl: string): Promise<GatewayMessage>;
  sendDocument(to: string, mediaUrl: string, filename: string): Promise<GatewayMessage>;
  sendImage(to: string, mediaUrl: string, caption?: string): Promise<GatewayMessage>;
  sendMessage(message: GatewayMessage): Promise<GatewayMessage>;
  verifyWebhook(mode: string, token: string): boolean;
  parseWebhook(body: unknown): WhatsAppEvent[];
  getProvider(): ProviderName;
  isConnected(): boolean;
}

// ─── Webhook ──────────────────────────────────────────────────────────────────

export interface WebhookEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  source: ProviderName;
}

export interface WebhookConfig {
  path: string;
  verifyToken: string;
  secret: string;
  port: number;
}

export interface WebhookServer {
  start(config: WebhookConfig): Promise<void>;
  stop(): Promise<void>;
  onEvent(callback: (event: WebhookEvent) => void): void;
  isRunning(): boolean;
}

// ─── Message Router ───────────────────────────────────────────────────────────

export interface MessageContext {
  conversationId: string;
  contactId: string;
  contactName: string;
  message: GatewayMessage;
  isGroup: boolean;
  groupId?: string;
  replyTo?: string;
}

export interface RouteDecision {
  action: 'respond' | 'approve' | 'forward' | 'ignore' | 'task' | 'reminder' | 'meeting' | 'voice';
  confidence: number;
  reason: string;
  handler?: string;
}

export interface MessageRouter {
  route(context: MessageContext): Promise<RouteDecision>;
  registerHandler(pattern: string, handler: string): void;
  getRegisteredHandlers(): Map<string, string>;
}

// ─── Conversation Engine ──────────────────────────────────────────────────────

export interface ConversationContext {
  id: string;
  contactId: string;
  contactName: string;
  status: ConversationStatus;
  priority: TaskPriority;
  objective?: string;
  projectId?: string;
  clientId?: string;
  lastInteraction: Date;
  messageCount: number;
  tags: string[];
  memoryId?: string;
  approvalMode: ApprovalMode;
  metadata: Record<string, unknown>;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  type: MessageType;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  approvalStatus?: ApprovalStatus;
  metadata: Record<string, unknown>;
}

export interface ConversationEngine {
  getOrCreate(contactId: string, contactName: string): Promise<ConversationContext>;
  getContext(conversationId: string): ConversationContext | null;
  addMessage(conversationId: string, message: Omit<ConversationMessage, 'id' | 'timestamp'>): Promise<ConversationMessage>;
  getHistory(conversationId: string, limit?: number): ConversationMessage[];
  updateContext(conversationId: string, updates: Partial<ConversationContext>): Promise<ConversationContext>;
  closeConversation(conversationId: string): Promise<void>;
  getActiveConversations(): ConversationContext[];
  search(query: string): ConversationContext[];
}

// ─── Contact Manager ──────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  role?: string;
  tags: string[];
  crmId?: string;
  lastContact: Date;
  totalMessages: number;
  notes: string;
  metadata: Record<string, unknown>;
}

export interface ContactManager {
  getOrCreate(phone: string, name?: string): Promise<Contact>;
  get(contactId: string): Contact | null;
  update(contactId: string, updates: Partial<Contact>): Promise<Contact>;
  search(query: string): Contact[];
  getAll(): Contact[];
  delete(contactId: string): Promise<void>;
  getByPhone(phone: string): Contact | null;
}

// ─── Media Manager ────────────────────────────────────────────────────────────

export interface MediaFile {
  id: string;
  type: MediaType;
  url: string;
  mimeType: string;
  sizeBytes: number;
  filename?: string;
  caption?: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

export interface MediaManager {
  download(mediaUrl: string, type: MediaType): Promise<MediaFile>;
  upload(file: Buffer, type: MediaType, filename?: string): Promise<MediaFile>;
  getMedia(mediaId: string): MediaFile | null;
  deleteMedia(mediaId: string): Promise<void>;
}

// ─── Voice Handler ────────────────────────────────────────────────────────────

export interface VoiceMessage {
  id: string;
  contactId: string;
  audioUrl: string;
  durationMs: number;
  transcription?: string;
  language?: string;
  transcribedAt?: Date;
}

export interface VoiceHandler {
  processAudio(audioUrl: string, contactId: string): Promise<VoiceMessage>;
  transcribe(voiceId: string): Promise<string>;
  respondWithVoice(conversationId: string, text: string): Promise<GatewayMessage>;
  getVoiceMessage(voiceId: string): VoiceMessage | null;
}

// ─── Document Handler ─────────────────────────────────────────────────────────

export interface ReceivedDocument {
  id: string;
  contactId: string;
  documentUrl: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  summary?: string;
  receivedAt: Date;
}

export interface DocumentHandler {
  processDocument(url: string, contactId: string, filename: string): Promise<ReceivedDocument>;
  sendDocument(to: string, url: string, filename: string): Promise<GatewayMessage>;
  getDocument(docId: string): ReceivedDocument | null;
  summarizeDocument(docId: string): Promise<string>;
}

// ─── Image Handler ────────────────────────────────────────────────────────────

export interface ProcessedImage {
  id: string;
  contactId: string;
  imageUrl: string;
  ocrText?: string;
  qrData?: string;
  barcodeData?: string;
  description?: string;
  processedAt: Date;
}

export interface ImageHandler {
  processImage(imageUrl: string, contactId: string): Promise<ProcessedImage>;
  sendImage(to: string, imageUrl: string, caption?: string): Promise<GatewayMessage>;
  getImage(imageId: string): ProcessedImage | null;
}

// ─── AI Response Engine ───────────────────────────────────────────────────────

export interface AIResponse {
  text: string;
  confidence: number;
  action: RouteDecision['action'];
  suggestedActions: string[];
  context: Record<string, unknown>;
}

export interface AIResponseConfig {
  mode: ApprovalMode;
  autoRespondKeywords: string[];
  ignoreKeywords: string[];
  maxResponseLength: number;
  language: string;
}

export interface AIResponseEngine {
  generateResponse(message: ConversationMessage, context: ConversationContext): Promise<AIResponse>;
  shouldAutoRespond(message: ConversationMessage, config: AIResponseConfig): boolean;
  getSuggestedActions(message: ConversationMessage): string[];
  setMode(mode: ApprovalMode): void;
  getMode(): ApprovalMode;
}

// ─── Approval Workflow ────────────────────────────────────────────────────────

export interface ApprovalRequest {
  id: string;
  conversationId: string;
  messageId: string;
  proposedResponse: string;
  status: ApprovalStatus;
  createdAt: Date;
  expiresAt: Date;
  reviewedAt?: Date;
  reviewerNotes?: string;
}

export interface ApprovalWorkflow {
  createRequest(request: Omit<ApprovalRequest, 'id' | 'createdAt' | 'expiresAt' | 'status'>): Promise<ApprovalRequest>;
  approve(requestId: string, notes?: string): Promise<ApprovalRequest>;
  reject(requestId: string, notes?: string): Promise<ApprovalRequest>;
  getPending(): ApprovalRequest[];
  getByConversation(conversationId: string): ApprovalRequest[];
  getRequest(requestId: string): ApprovalRequest | null;
}

// ─── Automation Engine ────────────────────────────────────────────────────────

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  triggerValue?: string;
  conditions: AutomationCondition[];
  actions: AutomationActionTarget[];
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'gt' | 'lt';
  value: string;
}

export interface AutomationActionTarget {
  action: AutomationAction;
  config: Record<string, unknown>;
}

export interface AutomationEngine {
  createRule(rule: Omit<AutomationRule, 'id' | 'createdAt' | 'triggerCount'>): Promise<AutomationRule>;
  updateRule(ruleId: string, updates: Partial<AutomationRule>): Promise<AutomationRule>;
  deleteRule(ruleId: string): Promise<void>;
  getRules(): AutomationRule[];
  evaluate(message: ConversationMessage, context: ConversationContext): Promise<AutomationActionTarget[]>;
  getRule(ruleId: string): AutomationRule | null;
}

// ─── CRM Sync ─────────────────────────────────────────────────────────────────

export interface CRMContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  stage: string;
  value?: number;
  lastActivity: Date;
}

export interface CRMDeal {
  id: string;
  contactId: string;
  name: string;
  stage: string;
  value: number;
  probability: number;
  expectedClose?: Date;
  meetingIds: string[];
}

export interface CRMSync {
  syncContact(contact: Contact): Promise<CRMContact>;
  syncDeal(deal: CRMDeal): Promise<void>;
  addNote(contactId: string, note: string): Promise<void>;
  getContact(phone: string): Promise<CRMContact | null>;
  getDeals(contactId: string): Promise<CRMDeal[]>;
}

// ─── Calendar Sync ────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  attendees: string[];
  reminder?: number;
}

export interface CalendarSync {
  createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>;
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteEvent(eventId: string): Promise<void>;
  getEvents(start: Date, end: Date): Promise<CalendarEvent[]>;
}

// ─── Task Sync ────────────────────────────────────────────────────────────────

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  deadline?: Date;
  priority: TaskPriority;
  status: 'pendente' | 'em_progresso' | 'concluida';
  projectId?: string;
  contactId?: string;
  source: string;
  createdAt: Date;
}

export interface TaskSync {
  createTask(task: Omit<TaskItem, 'id' | 'createdAt'>): Promise<TaskItem>;
  updateTask(taskId: string, updates: Partial<TaskItem>): Promise<TaskItem>;
  getTasksByContact(contactId: string): TaskItem[];
  getTasksByProject(projectId: string): TaskItem[];
  completeTask(taskId: string): Promise<TaskItem>;
}

// ─── Notification Engine ──────────────────────────────────────────────────────

export interface Notification {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  body: string;
  sent: boolean;
  sentAt?: Date;
  error?: string;
}

export interface NotificationEngine {
  send(notification: Omit<Notification, 'id' | 'sent' | 'sentAt'>): Promise<Notification>;
  getNotifications(recipient: string): Notification[];
  getFailed(): Notification[];
  retry(notificationId: string): Promise<Notification>;
}

// ─── Queue Manager ────────────────────────────────────────────────────────────

export interface QueueItem {
  id: string;
  type: string;
  payload: unknown;
  priority: QueuePriority;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

export interface QueueManager {
  enqueue(item: Omit<QueueItem, 'id' | 'attempts' | 'createdAt' | 'status'>): Promise<QueueItem>;
  dequeue(): QueueItem | null;
  complete(itemId: string): Promise<void>;
  fail(itemId: string, error: string): Promise<void>;
  getDeadLetter(): QueueItem[];
  retry(itemId: string): Promise<void>;
  getStats(): { pending: number; processing: number; completed: number; failed: number; deadLetter: number };
  size(): number;
}

// ─── Retry Engine ─────────────────────────────────────────────────────────────

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface RetryEngine {
  execute<T>(fn: () => Promise<T>, config?: RetryConfig): Promise<T>;
  getRetryCount(itemId: string): number;
  reset(itemId: string): void;
}

// ─── Business Manager ─────────────────────────────────────────────────────────

export interface BusinessHours {
  start: string;
  end: string;
  days: number[];
}

export interface AutoReply {
  message: string;
  enabled: boolean;
}

export interface BusinessConfig {
  id: string;
  name: string;
  phone: string;
  hours: BusinessHours;
  autoReply: AutoReply;
  greetingMessage: string;
  outsideHoursMessage: string;
  transferMessage: string;
  departments: string[];
  tags: string[];
}

export interface BusinessManager {
  getConfig(): BusinessConfig;
  updateConfig(updates: Partial<BusinessConfig>): Promise<BusinessConfig>;
  isWithinHours(): boolean;
  getAutoReply(): string;
  getGreeting(): string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface WhatsAppMetrics {
  totalMessages: number;
  inboundMessages: number;
  outboundMessages: number;
  totalConversations: number;
  activeConversations: number;
  averageResponseTimeMs: number;
  totalContacts: number;
  totalMediaFiles: number;
  totalTasks: number;
  totalAutomations: number;
  aiVsHumanRatio: number;
  estimatedCostUsd: number;
}

export interface AnalyticsDashboard {
  metrics: WhatsAppMetrics;
  uptime: number;
  status: 'healthy' | 'degraded' | 'down';
  recentErrors: WhatsAppError[];
}

export interface WhatsAppError {
  id: string;
  timestamp: Date;
  module: string;
  message: string;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
}

export interface AnalyticsEngine {
  recordMetric(name: string, value: number): void;
  recordError(error: Omit<WhatsAppError, 'id' | 'timestamp'>): void;
  getMetrics(): WhatsAppMetrics;
  getDashboard(): AnalyticsDashboard;
  reset(): void;
}

// ─── Security ─────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  target: string;
  details: Record<string, unknown>;
  timestamp: Date;
  level: SecurityLevel;
}

export interface SecurityEngine {
  logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): void;
  getAuditLogs(userId?: string): AuditLog[];
  sanitizeInput(input: string): string;
  isSpam(contactId: string, windowMs?: boolean): boolean;
  checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean;
  encrypt(data: string): string;
  decrypt(encrypted: string): string;
}

// ─── Monitoring ───────────────────────────────────────────────────────────────

export interface MonitoringEngine {
  recordMetric(name: string, value: number): void;
  recordError(error: Omit<WhatsAppError, 'id' | 'timestamp'>): void;
  getMetrics(): WhatsAppMetrics;
  getDashboard(): AnalyticsDashboard;
  reset(): void;
}

// ─── WhatsApp AI Config ──────────────────────────────────────────────────────

export interface WhatsAppAIConfig {
  gateway: GatewayConfig;
  defaultApprovalMode: ApprovalMode;
  maxMessageLength: number;
  language: string;
  autoTranscribeAudio: boolean;
  autoProcessDocuments: boolean;
  autoProcessImages: boolean;
  queueEnabled: boolean;
  retryEnabled: boolean;
  monitoringEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
