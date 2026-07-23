import { randomUUID } from 'node:crypto';
import type {
  CalendarSync as ICalendarSync,
  CalendarEvent,
  Meeting,
  CalendarProvider,
} from './interfaces.js';

export class CalendarSync implements ICalendarSync {
  private events: Map<string, CalendarEvent> = new Map();

  async createEvent(meeting: Meeting): Promise<CalendarEvent> {
    const id = randomUUID();
    const event: CalendarEvent = {
      id,
      meetingId: meeting.id,
      title: meeting.title,
      start: meeting.startedAt,
      end: meeting.endedAt ?? new Date(meeting.startedAt.getTime() + 3600000),
      participants: meeting.participants.map(p => p.email ?? p.name),
      provider: 'google',
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const event = this.events.get(eventId);
    if (!event) throw new Error(`Event not found: ${eventId}`);
    Object.assign(event, updates, { id: eventId });
    return event;
  }

  async deleteEvent(eventId: string): Promise<void> {
    this.events.delete(eventId);
  }

  async getEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    return Array.from(this.events.values()).filter(e => e.start >= start && e.end <= end);
  }

  async sync(): Promise<void> {}
}
