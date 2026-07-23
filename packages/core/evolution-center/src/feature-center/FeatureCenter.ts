import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { FeatureRequest, FeatureStatus, Severity } from '../interfaces.js';

export class FeatureCenter {
  private features: Map<string, FeatureRequest> = new Map();
  private log = createLogger('FeatureCenter');

  createFeature(feature: Omit<FeatureRequest, 'id' | 'createdAt' | 'updatedAt' | 'votes'>): FeatureRequest {
    const newFeature: FeatureRequest = {
      ...feature,
      id: generateId(),
      votes: 0,
      feedback: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.features.set(newFeature.id, newFeature);
    this.log(`Created feature request: ${newFeature.title}`);
    return newFeature;
  }

  vote(id: string): boolean {
    const feature = this.features.get(id);
    if (!feature) return false;
    feature.votes++;
    feature.updatedAt = new Date();
    return true;
  }

  addFeedback(id: string, feedback: string): boolean {
    const feature = this.features.get(id);
    if (!feature) return false;
    feature.feedback.push(feedback);
    feature.updatedAt = new Date();
    return true;
  }

  updateStatus(id: string, status: FeatureStatus): boolean {
    const feature = this.features.get(id);
    if (!feature) return false;
    feature.status = status;
    feature.updatedAt = new Date();
    if (status === 'released') feature.releasedAt = new Date();
    return true;
  }

  getById(id: string): FeatureRequest | undefined {
    return this.features.get(id);
  }

  getAll(): FeatureRequest[] {
    return Array.from(this.features.values());
  }

  getByStatus(status: FeatureStatus): FeatureRequest[] {
    return Array.from(this.features.values()).filter(f => f.status === status);
  }

  getByPriority(priority: Severity): FeatureRequest[] {
    return Array.from(this.features.values()).filter(f => f.priority === priority);
  }

  getTopVoted(limit: number = 10): FeatureRequest[] {
    return Array.from(this.features.values())
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit);
  }

  getStats(): FeatureStats {
    const all = Array.from(this.features.values());
    return {
      total: all.length,
      byStatus: this.groupBy(all, 'status'),
      byPriority: this.groupBy(all, 'priority'),
      totalVotes: all.reduce((sum, f) => sum + f.votes, 0),
      avgVotes: all.length > 0 ? all.reduce((sum, f) => sum + f.votes, 0) / all.length : 0
    };
  }

  private groupBy(items: FeatureRequest[], field: keyof FeatureRequest): Record<string, number> {
    return items.reduce((acc, i) => {
      const key = String(i[field]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export interface FeatureStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  totalVotes: number;
  avgVotes: number;
}
