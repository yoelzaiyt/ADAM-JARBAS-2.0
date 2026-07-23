// ─── Common ───────────────────────────────────────────────────────────────────

export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'draft' | 'queued' | 'sent' | 'delivered' | 'failed' | 'archived';
export type EmailPriority = 'urgente' | 'alta' | 'media' | 'baixa';
export type ApprovalStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'expirado';
export type ApprovalMode = 'manual' | 'assistido' | 'automatico';
export type SyncMode = 'manual' | 'incremental' | 'agendada' | 'realtime';
export type ConversationState = 'ativa' | 'aguardando' | 'resolvida' | 'arquivada';
export type SpamLevel = 'nenhum' | 'baixo' | 'medio' | 'alto' | 'critico';
export type PhishingRisk = 'nenhum' | 'suspeita' | 'provavel' | 'critico';
export type AttachmentType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'csv' | 'txt' | 'image' | 'zip' | 'unknown';
export type DraftType = 'comercial' | 'juridico' | 'financeiro' | 'atendimento' | 'convite' | 'cobranca' | 'agradecimento' | 'followup' | 'tecnico';
export type NotificationChannel = 'email' | 'push' | 'webhook' | 'sms';
export type SecurityLevel = 'publico' | 'interno' | 'confidencial' | 'restrito';
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TaskStatus = 'pendente' | 'em_progresso' | 'concluida' | 'cancelada';
export type ProviderName = 'gmail' | 'outlook' | 'exchange' | 'yahoo' | 'proton' | 'imap_smtp';
export type FolderType = 'inbox' | 'sent' | 'drafts' | 'archive' | 'spam' | 'trash' | 'custom';

export interface EmailEvent {
  type: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Email Core ───────────────────────────────────────────────────────────────

export interface EmailAddress {
  name: string;
  email: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  type: AttachmentType;
  url?: string;
  content?: Buffer;
  contentId?: string;
  isInline: boolean;
  extractedText?: string;
  scanResult?: AttachmentScanResult;
}

export interface AttachmentScanResult {
  clean: boolean;
  threats: string[];
  scanDate: Date;
  engine: string;
}

export interface EmailMessage {
  id: string;
  messageId: string;
  threadId?: string;
  conversationId?: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  textBody: string;
  htmlBody?: string;
  attachments: EmailAttachment[];
  direction: MessageDirection;
  status: MessageStatus;
  folderId?: string;
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  priority: EmailPriority;
  category?: string;
  spamLevel: SpamLevel;
  phishingRisk: PhishingRisk;
  receivedAt: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface EmailDraft {
  id: string;
  replyToId?: string;
  forwardFromId?: string;
  to: EmailAddress[];
  cc?: EmailAddress[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments: EmailAttachment[];
  type: DraftType;
  signatureId?: string;
  approvalStatus: ApprovalStatus;
  approvalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailSendRequest {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: EmailAttachment[];
  replyToId?: string;
  signatureId?: string;
  priority?: EmailPriority;
}

export interface EmailStats {
  totalReceived: number;
  totalSent: number;
  totalDrafts: number;
  totalArchived: number;
  totalSpam: number;
  avgResponseTimeMs: number;
  automationRate: number;
  categoryBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  dailyVolume: { date: string; count: number }[];
}

// ─── Provider Registry ────────────────────────────────────────────────────────

export interface ProviderConfig {
  name: ProviderName;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  accessToken?: string;
  tokenExpiry?: Date;
  imapHost?: string;
  imapPort?: number;
  smtpHost?: string;
  smtpPort?: number;
  username?: string;
  password?: string;
  useTls?: boolean;
  apiEndpoint?: string;
}

export interface ProviderCapabilities {
  canSend: boolean;
  canReceive: boolean;
  supportsOAuth: boolean;
  supportsIMAP: boolean;
  supportsSMTP: boolean;
  supportsLabels: boolean;
  supportsFolders: boolean;
  supportsSearch: boolean;
  supportsRealtime: boolean;
  maxAttachmentSize: number;
  supportedAttachmentTypes: string[];
}

export interface ProviderRegistry {
  register(provider: ProviderConfig): void;
  get(name: ProviderName): ProviderConfig | null;
  getAll(): ProviderConfig[];
  getCapabilities(name: ProviderName): ProviderCapabilities;
  remove(name: ProviderName): void;
}

// ─── Mailbox Manager ──────────────────────────────────────────────────────────

export interface MailboxFolder {
  id: string;
  name: string;
  type: FolderType;
  parentId?: string;
  unreadCount: number;
  totalCount: number;
  lastSynced?: Date;
  provider: ProviderName;
  providerFolderId: string;
}

export interface MailboxManager {
  getFolders(provider: ProviderName): Promise<MailboxFolder[]>;
  getFolder(folderId: string): MailboxFolder | null;
  createFolder(provider: ProviderName, name: string, parentId?: string): Promise<MailboxFolder>;
  renameFolder(folderId: string, newName: string): Promise<void>;
  deleteFolder(folderId: string): Promise<void>;
  getFolderCounts(provider: ProviderName): Promise<Record<string, number>>;
}

// ─── Sync Engine ──────────────────────────────────────────────────────────────

export interface SyncResult {
  folderId: string;
  synced: number;
  new: number;
  updated: number;
  deleted: number;
  errors: string[];
  duration: number;
  lastSyncDate: Date;
}

export interface SyncEngine {
  syncAll(provider: ProviderName, mode: SyncMode): Promise<SyncResult[]>;
  syncFolder(folderId: string, mode: SyncMode): Promise<SyncResult>;
 getLastSyncDate(provider: ProviderName): Date | null;
  setSyncDate(provider: ProviderName, date: Date): void;
  getSyncHistory(): SyncResult[];
  isSyncing(): boolean;
}

// ─── Folder Manager ───────────────────────────────────────────────────────────

export interface FolderManager {
  getDefaultFolders(): MailboxFolder[];
  mapToProviderFolder(folderId: string, provider: ProviderName): string;
  mapFromProviderFolder(providerFolderId: string, provider: ProviderName): string;
  moveToFolder(emailId: string, targetFolderId: string): Promise<void>;
  moveToArchive(emailId: string): Promise<void>;
  moveToTrash(emailId: string): Promise<void>;
  moveToSpam(emailId: string): Promise<void>;
  restoreFromTrash(emailId: string): Promise<void>;
  emptyTrash(provider: ProviderName): Promise<void>;
}

// ─── Conversation Engine ──────────────────────────────────────────────────────

export interface EmailConversation {
  id: string;
  subject: string;
  participants: EmailAddress[];
  messageIds: string[];
  emailIds: string[];
  state: ConversationState;
  priority: EmailPriority;
  category?: string;
  contactId?: string;
  projectId?: string;
  relatedTaskIds: string[];
  summary?: string;
  lastMessageAt: Date;
  messageCount: number;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface ConversationEngine {
  getOrCreate(message: EmailMessage): Promise<EmailConversation>;
  get(conversationId: string): EmailConversation | null;
  getByContact(contactId: string): EmailConversation[];
  getByProject(projectId: string): EmailConversation[];
  update(conversationId: string, updates: Partial<EmailConversation>): Promise<EmailConversation>;
  close(conversationId: string): Promise<void>;
  getActive(): EmailConversation[];
  search(query: string): EmailConversation[];
  getByState(state: ConversationState): EmailConversation[];
}

// ─── Priority Engine ──────────────────────────────────────────────────────────

export interface PriorityRule {
  id: string;
  name: string;
  field: 'sender' | 'subject' | 'content' | 'category' | 'contact' | 'project';
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex';
  value: string;
  priority: EmailPriority;
  enabled: boolean;
}

export interface PriorityEngine {
  classify(message: EmailMessage): Promise<EmailPriority>;
  addRule(rule: Omit<PriorityRule, 'id'>): PriorityRule;
  updateRule(ruleId: string, updates: Partial<PriorityRule>): PriorityRule;
  deleteRule(ruleId: string): void;
  getRules(): PriorityRule[];
  classifyByRules(message: EmailMessage): EmailPriority | null;
}

// ─── Classification Engine ────────────────────────────────────────────────────

export interface EmailCategory {
  id: string;
  name: string;
  keywords: string[];
  patterns: string[];
  color: string;
  icon: string;
}

export interface ClassificationResult {
  category: string;
  confidence: number;
  subcategories: string[];
  tags: string[];
}

export interface ClassificationEngine {
  classify(message: EmailMessage): Promise<ClassificationResult>;
  getCategories(): EmailCategory[];
  addCategory(category: Omit<EmailCategory, 'id'>): EmailCategory;
  updateCategory(categoryId: string, updates: Partial<EmailCategory>): EmailCategory;
  deleteCategory(categoryId: string): void;
  getConfidenceThreshold(): number;
  setConfidenceThreshold(threshold: number): void;
}

// ─── Spam Detector ────────────────────────────────────────────────────────────

export interface SpamCheckResult {
  isSpam: boolean;
  level: SpamLevel;
  score: number;
  reasons: string[];
  indicators: string[];
  confidence: number;
}

export interface SpamDetector {
  check(message: EmailMessage): Promise<SpamCheckResult>;
  markAsSpam(emailId: string): Promise<void>;
  markAsNotSpam(emailId: string): Promise<void>;
  getBlockedSenders(): string[];
  addBlockedSender(email: string): void;
  removeBlockedSender(email: string): void;
  getTrustedSenders(): string[];
  addTrustedSender(email: string): void;
  removeTrustedSender(email: string): void;
}

// ─── Phishing Analyzer ────────────────────────────────────────────────────────

export interface PhishingCheckResult {
  risk: PhishingRisk;
  score: number;
  indicators: string[];
  suspiciousLinks: string[];
  suspiciousAttachments: string[];
  recommendations: string[];
  confidence: number;
}

export interface PhishingAnalyzer {
  analyze(message: EmailMessage): Promise<PhishingCheckResult>;
  getKnownPhishingDomains(): string[];
  addPhishingDomain(domain: string): void;
  removePhishingDomain(domain: string): void;
}

// ─── Attachment Manager ───────────────────────────────────────────────────────

export interface ProcessedAttachment {
  id: string;
  originalId: string;
  type: AttachmentType;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  extractedText?: string;
  metadata?: Record<string, unknown>;
  riskLevel: SpamLevel;
  processedAt: Date;
}

export interface AttachmentManager {
  process(attachment: EmailAttachment): Promise<ProcessedAttachment>;
  getByEmail(emailId: string): ProcessedAttachment[];
  getById(attachmentId: string): ProcessedAttachment | null;
  extractText(attachmentId: string): Promise<string>;
  scanForThreats(attachmentId: string): Promise<AttachmentScanResult>;
  delete(attachmentId: string): Promise<void>;
}

// ─── Document Parser ──────────────────────────────────────────────────────────

export interface ParsedDocument {
  id: string;
  sourceAttachmentId?: string;
  text: string;
  pageCount?: number;
  wordCount: number;
  language?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface DocumentParser {
  parse(buffer: Buffer, mimeType: string, filename: string): Promise<ParsedDocument>;
  parseEmailBody(html: string, text: string): ParsedDocument;
  supportsMimeType(mimeType: string): boolean;
  getSupportedTypes(): string[];
}

// ─── AI Response Engine ───────────────────────────────────────────────────────

export interface AIResponseAction {
  type: 'auto_reply' | 'draft' | 'forward' | 'approve' | 'archive' | 'task' | 'meeting' | 'followup';
  confidence: number;
  reason: string;
  params?: Record<string, unknown>;
}

export interface AIResponse {
  actions: AIResponseAction[];
  suggestedReply?: string;
  summary?: string;
  keyPoints: string[];
  extractedDates: Date[];
  extractedTasks: string[];
  extractedContacts: EmailAddress[];
  context: Record<string, unknown>;
}

export interface AIResponseConfig {
  mode: ApprovalMode;
  autoReplyKeywords: string[];
  ignoreKeywords: string[];
  maxReplyLength: number;
  language: string;
  tone: 'formal' | 'informal' | 'profissional';
}

export interface AIResponseEngine {
  generateResponse(message: EmailMessage, conversation?: EmailConversation): Promise<AIResponse>;
  shouldAutoReply(message: EmailMessage): boolean;
  getSuggestedActions(message: EmailMessage): AIResponseAction[];
  setMode(mode: ApprovalMode): void;
  getMode(): ApprovalMode;
  getConfig(): AIResponseConfig;
  updateConfig(updates: Partial<AIResponseConfig>): void;
}

// ─── Approval Workflow ────────────────────────────────────────────────────────

export interface ApprovalRequest {
  id: string;
  emailId: string;
  conversationId?: string;
  draftId: string;
  proposedResponse: string;
  proposedActions: AIResponseAction[];
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
  getByEmail(emailId: string): ApprovalRequest[];
  getByConversation(conversationId: string): ApprovalRequest[];
  getRequest(requestId: string): ApprovalRequest | null;
}

// ─── Draft Generator ──────────────────────────────────────────────────────────

export interface DraftTemplate {
  id: string;
  name: string;
  type: DraftType;
  subjectTemplate: string;
  bodyTemplate: string;
  variables: string[];
  language: string;
  createdAt: Date;
}

export interface GeneratedDraft {
  id: string;
  draft: EmailDraft;
  templateUsed?: string;
  confidence: number;
  generatedAt: Date;
  context: Record<string, unknown>;
}

export interface DraftGenerator {
  generate(message: EmailMessage, type: DraftType, options?: Partial<AIResponseConfig>): Promise<GeneratedDraft>;
  generateReply(message: EmailMessage, tone?: string): Promise<GeneratedDraft>;
  generateForward(message: EmailMessage, to: EmailAddress[], note?: string): Promise<GeneratedDraft>;
  getTemplates(): DraftTemplate[];
  addTemplate(template: Omit<DraftTemplate, 'id' | 'createdAt'>): DraftTemplate;
  updateTemplate(templateId: string, updates: Partial<DraftTemplate>): DraftTemplate;
  deleteTemplate(templateId: string): void;
}

// ─── Signature Manager ────────────────────────────────────────────────────────

export interface EmailSignature {
  id: string;
  name: string;
  html: string;
  text: string;
  isDefault: boolean;
  isCorporate: boolean;
  department?: string;
  identityEmail: string;
  createdAt: Date;
}

export interface SignatureManager {
  getSignatures(): EmailSignature[];
  getSignature(signatureId: string): EmailSignature | null;
  getDefault(): EmailSignature | null;
  getByDepartment(department: string): EmailSignature[];
  addSignature(signature: Omit<EmailSignature, 'id' | 'createdAt'>): EmailSignature;
  updateSignature(signatureId: string, updates: Partial<EmailSignature>): EmailSignature;
  deleteSignature(signatureId: string): void;
  setDefault(signatureId: string): void;
}

// ─── Contact Manager ──────────────────────────────────────────────────────────

export interface EmailContact {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  phone?: string;
  tags: string[];
  crmId?: string;
  totalEmails: number;
  lastContact: Date;
  notes: string;
  metadata: Record<string, unknown>;
}

export interface ContactManager {
  getOrCreate(email: string, name?: string): Promise<EmailContact>;
  get(contactId: string): EmailContact | null;
  getByEmail(email: string): EmailContact | null;
  update(contactId: string, updates: Partial<EmailContact>): Promise<EmailContact>;
  search(query: string): EmailContact[];
  getAll(): EmailContact[];
  delete(contactId: string): Promise<void>;
  incrementEmailCount(contactId: string): Promise<void>;
}

// ─── CRM Sync ─────────────────────────────────────────────────────────────────

export interface CRMContact {
  id: string;
  name: string;
  email: string;
  company?: string;
  stage: string;
  value?: number;
  lastActivity: Date;
  emailCount: number;
}

export interface CRMOpportunity {
  id: string;
  contactId: string;
  name: string;
  stage: string;
  value: number;
  probability: number;
  expectedClose?: Date;
  emailIds: string[];
  lastEmailAt?: Date;
}

export interface CRMSync {
  syncContact(contact: EmailContact): Promise<CRMContact>;
  syncOpportunity(opportunity: CRMOpportunity): Promise<void>;
  addNote(contactId: string, note: string): Promise<void>;
  addEmailToTimeline(contactId: string, emailId: string, summary: string): Promise<void>;
  getContact(email: string): Promise<CRMContact | null>;
  getOpportunities(contactId: string): Promise<CRMOpportunity[]>;
}

// ─── Calendar Sync ────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  attendees: string[];
  location?: string;
  reminder?: number;
  sourceEmailId?: string;
  createdAt: Date;
}

export interface CalendarSync {
  createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent>;
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteEvent(eventId: string): Promise<void>;
  getEvents(start: Date, end: Date): Promise<CalendarEvent[]>;
  detectDates(message: EmailMessage): Date[];
  detectMeetingRequests(message: EmailMessage): { suggestedDates: Date[]; organizer: string; title: string } | null;
}

// ─── Task Sync ────────────────────────────────────────────────────────────────

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  deadline?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  projectId?: string;
  contactId?: string;
  emailId?: string;
  conversationId?: string;
  source: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface TaskSync {
  createTask(task: Omit<TaskItem, 'id' | 'createdAt'>): Promise<TaskItem>;
  updateTask(taskId: string, updates: Partial<TaskItem>): Promise<TaskItem>;
  completeTask(taskId: string): Promise<TaskItem>;
  getTasksByContact(contactId: string): TaskItem[];
  getTasksByProject(projectId: string): TaskItem[];
  getTasksByEmail(emailId: string): TaskItem[];
  getPendingTasks(): TaskItem[];
  extractTasks(message: EmailMessage): Promise<Omit<TaskItem, 'id' | 'createdAt'>[]>;
}

// ─── Notification Engine ──────────────────────────────────────────────────────

export interface Notification {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  body: string;
  data?: Record<string, unknown>;
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

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface EmailMetrics {
  totalReceived: number;
  totalSent: number;
  totalDrafts: number;
  totalArchived: number;
  totalSpam: number;
  totalConversations: number;
  activeConversations: number;
  avgResponseTimeMs: number;
  automationRate: number;
  categoryBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  volumeByContact: Record<string, number>;
  pendingApprovals: number;
  tasksCreated: number;
  estimatedCostUsd: number;
}

export interface AnalyticsDashboard {
  metrics: EmailMetrics;
  uptime: number;
  status: 'healthy' | 'degraded' | 'down';
  recentErrors: EmailError[];
}

export interface EmailError {
  id: string;
  timestamp: Date;
  module: string;
  message: string;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
}

export interface AnalyticsEngine {
  recordMetric(name: string, value: number): void;
  recordError(error: Omit<EmailError, 'id' | 'timestamp'>): void;
  getMetrics(): EmailMetrics;
  getDashboard(): AnalyticsDashboard;
  reset(): void;
}

// ─── Monitoring ───────────────────────────────────────────────────────────────

export interface MonitoringEngine {
  recordMetric(name: string, value: number): void;
  recordError(error: Omit<EmailError, 'id' | 'timestamp'>): void;
  getMetrics(): EmailMetrics;
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
  checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean;
  encrypt(data: string): string;
  decrypt(encrypted: string): string;
  validateOAuthToken(token: string): boolean;
}

// ─── Email API ────────────────────────────────────────────────────────────────

export interface EmailAPIRequest {
  body: unknown;
  params: Record<string, string>;
  query: Record<string, string>;
  user?: { id: string; email: string };
}

export interface EmailAPIResponse {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}

export interface EmailAPI {
  send(req: EmailAPIRequest): Promise<EmailAPIResponse>;
  draft(req: EmailAPIRequest): Promise<EmailAPIResponse>;
  reply(req: EmailAPIRequest): Promise<EmailAPIResponse>;
  forward(req: EmailAPIRequest): Promise<EmailAPIResponse>;
  sync(req: EmailAPIRequest): Promise<EmailAPIResponse>;
  archive(req: EmailAPIRequest): Promise<EmailAPIResponse>;
  classify(req: EmailAPIRequest): Promise<EmailAPIResponse>;
  createTask(req: EmailAPIRequest): Promise<EmailAPIResponse>;
  getInbox(req: EmailAPIRequest): Promise<EmailAPIResponse>;
  getConversation(req: EmailAPIRequest): Promise<EmailAPIResponse>;
  getStatistics(req: EmailAPIRequest): Promise<EmailAPIResponse>;
  delete(req: EmailAPIRequest): Promise<EmailAPIResponse>;
}

// ─── Email AI Config ─────────────────────────────────────────────────────────

export interface EmailAIConfig {
  providers: ProviderConfig[];
  defaultProvider: ProviderName;
  defaultApprovalMode: ApprovalMode;
  maxAttachmentSize: number;
  language: string;
  autoClassify: boolean;
  autoPrioritize: boolean;
  autoSpamCheck: boolean;
  autoPhishingCheck: boolean;
  syncIntervalMinutes: number;
  queueEnabled: boolean;
  retryEnabled: boolean;
  monitoringEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
