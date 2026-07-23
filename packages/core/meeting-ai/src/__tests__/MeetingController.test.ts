import { describe, it, expect, beforeEach } from 'vitest';
import { MeetingController } from '../MeetingController.js';
import type { MeetingConfig } from '../interfaces.js';

const config: MeetingConfig = {
  title: 'Reunião Sprint 05',
  type: 'online',
  participants: [{ id: 'u1', name: 'Joel', email: 'joel@jarbas.ai', isHost: true }],
  sources: ['microfone'],
  language: 'pt',
  autoTranscribe: true,
  autoSummarize: true,
  autoExtractTasks: true,
  recordingConsent: true,
};

describe('MeetingController', () => {
  let controller: MeetingController;
  beforeEach(() => { controller = new MeetingController(); });

  it('should start a meeting', async () => {
    const meeting = await controller.startMeeting(config);
    expect(meeting.id).toBeDefined();
    expect(meeting.title).toBe('Reunião Sprint 05');
    expect(meeting.status).toBe('em_andamento');
    expect(meeting.participants).toHaveLength(1);
  });

  it('should end a meeting', async () => {
    const meeting = await controller.startMeeting(config);
    const ended = await controller.endMeeting(meeting.id);
    expect(ended.status).toBe('concluida');
    expect(ended.endedAt).toBeDefined();
    expect(ended.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should throw ending unknown meeting', async () => {
    await expect(controller.endMeeting('fake')).rejects.toThrow('Meeting not found');
  });

  it('should get meeting by id', async () => {
    const meeting = await controller.startMeeting(config);
    expect(controller.getMeeting(meeting.id)?.title).toBe('Reunião Sprint 05');
  });

  it('should return null for unknown meeting', () => {
    expect(controller.getMeeting('unknown')).toBeNull();
  });

  it('should list meetings', async () => {
    await controller.startMeeting(config);
    await controller.startMeeting({ ...config, title: 'Reunião 2' });
    expect(controller.listMeetings()).toHaveLength(2);
  });

  it('should update meeting', async () => {
    const meeting = await controller.startMeeting(config);
    const updated = await controller.updateMeeting(meeting.id, { title: 'Updated' });
    expect(updated.title).toBe('Updated');
  });

  it('should delete meeting', async () => {
    const meeting = await controller.startMeeting(config);
    await controller.deleteMeeting(meeting.id);
    expect(controller.getMeeting(meeting.id)).toBeNull();
  });
});
