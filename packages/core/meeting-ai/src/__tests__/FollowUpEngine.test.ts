import { describe, it, expect, beforeEach } from 'vitest';
import { FollowUpEngine } from '../FollowUpEngine.js';

describe('FollowUpEngine', () => {
  let engine: FollowUpEngine;
  beforeEach(() => { engine = new FollowUpEngine(); });

  it('should generate follow-up', async () => {
    const fu = await engine.generateFollowUp('m1');
    expect(fu.type).toBe('follow_up');
    expect(fu.sent).toBe(false);
  });

  it('should generate pendencias', async () => {
    const fu = await engine.generatePendencias('m1');
    expect(fu.type).toBe('pendencias');
  });

  it('should generate proxima reuniao', async () => {
    const fu = await engine.generateProximaReuniao('m1');
    expect(fu.type).toBe('proxima_reuniao');
  });

  it('should schedule follow-up', async () => {
    const fu = await engine.generateFollowUp('m1');
    const scheduled = await engine.scheduleFollowUp(fu, new Date('2026-08-01'));
    expect(scheduled.sendAt).toBeDefined();
  });

  it('should get follow-ups by meeting', async () => {
    await engine.generateFollowUp('m1');
    await engine.generatePendencias('m1');
    expect(engine.getFollowUpsByMeeting('m1')).toHaveLength(2);
  });
});
