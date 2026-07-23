import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type {
  EvolutionConfig,
  PlatformMetrics,
  AnalysisResult,
  EvolutionRecommendation,
  AnalysisCategory,
  Severity,
  ConfidenceLevel
} from '../interfaces.js';

export class EvolutionEngine {
  private config: EvolutionConfig;
  private analyses: Map<string, AnalysisResult> = new Map();
  private recommendations: Map<string, EvolutionRecommendation> = new Map();
  private metricsHistory: PlatformMetrics[] = [];
  private log = createLogger('EvolutionEngine');

  constructor(config: EvolutionConfig) {
    this.config = config;
  }

  async analyzePlatform(metrics: PlatformMetrics): Promise<AnalysisResult[]> {
    this.metricsHistory.push(metrics);
    const results: AnalysisResult[] = [];

    results.push(...this.analyzeUsage(metrics));
    results.push(...this.analyzeErrors(metrics));
    results.push(...this.analyzeBottlenecks(metrics));
    results.push(...this.analyzeCosts(metrics));
    results.push(...this.analyzePerformance(metrics));
    results.push(...this.analyzeStability(metrics));

    for (const result of results) {
      this.analyses.set(result.id, result);
      const recs = this.generateRecommendation(result);
      for (const rec of recs) {
        this.recommendations.set(rec.id, rec);
      }
    }

    this.log(`Platform analysis complete: ${results.length} findings, ${results.reduce((sum, r) => {
      const recs = this.getRecommendationsForAnalysis(r.id);
      return sum + recs.length;
    }, 0)} recommendations`);
    return results;
  }

  private analyzeUsage(metrics: PlatformMetrics): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    if (metrics.activeUsers < metrics.totalUsers * 0.1) {
      results.push({
        id: generateId(),
        category: 'usage',
        severity: 'high',
        confidence: 'high',
        title: 'Low platform engagement',
        description: `Only ${((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% of users are active`,
        impact: 'Revenue loss, reduced platform value',
        recommendation: 'Investigate user onboarding and feature adoption',
        metrics: { activeRate: metrics.activeUsers / metrics.totalUsers },
        timestamp: new Date()
      });
    }
    if (metrics.modulesUsed.length < 5) {
      results.push({
        id: generateId(),
        category: 'usage',
        severity: 'medium',
        confidence: 'medium',
        title: 'Low module utilization',
        description: `Only ${metrics.modulesUsed.length} modules are being used`,
        impact: 'Underutilized platform capabilities',
        recommendation: 'Promote underused modules through tutorials and onboarding',
        metrics: { modulesUsed: metrics.modulesUsed.length },
        timestamp: new Date()
      });
    }
    return results;
  }

  private analyzeErrors(metrics: PlatformMetrics): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    if (metrics.errorRate > 0.05) {
      results.push({
        id: generateId(),
        category: 'errors',
        severity: metrics.errorRate > 0.1 ? 'critical' : 'high',
        confidence: 'high',
        title: 'High error rate detected',
        description: `Error rate is ${(metrics.errorRate * 100).toFixed(2)}%`,
        impact: 'User experience degradation, potential data loss',
        recommendation: 'Investigate root causes and implement error handling',
        metrics: { errorRate: metrics.errorRate },
        timestamp: new Date()
      });
    }
    return results;
  }

  private analyzeBottlenecks(metrics: PlatformMetrics): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    if (metrics.avgLatency > 1000) {
      results.push({
        id: generateId(),
        category: 'bottlenecks',
        severity: metrics.avgLatency > 3000 ? 'critical' : 'high',
        confidence: 'high',
        title: 'High average latency',
        description: `Average latency is ${metrics.avgLatency}ms`,
        impact: 'Poor user experience, reduced throughput',
        recommendation: 'Profile slow endpoints and optimize database queries',
        metrics: { avgLatency: metrics.avgLatency },
        timestamp: new Date()
      });
    }
    return results;
  }

  private analyzeCosts(metrics: PlatformMetrics): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    if (metrics.totalCost > 10000) {
      results.push({
        id: generateId(),
        category: 'costs',
        severity: 'high',
        confidence: 'high',
        title: 'High operational costs',
        description: `Total costs are $${metrics.totalCost.toFixed(2)}`,
        impact: 'Budget overrun, reduced profitability',
        recommendation: 'Review cost optimization opportunities',
        metrics: { totalCost: metrics.totalCost },
        timestamp: new Date()
      });
    }
    return results;
  }

  private analyzePerformance(metrics: PlatformMetrics): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    if (metrics.avgLatency > 500) {
      results.push({
        id: generateId(),
        category: 'performance',
        severity: 'medium',
        confidence: 'medium',
        title: 'Performance below optimal',
        description: `Average response time is ${metrics.avgLatency}ms`,
        impact: 'Reduced user satisfaction',
        recommendation: 'Implement caching and optimize hot paths',
        metrics: { avgLatency: metrics.avgLatency },
        timestamp: new Date()
      });
    }
    return results;
  }

  private analyzeStability(metrics: PlatformMetrics): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    if (metrics.errorRate > 0.02 && metrics.avgLatency > 800) {
      results.push({
        id: generateId(),
        category: 'stability',
        severity: 'high',
        confidence: 'medium',
        title: 'Platform stability concerns',
        description: 'Combined high error rate and latency indicates stability issues',
        impact: 'Risk of cascading failures',
        recommendation: 'Implement circuit breakers and bulkhead patterns',
        metrics: { errorRate: metrics.errorRate, avgLatency: metrics.avgLatency },
        timestamp: new Date()
      });
    }
    return results;
  }

  private generateRecommendation(analysis: AnalysisResult): EvolutionRecommendation[] {
    const recs: EvolutionRecommendation[] = [];
    if (analysis.confidence !== 'low') {
      recs.push({
        id: generateId(),
        analysisId: analysis.id,
        type: 'improvement',
        priority: analysis.severity,
        confidence: analysis.confidence,
        title: `Address: ${analysis.title}`,
        description: analysis.recommendation,
        justification: analysis.impact,
        estimatedImpact: analysis.severity === 'critical' ? 90 : analysis.severity === 'high' ? 70 : 50,
        estimatedEffort: analysis.severity === 'critical' ? 'hard' : 'medium',
        relatedModules: [],
        createdAt: new Date()
      });
    }
    return recs;
  }

  getRecommendationsForAnalysis(analysisId: string): EvolutionRecommendation[] {
    return Array.from(this.recommendations.values()).filter(r => r.analysisId === analysisId);
  }

  getAllAnalyses(): AnalysisResult[] {
    return Array.from(this.analyses.values());
  }

  getAllRecommendations(): EvolutionRecommendation[] {
    return Array.from(this.recommendations.values());
  }

  getMetricsHistory(): PlatformMetrics[] {
    return [...this.metricsHistory];
  }

  getTopRecommendations(limit: number = 10): EvolutionRecommendation[] {
    return Array.from(this.recommendations.values())
      .sort((a, b) => b.estimatedImpact - a.estimatedImpact)
      .slice(0, limit);
  }
}
