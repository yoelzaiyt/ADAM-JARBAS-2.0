import { describe, it, expect } from 'vitest';
import { BugCenter } from '../bug-center/BugCenter.js';

describe('BugCenter', () => {
  const center = new BugCenter();

  it('creates BugCenter', () => {
    expect(center).toBeDefined();
  });

  it('creates a bug', () => {
    const bug = center.createBug({
      title: 'Login fails', description: 'Users cannot login', priority: 'high', status: 'open',
      stepsToReproduce: '1. Go to login', expectedBehavior: 'Login works', actualBehavior: 'Error',
      affectedUsers: 50, affectedVersions: ['1.0'], module: 'auth', reporter: 'user1', labels: ['auth']
    });
    expect(bug.title).toBe('Login fails');
    expect(bug.priority).toBe('high');
  });

  it('updates bug status', () => {
    const bug = center.createBug({
      title: 'Test', description: '', priority: 'medium', status: 'open',
      stepsToReproduce: '', expectedBehavior: '', actualBehavior: '',
      affectedUsers: 1, affectedVersions: [], module: 'core', reporter: 'dev', labels: []
    });
    center.updateStatus(bug.id, 'resolved');
    expect(center.getById(bug.id)!.status).toBe('resolved');
    expect(center.getById(bug.id)!.resolvedAt).toBeDefined();
  });

  it('assigns bug', () => {
    const bug = center.createBug({
      title: 'Test', description: '', priority: 'low', status: 'open',
      stepsToReproduce: '', expectedBehavior: '', actualBehavior: '',
      affectedUsers: 0, affectedVersions: [], module: 'ui', reporter: 'qa', labels: []
    });
    center.assign(bug.id, 'dev1');
    expect(center.getById(bug.id)!.assignee).toBe('dev1');
  });

  it('gets critical bugs', () => {
    center.createBug({
      title: 'Critical', description: '', priority: 'critical', status: 'open',
      stepsToReproduce: '', expectedBehavior: '', actualBehavior: '',
      affectedUsers: 100, affectedVersions: [], module: 'core', reporter: 'sys', labels: []
    });
    expect(center.getCriticalBugs().length).toBeGreaterThan(0);
  });

  it('gets bugs by module', () => {
    center.createBug({
      title: 'Module Bug', description: '', priority: 'medium', status: 'open',
      stepsToReproduce: '', expectedBehavior: '', actualBehavior: '',
      affectedUsers: 5, affectedVersions: [], module: 'payments', reporter: 'dev', labels: []
    });
    expect(center.getByModule('payments').length).toBeGreaterThan(0);
  });

  it('gets stats', () => {
    const stats = center.getStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.byPriority).toBeDefined();
  });
});
