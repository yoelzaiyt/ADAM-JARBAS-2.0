import { randomUUID } from 'node:crypto';
import type {
  RecordingManager as IRecordingManager,
  Recording,
} from './interfaces.js';

export class RecordingManager implements IRecordingManager {
  private recordings: Map<string, Recording> = new Map();

  async startRecording(meetingId: string): Promise<Recording> {
    const id = randomUUID();
    const recording: Recording = {
      id,
      meetingId,
      filePath: `/recordings/${meetingId}/${id}.wav`,
      format: 'wav',
      sizeBytes: 0,
      durationMs: 0,
      createdAt: new Date(),
      encrypted: true,
    };
    this.recordings.set(meetingId, recording);
    return recording;
  }

  async stopRecording(meetingId: string): Promise<Recording> {
    const recording = this.recordings.get(meetingId);
    if (!recording) throw new Error(`No active recording for meeting: ${meetingId}`);
    return recording;
  }

  getRecording(meetingId: string): Recording | null {
    return this.recordings.get(meetingId) ?? null;
  }

  async deleteRecording(recordingId: string): Promise<void> {
    for (const [key, rec] of this.recordings) {
      if (rec.id === recordingId) { this.recordings.delete(key); return; }
    }
  }

  getRecordings(): Recording[] {
    return Array.from(this.recordings.values());
  }
}
