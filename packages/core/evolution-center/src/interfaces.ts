// Evolution Center - All Interfaces

// ==================== EVOLUTION ENGINE ====================
export type AnalysisCategory = 'usage' | 'errors' | 'bottlenecks' | 'costs' | 'feedback' | 'performance' | 'stability';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface EvolutionConfig {
  enabled: boolean;
  analysisInterval: number;
  confidenceThreshold: number;
  autoApprove: boolean;
  metricsRetention: number;
  alertChannels: string[];
}

export interface PlatformMetrics {
  timestamp: Date;
  totalUsers: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  avgLatency: number;
  totalCost: number;
  modulesUsed: string[];
}

export interface AnalysisResult {
  id: string;
  category: AnalysisCategory;
  severity: Severity;
  confidence: ConfidenceLevel;
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  metrics: Record<string, number>;
  timestamp: Date;
}

export interface EvolutionRecommendation {
  id: string;
  analysisId: string;
  type: 'improvement' | 'optimization' | 'fix' | 'deprecation' | 'architecture';
  priority: Severity;
  confidence: ConfidenceLevel;
  title: string;
  description: string;
  justification: string;
  estimatedImpact: number;
  estimatedEffort: 'trivial' | 'easy' | 'medium' | 'hard' | 'epic';
  relatedModules: string[];
  createdAt: Date;
}

// ==================== IMPROVEMENT ENGINE ====================
export type ImprovementType = 'code-duplication' | 'slow-api' | 'inefficient-query' | 'outdated-dependency' | 'unused-component' | 'low-test-coverage' | 'code-smell' | 'security-vulnerability' | 'performance' | 'documentation';

export interface Improvement {
  id: string;
  type: ImprovementType;
  severity: Severity;
  title: string;
  description: string;
  location: string;
  currentMetrics: Record<string, number>;
  suggestedAction: string;
  estimatedImpact: number;
  estimatedEffort: 'trivial' | 'easy' | 'medium' | 'hard' | 'epic';
  relatedFiles: string[];
  createdAt: Date;
  status: 'detected' | 'acknowledged' | 'in-progress' | 'completed' | 'dismissed';
}

export interface ImprovementEngineConfig {
  enabled: boolean;
  scanInterval: number;
  types: ImprovementType[];
  minSeverity: Severity;
}

// ==================== ROADMAP ENGINE ====================
export type InitiativeType = 'epic' | 'feature' | 'bug' | 'improvement' | 'refactor' | 'research' | 'spike' | 'technical-debt';

export interface RoadmapItem {
  id: string;
  type: InitiativeType;
  title: string;
  description: string;
  priority: Severity;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled' | 'blocked';
  assignee?: string;
  estimatedEffort: 'trivial' | 'easy' | 'medium' | 'hard' | 'epic';
  dependencies: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  targetDate?: Date;
  completedAt?: Date;
}

export interface Roadmap {
  id: string;
  name: string;
  description: string;
  items: RoadmapItem[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== BACKLOG MANAGER ====================
export type BacklogType = 'product' | 'sprint' | 'icebox' | 'technical-debt' | 'architecture' | 'research' | 'spike';

export interface BacklogItem {
  id: string;
  type: BacklogType;
  title: string;
  description: string;
  priority: Severity;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  storyPoints?: number;
  assignee?: string;
  labels: string[];
  sprintId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  items: string[];
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  goal: string;
}

// ==================== BUG CENTER ====================
export type BugPriority = 'critical' | 'high' | 'medium' | 'low';
export type BugStatus = 'open' | 'in-progress' | 'resolved' | 'closed' | 'wont-fix' | 'duplicate';

export interface Bug {
  id: string;
  title: string;
  description: string;
  priority: BugPriority;
  status: BugStatus;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  stackTrace?: string;
  affectedUsers: number;
  affectedVersions: string[];
  module: string;
  reporter: string;
  assignee?: string;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

// ==================== FEATURE CENTER ====================
export type FeatureStatus = 'requested' | 'planned' | 'in-development' | 'testing' | 'released' | 'cancelled';

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  priority: Severity;
  votes: number;
  requester: string;
  feedback: string[];
  estimatedEffort: 'trivial' | 'easy' | 'medium' | 'hard' | 'epic';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  releasedAt?: Date;
}

// ==================== TELEMETRY ENGINE ====================
export interface TelemetryConfig {
  enabled: boolean;
  collectInterval: number;
  privacyMode: 'full' | 'anonymized' | 'minimal';
  retentionDays: number;
  exportFormats: ('json' | 'csv' | 'parquet')[];
}

export interface TelemetryEvent {
  id: string;
  type: 'usage' | 'performance' | 'error' | 'cost' | 'custom';
  source: string;
  data: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  gpu?: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  activeConnections: number;
  requestQueue: number;
  timestamp: Date;
}

export interface CostMetrics {
  aiTokens: number;
  aiCost: number;
  databaseCost: number;
  storageCost: number;
  infraCost: number;
  thirdPartyCost: number;
  totalCost: number;
  period: string;
}

// ==================== ANALYTICS ENGINE ====================
export interface AnalyticsConfig {
  enabled: boolean;
  aggregationIntervals: ('hourly' | 'daily' | 'weekly' | 'monthly')[];
  retentionDays: number;
}

export interface DailyMetrics {
  date: string;
  activeUsers: number;
  sessions: number;
  avgSessionDuration: number;
  totalRequests: number;
  errorCount: number;
  totalCost: number;
  moduleUsage: Record<string, number>;
}

export interface UserEngagement {
  userId: string;
  totalSessions: number;
  totalDuration: number;
  featuresUsed: string[];
  lastActive: Date;
}

// ==================== QUALITY ENGINE ====================
export interface QualityMetrics {
  testCoverage: number;
  codeSmells: number;
  complexity: number;
  duplication: number;
  documentation: number;
  technicalDebt: number;
  maintainabilityIndex: number;
  timestamp: Date;
}

export interface QualityConfig {
  enabled: boolean;
  thresholds: {
    testCoverage: number;
    maxComplexity: number;
    maxDuplication: number;
    minMaintainability: number;
  };
  checkInterval: number;
}

// ==================== ARCHITECTURE REVIEW ====================
export type ArchitecturePrinciple = 'ddd' | 'solid' | 'clean-architecture' | 'hexagonal' | 'event-driven' | 'loose-coupling' | 'high-cohesion';

export interface ArchitectureViolation {
  id: string;
  principle: ArchitecturePrinciple;
  severity: Severity;
  title: string;
  description: string;
  location: string;
  recommendation: string;
  autoFixable: boolean;
  detectedAt: Date;
}

export interface ArchitectureReviewConfig {
  enabled: boolean;
  principles: ArchitecturePrinciple[];
  rules: ArchitectureRule[];
}

export interface ArchitectureRule {
  id: string;
  name: string;
  description: string;
  principle: ArchitecturePrinciple;
  pattern: string;
  severity: Severity;
  enabled: boolean;
}

// ==================== SECURITY REVIEW ====================
export type VulnerabilityType = 'known-vulnerability' | 'insecure-config' | 'exposed-secret' | 'permission-escalation' | 'dependency-risk' | 'data-exposure' | 'injection' | 'xss';

export interface SecurityVulnerability {
  id: string;
  type: VulnerabilityType;
  severity: Severity;
  title: string;
  description: string;
  affectedComponent: string;
  recommendation: string;
  cveId?: string;
  cvssScore?: number;
  autoFixable: boolean;
  detectedAt: Date;
}

export interface SecurityReviewConfig {
  enabled: boolean;
  checkInterval: number;
  vulnerabilityDB: string;
  autoScan: boolean;
}

// ==================== DEPENDENCY REVIEW ====================
export interface DependencyInfo {
  name: string;
  currentVersion: string;
  latestVersion: string;
  license: string;
  deprecated: boolean;
  securityIssues: number;
  outdated: boolean;
  size: number;
}

export interface DependencyReviewConfig {
  enabled: boolean;
  checkInterval: number;
  allowedLicenses: string[];
  maxSecurityIssues: number;
}

// ==================== PERFORMANCE REVIEW ====================
export interface PerformanceReviewConfig {
  enabled: boolean;
  metrics: string[];
  thresholds: Record<string, number>;
  checkInterval: number;
}

export interface PerformanceIssue {
  id: string;
  type: 'cpu' | 'memory' | 'database' | 'cache' | 'queue' | 'latency' | 'api' | 'network';
  severity: Severity;
  title: string;
  description: string;
  currentValue: number;
  threshold: number;
  recommendation: string;
  detectedAt: Date;
}

// ==================== COST REVIEW ====================
export interface CostReviewConfig {
  enabled: boolean;
  alertThreshold: number;
  trackingCategories: string[];
  checkInterval: number;
}

export interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface CostAlert {
  id: string;
  category: string;
  threshold: number;
  currentValue: number;
  severity: Severity;
  message: string;
  detectedAt: Date;
}

// ==================== RELEASE MANAGER ====================
export type ReleaseType = 'major' | 'minor' | 'patch' | 'hotfix' | 'pre-release';

export interface Release {
  id: string;
  version: string;
  type: ReleaseType;
  title: string;
  description: string;
  status: 'draft' | 'staging' | 'testing' | 'released' | 'deprecated';
  changelog: string[];
  breakingChanges: string[];
  dependencies: string[];
  createdAt: Date;
  releasedAt?: Date;
  author: string;
}

// ==================== EXPERIMENTATION ====================
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  status: ExperimentStatus;
  variants: ExperimentVariant[];
  targetMetric: string;
  minSampleSize: number;
  confidenceLevel: number;
  startDate?: Date;
  endDate?: Date;
  result?: ExperimentResult;
  createdAt: Date;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  weight: number;
  metrics: Record<string, number>;
}

export interface ExperimentResult {
  winner: string;
  confidence: number;
  metrics: Record<string, { control: number; treatment: number; lift: number }>;
}

// ==================== FEATURE FLAGS ====================
export type FlagTargeting = 'all' | 'percentage' | 'user-segment' | 'company-segment' | 'environment';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  targeting: FlagTargeting;
  percentage?: number;
  userSegments?: string[];
  companySegments?: string[];
  environments?: string[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// ==================== CANARY MANAGER ====================
export type DeploymentStrategy = 'canary' | 'rolling' | 'blue-green';

export interface CanaryDeployment {
  id: string;
  version: string;
  strategy: DeploymentStrategy;
  status: 'pending' | 'in-progress' | 'completed' | 'rolled-back' | 'failed';
  percentage: number;
  targetPercentage: number;
  stepSize: number;
  interval: number;
  healthChecks: HealthCheck[];
  metrics: Record<string, number>;
  startedAt?: Date;
  completedAt?: Date;
}

export interface HealthCheck {
  id: string;
  name: string;
  status: 'passing' | 'failing' | 'unknown';
  lastCheck: Date;
  details: string;
}

// ==================== ROLLOUT MANAGER ====================
export interface RolloutConfig {
  id: string;
  version: string;
  percentage: number;
  groups: string[];
  monitoring: boolean;
  autoHaltOnFailure: boolean;
  maxErrorRate: number;
  maxLatencyIncrease: number;
  status: 'pending' | 'in-progress' | 'completed' | 'halted' | 'rolled-back';
}

// ==================== ROLLBACK MANAGER ====================
export interface RollbackTrigger {
  id: string;
  type: 'error-rate' | 'latency' | 'crash' | 'manual' | 'health-check';
  threshold: number;
  current: number;
  triggered: boolean;
}

export interface RollbackAction {
  id: string;
  releaseId: string;
  targetVersion: string;
  reason: string;
  triggers: RollbackTrigger[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  initiatedBy: string;
  initiatedAt: Date;
  completedAt?: Date;
}

// ==================== GOVERNANCE ====================
export type PolicyDomain = 'architecture' | 'security' | 'quality' | 'release' | 'documentation' | 'change';

export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  domain: PolicyDomain;
  rules: PolicyRule[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: 'warn' | 'block' | 'require-approval' | 'notify';
  severity: Severity;
}

// ==================== APPROVALS ====================
export type ApprovalType = 'change' | 'release' | 'architecture' | 'dependency' | 'production' | 'security';

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  title: string;
  description: string;
  requester: string;
  approvers: string[];
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requiredApprovals: number;
  currentApprovals: number;
  digitalSignature?: string;
  createdAt: Date;
  expiresAt: Date;
  resolvedAt?: Date;
}

export interface ApprovalDecision {
  id: string;
  requestId: string;
  approver: string;
  decision: 'approved' | 'rejected';
  comment: string;
  digitalSignature: string;
  timestamp: Date;
}

// ==================== AUDIT ====================
export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  target: string;
  details: Record<string, unknown>;
  result: 'success' | 'failure' | 'pending';
  timestamp: Date;
  immutable: boolean;
}

// ==================== NOTIFICATIONS ====================
export type NotificationChannel = 'slack' | 'teams' | 'email' | 'whatsapp' | 'dashboard' | 'webhook';

export interface NotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  templates: NotificationTemplate[];
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: NotificationChannel;
  subject: string;
  body: string;
  variables: string[];
}

export interface Notification {
  id: string;
  templateId: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'failed' | 'read';
  createdAt: Date;
  sentAt?: Date;
}

// ==================== DASHBOARDS ====================
export type DashboardType = 'cto' | 'ceo' | 'architecture' | 'quality' | 'security' | 'infrastructure' | 'product';

export interface Dashboard {
  id: string;
  name: string;
  type: DashboardType;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  refreshInterval: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'status' | 'alert' | 'list';
  title: string;
  dataSource: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}

export interface DashboardLayout {
  columns: number;
  rows: number;
}

// ==================== REPORTS ====================
export type ReportType = 'weekly' | 'monthly' | 'technical' | 'executive' | 'financial' | 'quality';

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  period: { start: Date; end: Date };
  sections: ReportSection[];
  generatedAt: Date;
  format: 'markdown' | 'html' | 'pdf' | 'json';
}

export interface ReportSection {
  title: string;
  content: string;
  metrics: Record<string, number>;
  charts: string[];
}

// ==================== MONITORING ====================
export interface MonitoringConfig {
  enabled: boolean;
  providers: MonitoringProvider[];
  healthCheckInterval: number;
  alertThresholds: Record<string, number>;
}

export interface MonitoringProvider {
  type: 'opentelemetry' | 'prometheus' | 'grafana' | 'loki' | 'tempo' | 'jaeger';
  endpoint: string;
  enabled: boolean;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  components: ComponentHealth[];
  timestamp: Date;
}

export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  latency: number;
  errorRate: number;
  lastCheck: Date;
}

// ==================== EVOLUTION CENTER MAIN ====================
export interface EvolutionCenterConfig {
  enabled: boolean;
  evolution: EvolutionConfig;
  telemetry: TelemetryConfig;
  analytics: AnalyticsConfig;
  quality: QualityConfig;
  architecture: ArchitectureReviewConfig;
  security: SecurityReviewConfig;
  dependency: DependencyReviewConfig;
  performance: PerformanceReviewConfig;
  cost: CostReviewConfig;
  notifications: NotificationConfig;
  monitoring: MonitoringConfig;
}
