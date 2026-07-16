import { randomUUID } from 'node:crypto';
import type {
  DocumentGenerator as IDocumentGenerator,
  GeneratedDocument,
  ExportFormat,
} from './interfaces.js';

export class DocumentGenerator implements IDocumentGenerator {
  async generatePDF(meetingId: string, content: string, title: string): Promise<GeneratedDocument> {
    return this.create(meetingId, 'pdf', title, content);
  }

  async generateDOCX(meetingId: string, content: string, title: string): Promise<GeneratedDocument> {
    return this.create(meetingId, 'docx', title, content);
  }

  async generateMarkdown(meetingId: string, content: string, title: string): Promise<GeneratedDocument> {
    const md = `# ${title}\n\n${content}`;
    return this.create(meetingId, 'markdown', title, md);
  }

  async generateHTML(meetingId: string, content: string, title: string): Promise<GeneratedDocument> {
    const html = `<html><head><title>${title}</title></head><body><h1>${title}</h1><p>${content}</p></body></html>`;
    return this.create(meetingId, 'pdf', title, html);
  }

  async generateJSON(meetingId: string, data: Record<string, unknown>): Promise<GeneratedDocument> {
    return this.create(meetingId, 'json', 'Dados da Reunião', JSON.stringify(data));
  }

  async generateCSV(meetingId: string, data: Record<string, unknown>[]): Promise<GeneratedDocument> {
    if (data.length === 0) return this.create(meetingId, 'csv', 'Dados', '');
    const headers = Object.keys(data[0]!);
    const rows = data.map(row => headers.map(h => String(row[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    return this.create(meetingId, 'csv', 'Dados', csv);
  }

  private create(meetingId: string, format: ExportFormat, title: string, content: string): GeneratedDocument {
    return {
      id: randomUUID(),
      meetingId,
      title,
      format,
      content,
      sizeBytes: new TextEncoder().encode(content).length,
      createdAt: new Date(),
    };
  }
}
