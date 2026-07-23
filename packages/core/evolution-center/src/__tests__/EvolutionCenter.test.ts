import { describe, it, expect } from 'vitest';
import { EvolutionCenter } from '../EvolutionCenter.js';
import type { EvolutionCenterConfig, PlatformMetrics } from '../interfaces.js';

describe('EvolutionCenter', () => {
  const config: EvolutionCenterConfig = {
    enabled: true,
    evolution: { enabled: true, analysisInterval: 3600000, confidenceThreshold: 0.7, autoApprove: false, metricsRetention: 30, alertChannels: [] },
    telemetry: { enabled: true, collectInterval: 60000, privacyMode: 'full', retentionDays: 30, exportFormats: ['json'] },
    analytics: { enabled: true, aggregationIntervals: ['daily'], retentionDays: 30 },
    quality: { enabled: true, thresholds: { testCoverage: 80, maxComplexity: 20, maxDuplication: 15, minMaintainability: 60 }, checkInterval: 3600000 },
    architecture: { enabled: true, principles: ['ddd', 'solid'], rules: [] },
    security: { enabled: true, checkInterval: 3600000, vulnerabilityDB: 'nvd', autoScan: true },
    dependency: { enabled: true, checkInterval: 3600000, allowedLicenses: ['MIT'], maxSecurityIssues: 0 },
    performance: { enabled: true, metrics: [], thresholds: { cpu: 80 }, checkInterval: 60000 },
    cost: { enabled: true, alertThreshold: 1000, trackingCategories: ['ai'], checkInterval: 3600000 },
    notifications: { enabled: true, channels: ['slack'], templates: [] },
    monitoring: { enabled: true, providers: [], healthCheckInterval: 30000, alertThresholds: {} }
  };

  const center = new EvolutionCenter(config);

  it('creates EvolutionCenter', () => { expect(center).toBeDefined(); });

  it('gets all modules', () => {
    expect(center.getEvolutionEngine()).toBeDefined();
    expect(center.getImprovementEngine()).toBeDefined();
    expect(center.getRoadmapEngine()).toBeDefined();
    expect(center.getBacklogManager()).toBeDefined();
    expect(center.getBugCenter()).toBeDefined();
    expect(center.getFeatureCenter()).toBeDefined();
    expect(center.getTelemetryEngine()).toBeDefined();
    expect(center.getAnalyticsEngine()).toBeDefined();
    expect(center.getQualityEngine()).toBeDefined();
    expect(center.getArchitectureReview()).toBeDefined();
    expect(center.getSecurityReview()).toBeDefined();
    expect(center.getDependencyReview()).toBeDefined();
    expect(center.getPerformanceReview()).toBeDefined();
    expect(center.getCostReview()).toBeDefined();
    expect(center.getReleaseManager()).toBeDefined();
    expect(center.getExperimentation()).toBeDefined();
    expect(center.getFeatureFlags()).toBeDefined();
    expect(center.getCanaryManager()).toBeDefined();
    expect(center.getRolloutManager()).toBeDefined();
    expect(center.getRollbackManager()).toBeDefined();
    expect(center.getGovernance()).toBeDefined();
    expect(center.getApprovalEngine()).toBeDefined();
    expect(center.getAudit()).toBeDefined();
    expect(center.getNotificationCenter()).toBeDefined();
    expect(center.getDashboardManager()).toBeDefined();
    expect(center.getReportGenerator()).toBeDefined();
    expect(center.getMonitoring()).toBeDefined();
  });

  it('analyzes platform', async () => {
    const metrics: PlatformMetrics = {
      timestamp: new Date(), totalUsers: 1000, activeUsers: 500, totalRequests: 10000,
      errorRate: 0.02, avgLatency: 200, totalCost: 5000, modulesUsed: ['a', 'b', 'c', 'd', 'e', 'f']
    };
    const results = await center.analyzePlatform(metrics);
    expect(Array.isArray(results)).toBe(true);
  });

  it('gets metrics', () => {
    const metrics = center.getMetrics();
    expect(metrics).toBeDefined();
    expect(metrics.improvements).toBeDefined();
    expect(metrics.bugs).toBeDefined();
  });

  it('creates roadmap via engine', () => {
    const roadmap = center.getRoadmapEngine().createRoadmap('Q1', 'Roadmap', new Date(), new Date());
    expect(roadmap.name).toBe('Q1');
  });

  it('creates bug via center', () => {
    const bug = center.getBugCenter().createBug({
      title: 'Test', description: '', priority: 'medium', status: 'open',
      stepsToReproduce: '', expectedBehavior: '', actualBehavior: '',
      affectedUsers: 0, affectedVersions: [], module: 'core', reporter: 'dev', labels: []
    });
    expect(bug.title).toBe('Test');
  });
});
