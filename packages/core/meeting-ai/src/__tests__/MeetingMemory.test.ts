import { describe, it, expect, beforeEach } from 'vitest';
import { MeetingMemory } from '../MeetingMemory.js';

describe('MeetingMemory', () => {
  let memory: MeetingMemory;
  beforeEach(() => { memory = new MeetingMemory(); });

  it('should save and get entry', async () => {
    await memory.save({
      meetingId: 'm1', participants: [{ id: 'u1', name: 'Joel', isHost: true }],
      projects: ['Jarbas'], topics: ['Sprint 05'], decisions: ['Usar whisper'],
      actions: ['Criar proposta'], files: [], relationships: {},
    });
    const entry = memory.get('m1');
    expect(entry).not.toBeNull();
    expect(entry?.projects).toContain('Jarbas');
  });

  it('should search entries', async () => {
    await memory.save({
      meetingId: 'm1', participants: [], projects: ['Jarbas'], topics: ['Sprint'],
      decisions: [], actions: [], files: [], relationships: {},
    });
    expect(memory.search('Jarbas')).toHaveLength(1);
    expect(memory.search('nada')).toHaveLength(0);
  });

  it('should link meetings', async () => {
    await memory.linkMeetings('m1', 'm2');
    expect(memory.getRelatedMeetings('m1')).toContain('m2');
    expect(memory.getRelatedMeetings('m2')).toContain('m1');
  });
});
