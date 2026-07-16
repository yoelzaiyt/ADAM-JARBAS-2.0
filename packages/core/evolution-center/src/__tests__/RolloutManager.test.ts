import { describe, it, expect } from 'vitest';
import { RolloutManager } from '../rollout-manager/RolloutManager.js';

describe('RolloutManager', () => {
  const manager = new RolloutManager();

  it('creates RolloutManager', () => { expect(manager).toBeDefined(); });

  it('creates rollout', () => {
    const rollout = manager.createRollout({ version: '1.1.0', groups: ['beta'], monitoring: true, autoHaltOnFailure: true, maxErrorRate: 5, maxLatencyIncrease: 1000 });
    expect(rollout.version).toBe('1.1.0');
    expect(rollout.percentage).toBe(0);
  });

  it('starts rollout', () => {
    const rollout = manager.createRollout({ version: '1.1.0', groups: [], monitoring: true, autoHaltOnFailure: true, maxErrorRate: 5, maxLatencyIncrease: 1000 });
    manager.start(rollout.id);
    expect(manager.getById(rollout.id)!.percentage).toBe(5);
  });

  it('advances rollout', () => {
    const rollout = manager.createRollout({ version: '1.1.0', groups: [], monitoring: true, autoHaltOnFailure: true, maxErrorRate: 5, maxLatencyIncrease: 1000 });
    manager.start(rollout.id);
    manager.advance(rollout.id, 20);
    expect(manager.getById(rollout.id)!.percentage).toBe(25);
  });

  it('halts rollout', () => {
    const rollout = manager.createRollout({ version: '1.1.0', groups: [], monitoring: true, autoHaltOnFailure: true, maxErrorRate: 5, maxLatencyIncrease: 1000 });
    manager.start(rollout.id);
    manager.halt(rollout.id, 'High error rate');
    expect(manager.getById(rollout.id)!.status).toBe('halted');
  });

  it('detects when should halt', () => {
    const rollout = manager.createRollout({ version: '1.1.0', groups: [], monitoring: true, autoHaltOnFailure: true, maxErrorRate: 5, maxLatencyIncrease: 1000 });
    expect(manager.shouldHalt(rollout, { errorRate: 10, latency: 500 })).toBe(true);
    expect(manager.shouldHalt(rollout, { errorRate: 1, latency: 100 })).toBe(false);
  });
});
