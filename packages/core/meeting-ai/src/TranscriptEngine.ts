import { randomUUID } from 'node:crypto';
import type {
  TranscriptEngine as ITranscriptEngine,
  Transcript,
  TranscriptVersion,
  TranscriptionSegment,
} from './interfaces.js';

export class TranscriptEngine implements ITranscriptEngine {
  private transcripts: Map<string, Transcript> = new Map();

  async generateFull(meetingId: string, segments: TranscriptionSegment[]): Promise<Transcript> {
    return this.create(meetingId, 'completa', segments);
  }

  async generateClean(meetingId: string, segments: TranscriptionSegment[]): Promise<Transcript> {
    const cleaned = segments.map(s => ({ ...s, text: s.text.replace(/\s+/g, ' ').trim() }));
    return this.create(meetingId, 'limpa', cleaned);
  }

  async generateSummary(meetingId: string, segments: TranscriptionSegment[]): Promise<Transcript> {
    const summary = segments.slice(0, Math.max(1, Math.ceil(segments.length / 3)));
    return this.create(meetingId, 'resumida', summary);
  }

  async generateExecutive(meetingId: string, segments: TranscriptionSegment[]): Promise<Transcript> {
    const key = segments.filter(s => s.confidence > 0.9);
    return this.create(meetingId, 'executiva', key.length > 0 ? key : segments.slice(0, 2));
  }

  async generateTechnical(meetingId: string, segments: TranscriptionSegment[]): Promise<Transcript> {
    return this.create(meetingId, 'tecnica', segments);
  }

  async generateChronological(meetingId: string, segments: TranscriptionSegment[]): Promise<Transcript> {
    const sorted = [...segments].sort((a, b) => a.startMs - b.startMs);
    return this.create(meetingId, 'cronologica', sorted);
  }

  getTranscript(transcriptId: string): Transcript | null {
    return this.transcripts.get(transcriptId) ?? null;
  }

  getTranscriptsByMeeting(meetingId: string): Transcript[] {
    return Array.from(this.transcripts.values()).filter(t => t.meetingId === meetingId);
  }

  private create(meetingId: string, version: TranscriptVersion, segments: TranscriptionSegment[]): Transcript {
    const id = randomUUID();
    const text = segments.map(s => s.text).join('\n');
    const transcript: Transcript = {
      id,
      meetingId,
      version,
      segments,
      text,
      createdAt: new Date(),
    };
    this.transcripts.set(id, transcript);
    return transcript;
  }
}
