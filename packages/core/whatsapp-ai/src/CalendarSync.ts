import { randomUUID } from 'node:crypto';
import type {
  CalendarSync as ICalendarSync,
  CalendarEvent,
} from './interfaces.js';

export class CalendarSync implements ICalendarSync {
  private events: Map<string, CalendarEvent> = new Map();

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const id = randomUUID();
    const full: CalendarEvent = { ...event, id };
    this.events.set(id, full);
    return full;
  }

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const ev = this.events.get(eventId);
    if (!ev) throw new Error(`Event not found: ${eventId}`);
    Object.assign(ev, updates, { id: eventId });
    return ev;
  }

  async deleteEvent(eventId: string): Promise<void> {
    this.events.delete(eventId);
  }

  async getEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    return Array.from(this.events.values()).filter(
      e => e.start >= start && e.start <= end
    );
  }
}
