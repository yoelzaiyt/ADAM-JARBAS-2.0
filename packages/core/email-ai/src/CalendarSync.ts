import { randomUUID } from 'node:crypto';
import type {
  CalendarSync as ICalendarSync,
  CalendarEvent,
  EmailMessage,
} from './interfaces.js';

export class CalendarSync implements ICalendarSync {
  private events: Map<string, CalendarEvent> = new Map();

  async createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent> {
    const id = randomUUID();
    const full: CalendarEvent = { ...event, id, createdAt: new Date() };
    this.events.set(id, full);
    return full;
  }

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const ev = this.events.get(eventId);
    if (!ev) throw new Error(`Event not found: ${eventId}`);
    Object.assign(ev, updates, { id: eventId });
    return ev;
  }

  async deleteEvent(eventId: string): Promise<void> { this.events.delete(eventId); }

  async getEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    return Array.from(this.events.values()).filter(e => e.start >= start && e.start <= end);
  }

  detectDates(message: EmailMessage): Date[] {
    const dates: Date[] = [];
    const text = `${message.subject} ${message.textBody}`;
    const patterns = text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/g) ?? [];
    for (const p of patterns) {
      const parts = p.split('/');
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      if (!isNaN(d.getTime())) dates.push(d);
    }
    return dates;
  }

  detectMeetingRequests(message: EmailMessage): { suggestedDates: Date[]; organizer: string; title: string } | null {
    const text = `${message.subject} ${message.textBody}`.toLowerCase();
    if (!text.includes('reunião') && !text.includes('meeting') && !text.includes('agendar')) return null;
    return {
      suggestedDates: this.detectDates(message),
      organizer: message.from.email,
      title: message.subject,
    };
  }
}
