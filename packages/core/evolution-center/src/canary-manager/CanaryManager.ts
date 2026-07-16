import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { CanaryDeployment, DeploymentStrategy, HealthCheck } from '../interfaces.js';

export class CanaryManager {
  private deployments: Map<string, CanaryDeployment> = new Map();
  private log = createLogger('CanaryManager');

  createDeployment(deployment: Omit<CanaryDeployment, 'id' | 'percentage' | 'healthChecks' | 'metrics'>): CanaryDeployment {
    const newDep: CanaryDeployment = {
      ...deployment,
      id: generateId(),
      percentage: 0,
      healthChecks: [],
      metrics: {}
    };
    this.deployments.set(newDep.id, newDep);
    this.log(`Created canary deployment: ${newDep.version} [${newDep.strategy}]`);
    return newDep;
  }

  startDeployment(id: string): boolean {
    const dep = this.deployments.get(id);
    if (!dep) return false;
    dep.status = 'in-progress';
    dep.startedAt = new Date();
    dep.percentage = dep.stepSize;
    if (dep.percentage >= dep.targetPercentage) {
      dep.status = 'completed';
      dep.completedAt = new Date();
    }
    return true;
  }

  advanceDeployment(id: string): CanaryDeployment | null {
    const dep = this.deployments.get(id);
    if (!dep || dep.status !== 'in-progress') return null;
    dep.percentage = Math.min(dep.percentage + dep.stepSize, dep.targetPercentage);
    if (dep.percentage >= dep.targetPercentage) {
      dep.status = 'completed';
      dep.completedAt = new Date();
    }
    return dep;
  }

  rollback(id: string): boolean {
    const dep = this.deployments.get(id);
    if (!dep) return false;
    dep.status = 'rolled-back';
    dep.percentage = 0;
    dep.completedAt = new Date();
    this.log(`Rolled back deployment: ${dep.version}`);
    return true;
  }

  addHealthCheck(deploymentId: string, check: Omit<HealthCheck, 'id'>): boolean {
    const dep = this.deployments.get(deploymentId);
    if (!dep) return false;
    dep.healthChecks.push({ ...check, id: generateId() });
    return true;
  }

  isHealthy(id: string): boolean {
    const dep = this.deployments.get(id);
    if (!dep || dep.healthChecks.length === 0) return true;
    return dep.healthChecks.every(hc => hc.status === 'passing');
  }

  getById(id: string): CanaryDeployment | undefined {
    return this.deployments.get(id);
  }

  getAll(): CanaryDeployment[] {
    return Array.from(this.deployments.values());
  }

  getActive(): CanaryDeployment | undefined {
    return Array.from(this.deployments.values()).find(d => d.status === 'in-progress');
  }
}
