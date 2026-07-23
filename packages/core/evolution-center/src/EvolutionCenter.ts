import { createLogger } from './Logger.js';
import type { EvolutionCenterConfig, PlatformMetrics } from './interfaces.js';
import { EvolutionEngine } from './evolution-engine/EvolutionEngine.js';
import { ImprovementEngine, type ImprovementScanData } from './improvement-engine/ImprovementEngine.js';
import { RoadmapEngine } from './roadmap-engine/RoadmapEngine.js';
import { BacklogManager } from './backlog-manager/BacklogManager.js';
import { BugCenter } from './bug-center/BugCenter.js';
import { FeatureCenter } from './feature-center/FeatureCenter.js';
import { TelemetryEngine } from './telemetry-engine/TelemetryEngine.js';
import { AnalyticsEngine } from './analytics-engine/AnalyticsEngine.js';
import { QualityEngine } from './quality-engine/QualityEngine.js';
import { ArchitectureReview, type ArchitectureReviewData } from './architecture-review/ArchitectureReview.js';
import { SecurityReview, type SecurityReviewData } from './security-review/SecurityReview.js';
import { DependencyReview } from './dependency-review/DependencyReview.js';
import { PerformanceReview, type PerformanceMetricsInput } from './performance-review/PerformanceReview.js';
import { CostReview } from './cost-review/CostReview.js';
import { ReleaseManager } from './release-manager/ReleaseManager.js';
import { Experimentation } from './experimentation/Experimentation.js';
import { FeatureFlags } from './feature-flags/FeatureFlags.js';
import { CanaryManager } from './canary-manager/CanaryManager.js';
import { RolloutManager } from './rollout-manager/RolloutManager.js';
import { RollbackManager } from './rollback-manager/RollbackManager.js';
import { Governance } from './governance/Governance.js';
import { ApprovalEngine } from './approvals/ApprovalEngine.js';
import { Audit } from './audit/Audit.js';
import { NotificationCenter } from './notifications/NotificationCenter.js';
import { DashboardManager } from './dashboards/DashboardManager.js';
import { ReportGenerator } from './reports/ReportGenerator.js';
import { Monitoring } from './monitoring/Monitoring.js';

export class EvolutionCenter {
  private config: EvolutionCenterConfig;
  private log = createLogger('EvolutionCenter');
  private evolutionEngine: EvolutionEngine;
  private improvementEngine: ImprovementEngine;
  private roadmapEngine: RoadmapEngine;
  private backlogManager: BacklogManager;
  private bugCenter: BugCenter;
  private featureCenter: FeatureCenter;
  private telemetryEngine: TelemetryEngine;
  private analyticsEngine: AnalyticsEngine;
  private qualityEngine: QualityEngine;
  private architectureReview: ArchitectureReview;
  private securityReview: SecurityReview;
  private dependencyReview: DependencyReview;
  private performanceReview: PerformanceReview;
  private costReview: CostReview;
  private releaseManager: ReleaseManager;
  private experimentation: Experimentation;
  private featureFlags: FeatureFlags;
  private canaryManager: CanaryManager;
  private rolloutManager: RolloutManager;
  private rollbackManager: RollbackManager;
  private governance: Governance;
  private approvalEngine: ApprovalEngine;
  private audit: Audit;
  private notificationCenter: NotificationCenter;
  private dashboardManager: DashboardManager;
  private reportGenerator: ReportGenerator;
  private monitoring: Monitoring;

  constructor(config: EvolutionCenterConfig) {
    this.config = config;
    this.evolutionEngine = new EvolutionEngine(config.evolution);
    this.improvementEngine = new ImprovementEngine({ enabled: true, scanInterval: 3600000, types: ['code-duplication', 'slow-api', 'inefficient-query', 'outdated-dependency', 'unused-component', 'low-test-coverage'], minSeverity: 'low' });
    this.roadmapEngine = new RoadmapEngine();
    this.backlogManager = new BacklogManager();
    this.bugCenter = new BugCenter();
    this.featureCenter = new FeatureCenter();
    this.telemetryEngine = new TelemetryEngine(config.telemetry);
    this.analyticsEngine = new AnalyticsEngine(config.analytics);
    this.qualityEngine = new QualityEngine(config.quality);
    this.architectureReview = new ArchitectureReview(config.architecture);
    this.securityReview = new SecurityReview(config.security);
    this.dependencyReview = new DependencyReview(config.dependency);
    this.performanceReview = new PerformanceReview(config.performance);
    this.costReview = new CostReview(config.cost);
    this.releaseManager = new ReleaseManager();
    this.experimentation = new Experimentation();
    this.featureFlags = new FeatureFlags();
    this.canaryManager = new CanaryManager();
    this.rolloutManager = new RolloutManager();
    this.rollbackManager = new RollbackManager();
    this.governance = new Governance();
    this.approvalEngine = new ApprovalEngine();
    this.audit = new Audit();
    this.notificationCenter = new NotificationCenter(config.notifications);
    this.dashboardManager = new DashboardManager();
    this.reportGenerator = new ReportGenerator();
    this.monitoring = new Monitoring(config.monitoring);

    this.log('Evolution Center initialized');
  }

  getEvolutionEngine(): EvolutionEngine { return this.evolutionEngine; }
  getImprovementEngine(): ImprovementEngine { return this.improvementEngine; }
  getRoadmapEngine(): RoadmapEngine { return this.roadmapEngine; }
  getBacklogManager(): BacklogManager { return this.backlogManager; }
  getBugCenter(): BugCenter { return this.bugCenter; }
  getFeatureCenter(): FeatureCenter { return this.featureCenter; }
  getTelemetryEngine(): TelemetryEngine { return this.telemetryEngine; }
  getAnalyticsEngine(): AnalyticsEngine { return this.analyticsEngine; }
  getQualityEngine(): QualityEngine { return this.qualityEngine; }
  getArchitectureReview(): ArchitectureReview { return this.architectureReview; }
  getSecurityReview(): SecurityReview { return this.securityReview; }
  getDependencyReview(): DependencyReview { return this.dependencyReview; }
  getPerformanceReview(): PerformanceReview { return this.performanceReview; }
  getCostReview(): CostReview { return this.costReview; }
  getReleaseManager(): ReleaseManager { return this.releaseManager; }
  getExperimentation(): Experimentation { return this.experimentation; }
  getFeatureFlags(): FeatureFlags { return this.featureFlags; }
  getCanaryManager(): CanaryManager { return this.canaryManager; }
  getRolloutManager(): RolloutManager { return this.rolloutManager; }
  getRollbackManager(): RollbackManager { return this.rollbackManager; }
  getGovernance(): Governance { return this.governance; }
  getApprovalEngine(): ApprovalEngine { return this.approvalEngine; }
  getAudit(): Audit { return this.audit; }
  getNotificationCenter(): NotificationCenter { return this.notificationCenter; }
  getDashboardManager(): DashboardManager { return this.dashboardManager; }
  getReportGenerator(): ReportGenerator { return this.reportGenerator; }
  getMonitoring(): Monitoring { return this.monitoring; }

  async analyzePlatform(metrics: PlatformMetrics) {
    this.audit.record('platform.analyze', 'system', 'evolution-center', { timestamp: new Date().toISOString() });
    const analyses = await this.evolutionEngine.analyzePlatform(metrics);
    return analyses;
  }

  async runArchitectureReview(data: ArchitectureReviewData) {
    return this.architectureReview.runReview(data);
  }

  async runSecurityReview(data: SecurityReviewData) {
    return this.securityReview.runReview(data);
  }

  async runPerformanceReview(metrics: PerformanceMetricsInput) {
    return this.performanceReview.analyze(metrics);
  }

  async scanImprovements(data: ImprovementScanData) {
    return this.improvementEngine.detectImprovements(data);
  }

  getMetrics() {
    return {
      improvements: this.improvementEngine.getStats(),
      bugs: this.bugCenter.getStats(),
      features: this.featureCenter.getStats(),
      backlog: this.backlogManager.getStats(),
      releases: this.releaseManager.getAll().length,
      experiments: this.experimentation.getAll().length,
      featureFlags: this.featureFlags.getActive().length,
      architecture: this.architectureReview.getViolationStats(),
      security: this.securityReview.getStats(),
      quality: this.qualityEngine.getScore(),
      governance: this.governance.getStats(),
      approvals: this.approvalEngine.getStats(),
      audit: this.audit.getStats(),
      notifications: this.notificationCenter.getStats()
    };
  }
}
