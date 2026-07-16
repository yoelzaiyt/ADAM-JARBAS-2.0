import type { MeetingAI } from './MeetingAI.js';
import type { MeetingConfig, Meeting } from './interfaces.js';

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export class APIHandler {
  private meetingAI: MeetingAI;

  constructor(meetingAI: MeetingAI) {
    this.meetingAI = meetingAI;
  }

  async startMeeting(config: MeetingConfig): Promise<APIResponse<Meeting>> {
    try {
      const meeting = await this.meetingAI.startMeeting(config);
      return { success: true, data: meeting };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async stopMeeting(meetingId: string): Promise<APIResponse<Meeting>> {
    try {
      const meeting = await this.meetingAI.endMeeting(meetingId);
      return { success: true, data: meeting };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getMeeting(meetingId: string): Promise<APIResponse<Meeting | null>> {
    return { success: true, data: this.meetingAI.controller.getMeeting(meetingId) };
  }

  async listMeetings(limit?: number): Promise<APIResponse<Meeting[]>> {
    return { success: true, data: this.meetingAI.controller.listMeetings(limit) };
  }

  async processMeeting(meetingId: string): Promise<APIResponse<unknown>> {
    try {
      const result = await this.meetingAI.processMeeting(meetingId);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async deleteMeeting(meetingId: string): Promise<APIResponse<void>> {
    try {
      await this.meetingAI.controller.deleteMeeting(meetingId);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async exportMeeting(meetingId: string, format: 'pdf' | 'docx' | 'markdown' | 'json'): Promise<APIResponse<unknown>> {
    try {
      const doc = await this.meetingAI.exportMeeting(meetingId, format);
      return { success: true, data: doc };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  getMetrics() {
    return this.meetingAI.monitoring.getMetrics();
  }

  getDashboard() {
    return this.meetingAI.monitoring.getDashboard();
  }
}
