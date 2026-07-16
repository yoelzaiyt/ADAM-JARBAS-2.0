import { describe, it, expect } from 'vitest';
import { CanaryManager } from '../canary-manager/CanaryManager.js';

describe('CanaryManager', () => {
  const manager = new CanaryManager();

  it('creates CanaryManager', () => { expect(manager).toBeDefined(); });

  it('creates deployment', () => {
    const dep = manager.createDeployment({ version: '1.1.0', strategy: 'canary', status: 'pending', targetPercentage: 100, stepSize: 10, interval: 60 });
    expect(dep.version).toBe('1.1.0');
    expect(dep.percentage).toBe(0);
  });

  it('starts deployment', () => {
    const dep = manager.createDeployment({ version: '1.1.0', strategy: 'canary', status: 'pending', targetPercentage: 100, stepSize: 10, interval: 60 });
    manager.startDeployment(dep.id);
    expect(manager.getById(dep.id)!.percentage).toBe(10);
  });

  it('advances deployment', () => {
    const dep = manager.createDeployment({ version: '1.1.0', strategy: 'canary', status: 'pending', targetPercentage: 30, stepSize: 10, interval: 60 });
    manager.startDeployment(dep.id);
    manager.advanceDeployment(dep.id);
    expect(manager.getById(dep.id)!.percentage).toBe(20);
  });

  it('completes when reaching target', () => {
    const dep = manager.createDeployment({ version: '1.1.0', strategy: 'canary', status: 'pending', targetPercentage: 20, stepSize: 20, interval: 60 });
    manager.startDeployment(dep.id);
    expect(manager.getById(dep.id)!.status).toBe('completed');
  });

  it('rolls back', () => {
    const dep = manager.createDeployment({ version: '1.1.0', strategy: 'canary', status: 'pending', targetPercentage: 100, stepSize: 10, interval: 60 });
    manager.startDeployment(dep.id);
    manager.rollback(dep.id);
    expect(manager.getById(dep.id)!.status).toBe('rolled-back');
  });

  it('checks health', () => {
    const dep = manager.createDeployment({ version: '1.1.0', strategy: 'canary', status: 'pending', targetPercentage: 100, stepSize: 10, interval: 60 });
    manager.addHealthCheck(dep.id, { name: 'api', status: 'passing', lastCheck: new Date(), details: 'ok' });
    expect(manager.isHealthy(dep.id)).toBe(true);
  });
});
