import { describe, it, expect } from 'vitest';
import { RollbackManager } from '../rollback-manager/RollbackManager.js';

describe('RollbackManager', () => {
  const manager = new RollbackManager();

  it('creates RollbackManager', () => { expect(manager).toBeDefined(); });

  it('initiates rollback', () => {
    const action = manager.initiateRollback({ releaseId: 'r1', targetVersion: '1.0.0', reason: 'Errors', triggers: [], initiatedBy: 'dev' });
    expect(action.status).toBe('pending');
  });

  it('executes rollback', () => {
    const action = manager.initiateRollback({ releaseId: 'r1', targetVersion: '1.0.0', reason: 'Test', triggers: [], initiatedBy: 'dev' });
    manager.execute(action.id);
    expect(manager.getById(action.id)!.status).toBe('in-progress');
  });

  it('completes rollback', () => {
    const action = manager.initiateRollback({ releaseId: 'r1', targetVersion: '1.0.0', reason: 'Test', triggers: [], initiatedBy: 'dev' });
    manager.execute(action.id);
    manager.complete(action.id);
    expect(manager.getById(action.id)!.status).toBe('completed');
  });

  it('detects triggers', () => {
    const triggers = manager.detectTriggers({ errorRate: 15, crashRate: 0, latency: 2000 });
    expect(triggers.some(t => t.type === 'error-rate')).toBe(true);
  });

  it('should rollback on critical triggers', () => {
    const triggers = [{ id: '1', type: 'error-rate' as const, threshold: 10, current: 20, triggered: true }];
    expect(manager.shouldRollback(triggers)).toBe(true);
  });

  it('gets stats', () => {
    manager.initiateRollback({ releaseId: 'r1', targetVersion: '1.0.0', reason: 'Test', triggers: [], initiatedBy: 'dev' });
    const stats = manager.getStats();
    expect(stats.total).toBeGreaterThan(0);
  });
});
