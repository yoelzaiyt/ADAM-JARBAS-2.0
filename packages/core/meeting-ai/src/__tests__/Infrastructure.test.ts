import { describe, it, expect, beforeEach } from 'vitest';
import { RealtimeStream } from '../RealtimeStream.js';
import { MonitoringEngine } from '../Monitoring.js';
import { RecordingManager } from '../RecordingManager.js';
import { PermissionManager } from '../PermissionManager.js';
import { EmailGenerator } from '../EmailGenerator.js';
import { DocumentGenerator } from '../DocumentGenerator.js';
import { CalendarSync } from '../CalendarSync.js';
import { CRMSync } from '../CRMSync.js';
import { ProjectSync } from '../ProjectSync.js';
import { TimelineEngine } from '../TimelineEngine.js';
import { MeetingAnalyticsEngine } from '../MeetingAnalytics.js';
import type { StreamEvent, Transcript, TranscriptionSegment, ExtractedEntity, Meeting } from '../interfaces.js';
import { vi } from 'vitest';

describe('RealtimeStream', () => {
  const stream = new RealtimeStream();

  it('should subscribe and broadcast', () => {
    const cb = vi.fn();
    stream.subscribe('m1', cb);
    expect(stream.getSubscribers('m1')).toBe(1);
    stream.broadcast({ type: 'transcript', meetingId: 'm1', timestamp: new Date(), data: {} });
    expect(cb).toHaveBeenCalled();
  });

  it('should unsubscribe', () => {
    const cb = vi.fn();
    stream.subscribe('m1', cb);
    stream.unsubscribe('m1', cb);
    stream.broadcast({ type: 'transcript', meetingId: 'm1', timestamp: new Date(), data: {} });
    expect(cb).not.toHaveBeenCalled();
  });
});

describe('MonitoringEngine', () => {
  let monitor: MonitoringEngine;
  beforeEach(() => { monitor = new MonitoringEngine(); });

  it('should record metrics', () => {
    monitor.recordMetric('totalMeetings', 10);
    expect(monitor.getMetrics().totalMeetings).toBe(10);
  });

  it('should record errors', () => {
    monitor.recordMetric('totalMeetings', 10);
    monitor.recordError({ module: 'stt', message: 'fail', severity: 'high' });
    expect(monitor.getMetrics().errorRate).toBeGreaterThan(0);
  });

  it('should get dashboard', () => {
    const dash = monitor.getDashboard();
    expect(dash.uptime).toBeGreaterThanOrEqual(0);
    expect(dash.status).toBeDefined();
  });

  it('should reset', () => {
    monitor.recordMetric('totalMeetings', 5);
    monitor.reset();
    expect(monitor.getMetrics().totalMeetings).toBe(0);
  });
});

describe('RecordingManager', () => {
  let rm: RecordingManager;
  beforeEach(() => { rm = new RecordingManager(); });

  it('should start and stop recording', async () => {
    const rec = await rm.startRecording('m1');
    expect(rec.meetingId).toBe('m1');
    expect(rec.encrypted).toBe(true);
  });

  it('should get recording', async () => {
    await rm.startRecording('m1');
    expect(rm.getRecording('m1')).not.toBeNull();
  });

  it('should get recordings list', async () => {
    await rm.startRecording('m1');
    expect(rm.getRecordings()).toHaveLength(1);
  });
});

describe('PermissionManager', () => {
  let pm: PermissionManager;
  beforeEach(() => { pm = new PermissionManager(); });

  it('should grant and check permission', () => {
    pm.grantPermission('u1', 'm1', 'gravar');
    expect(pm.checkPermission('u1', 'm1', 'gravar')).toBe(true);
    expect(pm.checkPermission('u1', 'm1', 'exportar')).toBe(false);
  });

  it('should revoke permission', () => {
    pm.grantPermission('u1', 'm1', 'gravar');
    pm.revokePermission('u1', 'm1', 'gravar');
    expect(pm.checkPermission('u1', 'm1', 'gravar')).toBe(false);
  });

  it('should record and check consent', () => {
    pm.recordConsent({ userId: 'u1', meetingId: 'm1', consented: true, timestamp: new Date() });
    expect(pm.hasConsent('m1', 'u1')).toBe(true);
  });
});

describe('EmailGenerator', () => {
  const gen = new EmailGenerator();

  it('should generate ata', async () => {
    const transcript: Transcript = { id: 't1', meetingId: 'm1', version: 'completa', segments: [], text: 'Ata da reunião', createdAt: new Date() };
    const email = await gen.generateAta('m1', transcript);
    expect(email.type).toBe('ata');
    expect(email.body).toContain('Ata');
  });
});

describe('DocumentGenerator', () => {
  const gen = new DocumentGenerator();

  it('should generate PDF', async () => {
    const doc = await gen.generatePDF('m1', 'Content', 'Title');
    expect(doc.format).toBe('pdf');
    expect(doc.sizeBytes).toBeGreaterThan(0);
  });

  it('should generate JSON', async () => {
    const doc = await gen.generateJSON('m1', { key: 'value' });
    expect(doc.format).toBe('json');
    expect(doc.content).toContain('value');
  });

  it('should generate CSV', async () => {
    const doc = await gen.generateCSV('m1', [{ a: '1', b: '2' }]);
    expect(doc.format).toBe('csv');
    expect(doc.content).toContain('a,b');
  });
});

describe('MeetingAnalyticsEngine', () => {
  const engine = new MeetingAnalyticsEngine();

  it('should calculate analytics', () => {
    const segments: TranscriptionSegment[] = [
      { id: 's1', speakerId: 'sp1', text: 'A', startMs: 0, endMs: 1000, confidence: 0.9, words: [] },
      { id: 's2', speakerId: 'sp2', text: 'B', startMs: 1000, endMs: 2000, confidence: 0.85, words: [] },
    ];
    const analytics = engine.calculate(segments, [], [], []);
    expect(analytics.totalDurationMs).toBe(2000);
    expect(analytics.participantStats).toHaveLength(2);
  });

  it('should get participant stats', () => {
    const segments: TranscriptionSegment[] = [
      { id: 's1', speakerId: 'sp1', text: 'A', startMs: 0, endMs: 1000, confidence: 0.9, words: [] },
    ];
    const stats = engine.getParticipantStats(segments);
    expect(stats[0].interventionCount).toBe(1);
  });
});
