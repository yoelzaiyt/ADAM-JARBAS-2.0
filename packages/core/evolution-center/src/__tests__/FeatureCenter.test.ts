import { describe, it, expect } from 'vitest';
import { FeatureCenter } from '../feature-center/FeatureCenter.js';

describe('FeatureCenter', () => {
  const center = new FeatureCenter();

  it('creates FeatureCenter', () => {
    expect(center).toBeDefined();
  });

  it('creates a feature request', () => {
    const feature = center.createFeature({
      title: 'Dark Mode', description: 'Add dark mode', status: 'requested',
      priority: 'medium', requester: 'user1', estimatedEffort: 'medium', tags: ['ui']
    });
    expect(feature.title).toBe('Dark Mode');
    expect(feature.votes).toBe(0);
  });

  it('votes on feature', () => {
    const feature = center.createFeature({
      title: 'Test', description: '', status: 'requested', priority: 'medium',
      requester: 'user1', estimatedEffort: 'easy', tags: []
    });
    center.vote(feature.id);
    center.vote(feature.id);
    expect(center.getById(feature.id)!.votes).toBe(2);
  });

  it('adds feedback', () => {
    const feature = center.createFeature({
      title: 'Test', description: '', status: 'requested', priority: 'medium',
      requester: 'user1', estimatedEffort: 'easy', tags: []
    });
    center.addFeedback(feature.id, 'Great idea!');
    expect(center.getById(feature.id)!.feedback.length).toBe(1);
  });

  it('updates status', () => {
    const feature = center.createFeature({
      title: 'Test', description: '', status: 'requested', priority: 'medium',
      requester: 'user1', estimatedEffort: 'easy', tags: []
    });
    center.updateStatus(feature.id, 'released');
    expect(center.getById(feature.id)!.status).toBe('released');
    expect(center.getById(feature.id)!.releasedAt).toBeDefined();
  });

  it('gets top voted', () => {
    const f1 = center.createFeature({ title: 'A', description: '', status: 'requested', priority: 'low', requester: 'u1', estimatedEffort: 'easy', tags: [] });
    const f2 = center.createFeature({ title: 'B', description: '', status: 'requested', priority: 'low', requester: 'u1', estimatedEffort: 'easy', tags: [] });
    center.vote(f1.id); center.vote(f1.id); center.vote(f1.id);
    center.vote(f2.id);
    const top = center.getTopVoted(1);
    expect(top[0].id).toBe(f1.id);
  });

  it('gets stats', () => {
    const stats = center.getStats();
    expect(stats.total).toBeGreaterThan(0);
  });
});
