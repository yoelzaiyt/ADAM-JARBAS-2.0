import { randomUUID } from 'node:crypto';
import type {
  EmailGenerator as IEmailGenerator,
  GeneratedEmail,
  EmailType,
  Transcript,
  Summary,
  GeneratedTask,
  ExtractedEntity,
} from './interfaces.js';

export class EmailGenerator implements IEmailGenerator {
  async generateAta(meetingId: string, transcript: Transcript): Promise<GeneratedEmail> {
    return this.create(meetingId, 'ata', ['participantes'], 'Ata da Reunião', transcript.text);
  }

  async generateResumo(meetingId: string, summary: Summary): Promise<GeneratedEmail> {
    return this.create(meetingId, 'resumo', ['participantes'], 'Resumo da Reunião', summary.content);
  }

  async generateFollowUp(meetingId: string, tasks: GeneratedTask[]): Promise<GeneratedEmail> {
    const body = tasks.map(t => `- ${t.title} (${t.priority})`).join('\n');
    return this.create(meetingId, 'follow_up', ['participantes'], 'Follow-up da Reunião', body);
  }

  async generatePendencias(meetingId: string, entities: ExtractedEntity[]): Promise<GeneratedEmail> {
    const pendencias = entities.filter(e => e.type === 'pendencia');
    const body = pendencias.map(p => `- ${p.value}`).join('\n');
    return this.create(meetingId, 'pendencias', ['participantes'], 'Pendências da Reunião', body);
  }

  async generateProximaReuniao(meetingId: string, nextDate: Date): Promise<GeneratedEmail> {
    return this.create(meetingId, 'proxima_reuniao', ['participantes'], 'Próxima Reunião', `Próxima reunião: ${nextDate.toISOString()}`);
  }

  private create(meetingId: string, type: EmailType, to: string[], subject: string, body: string): GeneratedEmail {
    return {
      id: randomUUID(),
      meetingId,
      type,
      to,
      subject,
      body,
      format: 'plain',
      createdAt: new Date(),
    };
  }
}
