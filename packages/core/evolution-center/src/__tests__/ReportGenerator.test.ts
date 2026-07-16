import { describe, it, expect } from 'vitest';
import { ReportGenerator, type ReportMetrics } from '../reports/ReportGenerator.js';

describe('ReportGenerator', () => {
  const gen = new ReportGenerator();
  const metrics: ReportMetrics = {
    period: '2026-07', startDate: new Date('2026-07-01'), endDate: new Date('2026-07-31'),
    summary: { users: 100, revenue: 50000 }, performance: { latency: 200, errors: 5 },
    quality: { coverage: 85, complexity: 12 }, costs: { ai: 1000, infra: 500 }
  };

  it('creates ReportGenerator', () => { expect(gen).toBeDefined(); });

  it('generates weekly report', () => {
    const report = gen.generateWeeklyReport(metrics);
    expect(report.type).toBe('weekly');
    expect(report.sections.length).toBe(4);
  });

  it('generates monthly report', () => {
    const report = gen.generateMonthlyReport(metrics);
    expect(report.type).toBe('monthly');
  });

  it('generates executive report', () => {
    const report = gen.generateExecutiveReport(metrics);
    expect(report.type).toBe('executive');
    expect(report.format).toBe('html');
  });

  it('exports report', () => {
    const report = gen.generateWeeklyReport(metrics);
    const exported = gen.exportReport(report.id);
    expect(exported).toContain('#');
  });

  it('gets latest report', () => {
    gen.generateWeeklyReport(metrics);
    const latest = gen.getLatest('weekly');
    expect(latest).toBeDefined();
  });
});
