import { describe, it, expect } from 'vitest';
import { DependencyReview } from '../dependency-review/DependencyReview.js';

describe('DependencyReview', () => {
  const review = new DependencyReview({ enabled: true, checkInterval: 3600000, allowedLicenses: ['MIT', 'Apache-2.0', 'BSD-3-Clause'], maxSecurityIssues: 0 });

  it('creates DependencyReview', () => { expect(review).toBeDefined(); });

  it('analyzes dependencies', async () => {
    const analysis = await review.analyzeDependencies([
      { name: 'lodash', currentVersion: '3.0.0', latestVersion: '4.17.21', license: 'MIT', deprecated: false, securityIssues: 2, outdated: true, size: 100 },
      { name: 'old-lib', currentVersion: '1.0.0', latestVersion: '2.0.0', license: 'GPL-3.0', deprecated: true, securityIssues: 0, outdated: true, size: 50 }
    ]);
    expect(analysis.outdated).toBe(2);
    expect(analysis.deprecated).toBe(1);
    expect(analysis.securityIssues).toBe(1);
  });

  it('gets outdated dependencies', async () => {
    await review.analyzeDependencies([
      { name: 'old', currentVersion: '1.0', latestVersion: '2.0', license: 'MIT', deprecated: false, securityIssues: 0, outdated: true, size: 10 }
    ]);
    expect(review.getOutdated().length).toBeGreaterThan(0);
  });

  it('gets insecure dependencies', async () => {
    await review.analyzeDependencies([
      { name: 'vuln', currentVersion: '1.0', latestVersion: '1.1', license: 'MIT', deprecated: false, securityIssues: 3, outdated: false, size: 10 }
    ]);
    expect(review.getInsecure().length).toBeGreaterThan(0);
  });
});
