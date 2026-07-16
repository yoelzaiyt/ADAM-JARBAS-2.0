import { describe, it, expect } from 'vitest';
import { SecurityReview } from '../security-review/SecurityReview.js';

describe('SecurityReview', () => {
  const review = new SecurityReview({ enabled: true, checkInterval: 3600000, vulnerabilityDB: 'nvd', autoScan: true });

  it('creates SecurityReview', () => { expect(review).toBeDefined(); });

  it('detects known vulnerabilities', async () => {
    const results = await review.runReview({
      dependencies: [{ name: 'lodash', knownVulnerabilities: 2, cveId: 'CVE-2021-23337', cvssScore: 7.5, severity: 'high' }]
    });
    expect(results.some(v => v.type === 'known-vulnerability')).toBe(true);
  });

  it('detects exposed secrets', async () => {
    const results = await review.runReview({
      exposedSecrets: [{ type: 'API_KEY', location: 'src/config.ts' }]
    });
    expect(results.some(v => v.type === 'exposed-secret')).toBe(true);
    expect(results[0].severity).toBe('critical');
  });

  it('detects insecure configs', async () => {
    const results = await review.runReview({
      insecureConfigs: [{ name: 'CORS', details: 'Allow all origins', component: 'api', severity: 'high', recommendation: 'Restrict CORS' }]
    });
    expect(results.some(v => v.type === 'insecure-config')).toBe(true);
  });

  it('gets stats', async () => {
    await review.runReview({ dependencies: [{ name: 'test', knownVulnerabilities: 1, severity: 'medium' }] });
    const stats = review.getStats();
    expect(stats.total).toBeGreaterThan(0);
  });

  it('gets critical vulnerabilities', async () => {
    await review.runReview({ exposedSecrets: [{ type: 'SECRET', location: '.env' }] });
    expect(review.getCriticalVulnerabilities().length).toBeGreaterThan(0);
  });
});
