import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { RolloutConfig } from '../interfaces.js';

export class RolloutManager {
  private rollouts: Map<string, RolloutConfig> = new Map();
  private log = createLogger('RolloutManager');

  createRollout(config: Omit<RolloutConfig, 'id' | 'percentage' | 'status'>): RolloutConfig {
    const newRollout: RolloutConfig = {
      ...config,
      id: generateId(),
      percentage: 0,
      status: 'pending'
    };
    this.rollouts.set(newRollout.id, newRollout);
    this.log(`Created rollout: ${newRollout.version}`);
    return newRollout;
  }

  start(id: string): boolean {
    const rollout = this.rollouts.get(id);
    if (!rollout) return false;
    rollout.status = 'in-progress';
    rollout.percentage = 5;
    return true;
  }

  advance(id: string, step: number = 10): RolloutConfig | null {
    const rollout = this.rollouts.get(id);
    if (!rollout || rollout.status !== 'in-progress') return null;
    rollout.percentage = Math.min(rollout.percentage + step, 100);
    if (rollout.percentage >= 100) {
      rollout.status = 'completed';
    }
    return rollout;
  }

  halt(id: string, reason: string): boolean {
    const rollout = this.rollouts.get(id);
    if (!rollout) return false;
    rollout.status = 'halted';
    this.log(`Halted rollout ${rollout.version}: ${reason}`);
    return true;
  }

  rollback(id: string): boolean {
    const rollout = this.rollouts.get(id);
    if (!rollout) return false;
    rollout.status = 'rolled-back';
    rollout.percentage = 0;
    this.log(`Rolled back rollout: ${rollout.version}`);
    return true;
  }

  shouldHalt(rollout: RolloutConfig, metrics: { errorRate: number; latency: number }): boolean {
    if (rollout.autoHaltOnFailure) {
      if (metrics.errorRate > rollout.maxErrorRate) return true;
      if (metrics.latency > rollout.maxLatencyIncrease) return true;
    }
    return false;
  }

  getById(id: string): RolloutConfig | undefined {
    return this.rollouts.get(id);
  }

  getAll(): RolloutConfig[] {
    return Array.from(this.rollouts.values());
  }

  getActive(): RolloutConfig | undefined {
    return Array.from(this.rollouts.values()).find(r => r.status === 'in-progress');
  }
}
