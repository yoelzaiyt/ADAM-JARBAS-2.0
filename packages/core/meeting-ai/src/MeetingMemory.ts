import type {
  MeetingMemory as IMeetingMemory,
  MemoryEntry,
} from './interfaces.js';

export class MeetingMemory implements IMeetingMemory {
  private entries: Map<string, MemoryEntry> = new Map();
  private links: Map<string, Set<string>> = new Map();

  async save(entry: MemoryEntry): Promise<void> {
    this.entries.set(entry.meetingId, entry);
  }

  get(meetingId: string): MemoryEntry | null {
    return this.entries.get(meetingId) ?? null;
  }

  search(query: string): MemoryEntry[] {
    const lower = query.toLowerCase();
    return Array.from(this.entries.values()).filter(e =>
      e.topics.some(t => t.toLowerCase().includes(lower)) ||
      e.participants.some(p => p.name.toLowerCase().includes(lower)) ||
      e.projects.some(p => p.toLowerCase().includes(lower))
    );
  }

  async linkMeetings(id1: string, id2: string): Promise<void> {
    let links1 = this.links.get(id1);
    if (!links1) { links1 = new Set(); this.links.set(id1, links1); }
    links1.add(id2);

    let links2 = this.links.get(id2);
    if (!links2) { links2 = new Set(); this.links.set(id2, links2); }
    links2.add(id1);
  }

  getRelatedMeetings(meetingId: string): string[] {
    return Array.from(this.links.get(meetingId) ?? []);
  }
}
