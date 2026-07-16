import { randomUUID } from 'node:crypto';
import type {
  MeetingController as IMeetingController,
  Meeting,
  MeetingConfig,
  MeetingStatus,
} from './interfaces.js';

export class MeetingController implements IMeetingController {
  private meetings: Map<string, Meeting> = new Map();

  async startMeeting(config: MeetingConfig): Promise<Meeting> {
    const id = randomUUID();
    const now = new Date();
    const meeting: Meeting = {
      id,
      title: config.title,
      type: config.type,
      status: 'em_andamento',
      participants: config.participants,
      sources: config.sources,
      language: config.language,
      startedAt: now,
      durationMs: 0,
      metadata: {},
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async endMeeting(meetingId: string): Promise<Meeting> {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) throw new Error(`Meeting not found: ${meetingId}`);
    const endedAt = new Date();
    meeting.endedAt = endedAt;
    meeting.durationMs = endedAt.getTime() - meeting.startedAt.getTime();
    meeting.status = 'concluida';
    return meeting;
  }

  getMeeting(meetingId: string): Meeting | null {
    return this.meetings.get(meetingId) ?? null;
  }

  listMeetings(limit: number = 50): Meeting[] {
    return Array.from(this.meetings.values())
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  async updateMeeting(meetingId: string, updates: Partial<Meeting>): Promise<Meeting> {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) throw new Error(`Meeting not found: ${meetingId}`);
    Object.assign(meeting, updates, { id: meetingId });
    return meeting;
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    if (!this.meetings.has(meetingId)) throw new Error(`Meeting not found: ${meetingId}`);
    this.meetings.delete(meetingId);
  }
}
