import { describe, it, expect } from 'vitest';
import { MeetingAI } from '../MeetingAI.js';
import { APIHandler } from '../api.js';

describe('MeetingAI Orchestrator', () => {
  const ai = new MeetingAI({ defaultLanguage: 'pt', logLevel: 'debug' });

  it('should create with default config', () => {
    const config = ai.getConfig();
    expect(config.defaultLanguage).toBe('pt');
    expect(config.autoTranscribe).toBe(true);
  });

  it('should start and end meeting', async () => {
    const meeting = await ai.startMeeting({
      title: 'Test', type: 'online', participants: [{ id: 'u1', name: 'Joel', isHost: true }],
      sources: ['microfone'], language: 'pt', autoTranscribe: true, autoSummarize: true,
      autoExtractTasks: true, recordingConsent: true,
    });
    expect(meeting.status).toBe('em_andamento');
    const ended = await ai.endMeeting(meeting.id);
    expect(ended.status).toBe('concluida');
  });

  it('should process meeting', async () => {
    const meeting = await ai.startMeeting({
      title: 'Process Test', type: 'presencial', participants: [],
      sources: ['microfone'], language: 'pt', autoTranscribe: true, autoSummarize: true,
      autoExtractTasks: true, recordingConsent: true,
    });
    const result = await ai.processMeeting(meeting.id);
    expect(result.transcript).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.analytics).toBeDefined();
    expect(result.sentiment).toBeDefined();
    expect(result.timeline).toBeDefined();
  });

  it('should export meeting', async () => {
    const meeting = await ai.startMeeting({
      title: 'Export Test', type: 'online', participants: [],
      sources: ['microfone'], language: 'pt', autoTranscribe: true, autoSummarize: true,
      autoExtractTasks: true, recordingConsent: true,
    });
    const doc = await ai.exportMeeting(meeting.id, 'markdown');
    expect(doc.format).toBe('markdown');
  });

  it('should expose monitoring', () => {
    expect(ai.monitoring.getMetrics()).toBeDefined();
    expect(ai.monitoring.getDashboard()).toBeDefined();
  });
});

describe('APIHandler', () => {
  const ai = new MeetingAI();
  const api = new APIHandler(ai);

  it('should start meeting via API', async () => {
    const res = await api.startMeeting({
      title: 'API Test', type: 'online', participants: [],
      sources: ['microfone'], language: 'pt', autoTranscribe: true, autoSummarize: true,
      autoExtractTasks: true, recordingConsent: true,
    });
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
  });

  it('should list meetings via API', async () => {
    const res = await api.listMeetings();
    expect(res.success).toBe(true);
  });

  it('should get metrics via API', () => {
    const metrics = api.getMetrics();
    expect(metrics).toBeDefined();
  });
});
