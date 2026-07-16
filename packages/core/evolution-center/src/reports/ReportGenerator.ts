import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { Report, ReportType, ReportSection } from '../interfaces.js';

export class ReportGenerator {
  private reports: Map<string, Report> = new Map();
  private log = createLogger('ReportGenerator');

  generateReport(type: ReportType, title: string, period: { start: Date; end: Date }, sections: ReportSection[], format: Report['format'] = 'markdown'): Report {
    const report: Report = {
      id: generateId(),
      type,
      title,
      period,
      sections,
      generatedAt: new Date(),
      format
    };
    this.reports.set(report.id, report);
    this.log(`Generated report: ${title} [${type}]`);
    return report;
  }

  generateWeeklyReport(metrics: ReportMetrics): Report {
    const sections: ReportSection[] = [
      { title: 'Summary', content: `Weekly report for ${metrics.period}`, metrics: metrics.summary, charts: [] },
      { title: 'Performance', content: 'System performance overview', metrics: metrics.performance, charts: ['latency-chart', 'error-chart'] },
      { title: 'Quality', content: 'Code quality metrics', metrics: metrics.quality, charts: ['coverage-chart'] },
      { title: 'Costs', content: 'Cost analysis', metrics: metrics.costs, charts: ['cost-chart'] },
    ];
    return this.generateReport('weekly', `Weekly Report - ${new Date().toISOString().split('T')[0]}`, { start: metrics.startDate, end: metrics.endDate }, sections);
  }

  generateMonthlyReport(metrics: ReportMetrics): Report {
    const sections: ReportSection[] = [
      { title: 'Executive Summary', content: 'Monthly overview', metrics: metrics.summary, charts: [] },
      { title: 'Platform Usage', content: 'User engagement and feature adoption', metrics: metrics.performance, charts: ['usage-chart'] },
      { title: 'Quality & Security', content: 'Quality and security metrics', metrics: metrics.quality, charts: ['quality-chart'] },
      { title: 'Financial', content: 'Cost breakdown and optimization', metrics: metrics.costs, charts: ['financial-chart'] },
    ];
    return this.generateReport('monthly', `Monthly Report - ${new Date().toISOString().slice(0, 7)}`, { start: metrics.startDate, end: metrics.endDate }, sections);
  }

  generateExecutiveReport(metrics: ReportMetrics): Report {
    const sections: ReportSection[] = [
      { title: 'KPIs', content: 'Key performance indicators', metrics: metrics.summary, charts: ['kpi-chart'] },
      { title: 'Strategic Initiatives', content: 'Progress on key initiatives', metrics: {}, charts: ['roadmap-chart'] },
    ];
    return this.generateReport('executive', 'Executive Report', { start: metrics.startDate, end: metrics.endDate }, sections, 'html');
  }

  getById(id: string): Report | undefined {
    return this.reports.get(id);
  }

  getAll(): Report[] {
    return Array.from(this.reports.values());
  }

  getByType(type: ReportType): Report[] {
    return Array.from(this.reports.values()).filter(r => r.type === type);
  }

  getLatest(type?: ReportType): Report | undefined {
    const reports = type ? this.getByType(type) : this.getAll();
    return reports.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())[0];
  }

  exportReport(id: string): string | null {
    const report = this.reports.get(id);
    if (!report) return null;

    let output = `# ${report.title}\n\n`;
    output += `Type: ${report.type}\n`;
    output += `Period: ${report.period.start.toISOString()} - ${report.period.end.toISOString()}\n`;
    output += `Generated: ${report.generatedAt.toISOString()}\n\n`;

    for (const section of report.sections) {
      output += `## ${section.title}\n\n`;
      output += `${section.content}\n\n`;
      if (Object.keys(section.metrics).length > 0) {
        output += '### Metrics\n\n';
        for (const [key, value] of Object.entries(section.metrics)) {
          output += `- ${key}: ${value}\n`;
        }
        output += '\n';
      }
    }

    return output;
  }
}

export interface ReportMetrics {
  period: string;
  startDate: Date;
  endDate: Date;
  summary: Record<string, number>;
  performance: Record<string, number>;
  quality: Record<string, number>;
  costs: Record<string, number>;
}
