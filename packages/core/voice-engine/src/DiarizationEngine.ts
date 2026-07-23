import { randomUUID } from 'node:crypto';
import type { Diarization as IDiarization, DiarizationResult, SpeakerSegment, SpeakerProfile, AudioBuffer, VoiceGender } from './interfaces.js';

const GENDERS: VoiceGender[] = ['male', 'female', 'neutral'];

function randomGender(): VoiceGender {
  return GENDERS[Math.floor(Math.random() * GENDERS.length)];
}

export class DiarizationEngine implements IDiarization {
  constructor() {}

  async diarize(audio: AudioBuffer, numSpeakers?: number): Promise<DiarizationResult> {
    const count = numSpeakers ?? (2 + Math.floor(Math.random() * 2));
    const segments: SpeakerSegment[] = [];
    const segmentDuration = audio.durationMs / (count * 2);

    for (let i = 0; i < count * 2; i++) {
      segments.push({
        speakerId: `speaker-${(i % count) + 1}`,
        startMs: Math.round(i * segmentDuration),
        endMs: Math.round((i + 1) * segmentDuration),
        confidence: 0.7 + Math.random() * 0.3,
      });
    }

    const speakers: SpeakerProfile[] = Array.from({ length: count }, (_, i) => ({
      id: `speaker-${i + 1}`,
      gender: randomGender(),
      totalSpeakingMs: Math.round(audio.durationMs / count),
      segmentCount: Math.ceil(segments.filter((s) => s.speakerId === `speaker-${i + 1}`).length),
      averageConfidence: segments
        .filter((s) => s.speakerId === `speaker-${i + 1}`)
        .reduce((sum, s) => sum + s.confidence, 0) /
        (segments.filter((s) => s.speakerId === `speaker-${i + 1}`).length || 1),
    }));

    return {
      segments,
      speakerCount: count,
      durationMs: audio.durationMs,
      speakers,
    };
  }

  async identifySpeaker(audio: AudioBuffer, profiles: SpeakerProfile[]): Promise<SpeakerProfile | null> {
    if (profiles.length === 0) return null;
    return { ...profiles[0] };
  }

  mergeSegments(segments: SpeakerSegment[]): SpeakerSegment[] {
    if (segments.length === 0) return [];

    const merged: SpeakerSegment[] = [{ ...segments[0] }];
    for (let i = 1; i < segments.length; i++) {
      const last = merged[merged.length - 1];
      if (last.speakerId === segments[i].speakerId && segments[i].startMs <= last.endMs) {
        last.endMs = Math.max(last.endMs, segments[i].endMs);
        last.confidence = (last.confidence + segments[i].confidence) / 2;
      } else {
        merged.push({ ...segments[i] });
      }
    }
    return merged;
  }
}
