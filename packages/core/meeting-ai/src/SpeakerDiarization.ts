import { randomUUID } from 'node:crypto';
import type {
  SpeakerDiarization as ISpeakerDiarization,
  DiarizationResult,
  Speaker,
  SpeakerSegment,
  AudioChunk,
} from './interfaces.js';

export class SpeakerDiarization implements ISpeakerDiarization {
  private speakersByMeeting: Map<string, Speaker[]> = new Map();

  async diarize(audioChunks: AudioChunk[], numSpeakers?: number): Promise<DiarizationResult> {
    const count = numSpeakers ?? 2;
    const totalDuration = audioChunks.reduce((sum, c) => sum + c.durationMs, 0);
    const segmentDuration = totalDuration / (count * 2);
    const segments: SpeakerSegment[] = [];

    for (let i = 0; i < count * 2; i++) {
      segments.push({
        speakerId: `speaker-${(i % count) + 1}`,
        startMs: Math.round(i * segmentDuration),
        endMs: Math.round((i + 1) * segmentDuration),
        confidence: 0.7 + Math.random() * 0.3,
      });
    }

    const speakers: Speaker[] = Array.from({ length: count }, (_, i) => {
      const id = `speaker-${i + 1}`;
      const speakerSegs = segments.filter(s => s.speakerId === id);
      return {
        id,
        totalSpeakingMs: speakerSegs.reduce((sum, s) => sum + (s.endMs - s.startMs), 0),
        segmentCount: speakerSegs.length,
        averageConfidence: speakerSegs.reduce((sum, s) => sum + s.confidence, 0) / (speakerSegs.length || 1),
      };
    });

    return { speakers, segments, speakerCount: count };
  }

  async identifySpeaker(name: string, audioChunks: AudioChunk[]): Promise<void> {
    const totalDuration = audioChunks.reduce((sum, c) => sum + c.durationMs, 0);
    const meetingId = audioChunks[0]?.meetingId ?? 'unknown';
    let speakers = this.speakersByMeeting.get(meetingId) ?? [];
    const existing = speakers.find(s => s.id === name);
    if (existing) {
      existing.totalSpeakingMs += totalDuration;
      existing.segmentCount++;
    } else {
      speakers.push({
        id: name,
        name,
        totalSpeakingMs: totalDuration,
        segmentCount: 1,
        averageConfidence: 0.9,
      });
    }
    this.speakersByMeeting.set(meetingId, speakers);
  }

  getSpeakers(meetingId: string): Speaker[] {
    return this.speakersByMeeting.get(meetingId) ?? [];
  }
}
