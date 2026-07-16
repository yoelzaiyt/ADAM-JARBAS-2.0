import { randomUUID } from 'node:crypto';
import type {
  FollowUpEngine as IFollowUpEngine,
  FollowUp,
  EmailType,
} from './interfaces.js';

export class FollowUpEngine implements IFollowUpEngine {
  private followUps: Map<string, FollowUp> = new Map();

  async generateFollowUp(meetingId: string): Promise<FollowUp> {
    return this.create(meetingId, 'follow_up', 'Follow-up da reunião');
  }

  async generatePendencias(meetingId: string): Promise<FollowUp> {
    return this.create(meetingId, 'pendencias', 'Pendências da reunião');
  }

  async generateProximaReuniao(meetingId: string): Promise<FollowUp> {
    return this.create(meetingId, 'proxima_reuniao', 'Agendamento da próxima reunião');
  }

  async scheduleFollowUp(followUp: FollowUp, sendAt: Date): Promise<FollowUp> {
    followUp.sendAt = sendAt;
    this.followUps.set(followUp.id, followUp);
    return followUp;
  }

  getFollowUpsByMeeting(meetingId: string): FollowUp[] {
    return Array.from(this.followUps.values()).filter(f => f.meetingId === meetingId);
  }

  private create(meetingId: string, type: EmailType, subject: string): FollowUp {
    const id = randomUUID();
    const followUp: FollowUp = {
      id,
      meetingId,
      type,
      recipients: [],
      subject,
      content: `Conteúdo do follow-up para ${meetingId}`,
      sent: false,
      createdAt: new Date(),
    };
    this.followUps.set(id, followUp);
    return followUp;
  }
}
