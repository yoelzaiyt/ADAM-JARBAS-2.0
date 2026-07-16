import { describe, it, expect } from 'vitest';
import { ArchitectureReview } from '../architecture-review/ArchitectureReview.js';

describe('ArchitectureReview', () => {
  const review = new ArchitectureReview({
    enabled: true, principles: ['ddd', 'solid', 'clean-architecture', 'event-driven', 'loose-coupling', 'high-cohesion'],
    rules: []
  });

  it('creates ArchitectureReview', () => {
    expect(review).toBeDefined();
  });

  it('runs review with DDD violations', async () => {
    const violations = await review.runReview({
      imports: [{ from: 'infrastructure', to: 'domain', file: 'src/domain/User.ts' }]
    });
    expect(violations.some(v => v.principle === 'ddd')).toBe(true);
  });

  it('runs review with SOLID violations', async () => {
    const violations = await review.runReview({
      classes: [{ name: 'GodClass', path: 'src/GodClass.ts', methodCount: 20 }]
    });
    expect(violations.some(v => v.principle === 'solid')).toBe(true);
  });

  it('runs review with loose coupling violations', async () => {
    const violations = await review.runReview({
      modules: [{ name: 'auth', path: 'src/auth', internalImports: 15 }]
    });
    expect(violations.some(v => v.principle === 'loose-coupling')).toBe(true);
  });

  it('gets violation stats', async () => {
    await review.runReview({
      imports: [{ from: 'infrastructure', to: 'domain', file: 'test.ts' }],
      classes: [{ name: 'Big', path: 'big.ts', methodCount: 25 }]
    });
    const stats = review.getViolationStats();
    expect(stats.total).toBeGreaterThan(0);
  });

  it('gets all rules', () => {
    const rules = review.getAllRules();
    expect(rules.length).toBeGreaterThan(0);
  });

  it('adds custom rule', () => {
    const rule = review.addRule({
      name: 'Custom Rule', description: 'Test rule', principle: 'ddd',
      pattern: 'test', severity: 'low', enabled: true
    });
    expect(rule.id).toBeDefined();
  });
});
