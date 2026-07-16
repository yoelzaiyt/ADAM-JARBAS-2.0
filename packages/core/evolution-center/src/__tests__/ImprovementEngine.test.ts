import { describe, it, expect } from 'vitest';
import { ImprovementEngine, type ImprovementScanData } from '../improvement-engine/ImprovementEngine.js';

describe('ImprovementEngine', () => {
  const engine = new ImprovementEngine({
    enabled: true,
    scanInterval: 3600000,
    types: ['code-duplication', 'slow-api', 'inefficient-query', 'outdated-dependency', 'unused-component', 'low-test-coverage'],
    minSeverity: 'low'
  });

  it('creates ImprovementEngine', () => {
    expect(engine).toBeDefined();
  });

  it('detects code duplication', async () => {
    const data: ImprovementScanData = {
      duplications: [{ module: 'auth', files: ['a.ts', 'b.ts'], percentage: 40 }]
    };
    const results = await engine.detectImprovements(data);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe('code-duplication');
  });

  it('detects slow APIs', async () => {
    const data: ImprovementScanData = {
      slowAPIs: [{ endpoint: '/api/users', avgLatency: 2000, p95Latency: 5000 }]
    };
    const results = await engine.detectImprovements(data);
    expect(results.some(r => r.type === 'slow-api')).toBe(true);
  });

  it('detects inefficient queries', async () => {
    const data: ImprovementScanData = {
      inefficientQueries: [{ name: 'getUsers', location: 'db/queries.ts', executionTime: 3000, rowsScanned: 100000 }]
    };
    const results = await engine.detectImprovements(data);
    expect(results.some(r => r.type === 'inefficient-query')).toBe(true);
  });

  it('detects outdated dependencies', async () => {
    const data: ImprovementScanData = {
      outdatedDeps: [{ name: 'lodash', currentVersion: '3.0.0', latestVersion: '4.17.21', versionsBehind: 10, securityIssues: 2 }]
    };
    const results = await engine.detectImprovements(data);
    expect(results.some(r => r.type === 'outdated-dependency')).toBe(true);
  });

  it('detects unused components', async () => {
    const data: ImprovementScanData = {
      unusedComponents: [{ name: 'OldWidget', path: 'src/OldWidget.ts', daysSinceLastUse: 90, referenceCount: 0 }]
    };
    const results = await engine.detectImprovements(data);
    expect(results.some(r => r.type === 'unused-component')).toBe(true);
  });

  it('detects low test coverage', async () => {
    const data: ImprovementScanData = {
      lowCoverageModules: [{ name: 'auth', path: 'src/auth', coverage: 40, lines: 500, uncoveredLines: 300 }]
    };
    const results = await engine.detectImprovements(data);
    expect(results.some(r => r.type === 'low-test-coverage')).toBe(true);
  });

  it('filters by severity', async () => {
    const strictEngine = new ImprovementEngine({
      enabled: true, scanInterval: 3600000,
      types: ['unused-component'], minSeverity: 'high'
    });
    const data: ImprovementScanData = {
      unusedComponents: [{ name: 'OldWidget', path: 'src/OldWidget.ts', daysSinceLastUse: 90, referenceCount: 0 }]
    };
    const results = await strictEngine.detectImprovements(data);
    expect(results.length).toBe(0);
  });

  it('updates improvement status', async () => {
    const data: ImprovementScanData = {
      duplications: [{ module: 'auth', files: ['a.ts', 'b.ts'], percentage: 40 }]
    };
    await engine.detectImprovements(data);
    const all = engine.getAll();
    const first = all[0];
    const updated = engine.updateStatus(first.id, 'in-progress');
    expect(updated).toBe(true);
  });

  it('gets stats', async () => {
    const data: ImprovementScanData = {
      duplications: [{ module: 'auth', files: ['a.ts', 'b.ts'], percentage: 40 }],
      slowAPIs: [{ endpoint: '/api/users', avgLatency: 2000, p95Latency: 5000 }]
    };
    await engine.detectImprovements(data);
    const stats = engine.getStats();
    expect(stats.total).toBeGreaterThan(0);
  });
});
