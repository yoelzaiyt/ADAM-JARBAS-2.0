import { randomUUID } from 'node:crypto';
import type {
  TimelineEngine as ITimelineEngine,
  Timeline,
  TimelineEntry,
  TranscriptionSegment,
  ExtractedEntity,
} from './interfaces.js';

export class TimelineEngine implements ITimelineEngine {
  private timelines: Map<string, Timeline> = new Map();

  generate(segments: TranscriptionSegment[], entities: ExtractedEntity[]): Timeline {
    const meetingId = segments[0]?.speakerId ?? 'unknown';
    const entries: TimelineEntry[] = [];

    const topicChanges = new Map<number, string>();
    for (const entity of entities) {
      if (entity.startMs !== undefined) {
        topicChanges.set(entity.startMs, entity.value);
      }
    }

    let lastSpeaker = '';
    for (const segment of segments) {
      if (segment.speakerId !== lastSpeaker) {
        entries.push({
          time: new Date(),
          offsetMs: segment.startMs,
          title: `Mudança de orador: ${segment.speakerId}`,
          description: segment.text.substring(0, 100),
          speakerId: segment.speakerId,
          type: 'topic_change',
        });
        lastSpeaker = segment.speakerId;
      }
    }

    for (const [offsetMs, value] of topicChanges) {
      entries.push({
        time: new Date(),
        offsetMs,
        title: value.substring(0, 80),
        description: value,
        type: 'important',
      });
    }

    entries.sort((a, b) => a.offsetMs - b.offsetMs);

    const timeline: Timeline = {
      id: randomUUID(),
      meetingId,
      entries,
      createdAt: new Date(),
    };
    this.timelines.set(timeline.meetingId, timeline);
    return timeline;
  }

  getTimeline(meetingId: string): Timeline | null {
    return this.timelines.get(meetingId) ?? null;
  }

  addEntry(meetingId: string, entry: Omit<TimelineEntry, 'offsetMs'>): void {
    const timeline = this.timelines.get(meetingId);
    if (timeline) {
      timeline.entries.push({ ...entry, offsetMs: 0 });
      timeline.entries.sort((a, b) => a.offsetMs - b.offsetMs);
    }
  }
}
