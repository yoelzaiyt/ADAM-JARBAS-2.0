import { randomUUID } from 'node:crypto';
import type {
  Summarizer as ISummarizer,
  Summary,
  SummaryLevel,
  Transcript,
} from './interfaces.js';

export class Summarizer implements ISummarizer {
  private summaries: Map<string, Summary> = new Map();

  async generate(transcript: Transcript, level: SummaryLevel): Promise<Summary> {
    const content = this.buildContent(transcript, level);
    const keyPoints = this.extractKeyPoints(transcript);
    const id = randomUUID();
    const summary: Summary = { id, meetingId: transcript.meetingId, level, content, keyPoints, createdAt: new Date() };
    this.summaries.set(id, summary);
    return summary;
  }

  async generateAll(transcript: Transcript): Promise<Summary[]> {
    const levels: SummaryLevel[] = ['30s', '2min', 'executivo', 'tecnico', 'por_participante', 'por_assunto', 'por_projeto'];
    return Promise.all(levels.map(l => this.generate(transcript, l)));
  }

  getSummary(summaryId: string): Summary | null {
    return this.summaries.get(summaryId) ?? null;
  }

  getSummariesByMeeting(meetingId: string): Summary[] {
    return Array.from(this.summaries.values()).filter(s => s.meetingId === meetingId);
  }

  private buildContent(transcript: Transcript, level: SummaryLevel): string {
    const wordCount = transcript.text.split(' ').length;
    switch (level) {
      case '30s': return `Resumo rápido: ${wordCount} palavras discutidas.`;
      case '2min': return `Resumo de 2 minutos: Reunião com ${transcript.segments.length} segmentos, ${wordCount} palavras.`;
      case 'executivo': return `Resumo executivo: ${transcript.segments.length} intervenções registradas.`;
      case 'tecnico': return `Resumo técnico: ${transcript.segments.length} segmentos detalhados.`;
      case 'por_participante': return `Resumo por participante: ${[...new Set(transcript.segments.map(s => s.speakerId))].length} participantes.`;
      case 'por_assunto': return `Resumo por assunto: Assuntos principais extraídos.`;
      case 'por_projeto': return `Resumo por projeto: Projetos relacionados identificados.`;
    }
  }

  private extractKeyPoints(transcript: Transcript): string[] {
    return transcript.segments.slice(0, 3).map(s => s.text);
  }
}
