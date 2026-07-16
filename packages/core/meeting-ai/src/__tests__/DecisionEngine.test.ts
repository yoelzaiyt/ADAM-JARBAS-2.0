import { describe, it, expect, beforeEach } from 'vitest';
import { DecisionEngine } from '../DecisionEngine.js';

describe('DecisionEngine', () => {
  let engine: DecisionEngine;
  beforeEach(() => { engine = new DecisionEngine(); });

  it('should record decision', async () => {
    const d = await engine.record({
      meetingId: 'm1', description: 'Usar whisper', decidedBy: 'Joel',
      decidedAt: new Date(), reason: 'Melhor custo-benefício', impact: 'high', relatedEntities: [],
    });
    expect(d.id).toBeDefined();
    expect(d.description).toBe('Usar whisper');
  });

  it('should get decision by id', async () => {
    const d = await engine.record({
      meetingId: 'm1', description: 'Test', decidedBy: 'Joel',
      decidedAt: new Date(), reason: 'Razão', impact: 'medium', relatedEntities: [],
    });
    expect(engine.getDecision(d.id)).not.toBeNull();
  });

  it('should get decisions by meeting', async () => {
    await engine.record({ meetingId: 'm1', description: 'A', decidedBy: 'J', decidedAt: new Date(), reason: '', impact: 'low', relatedEntities: [] });
    await engine.record({ meetingId: 'm2', description: 'B', decidedBy: 'J', decidedAt: new Date(), reason: '', impact: 'low', relatedEntities: [] });
    expect(engine.getByMeeting('m1')).toHaveLength(1);
  });

  it('should link ADR', async () => {
    const d = await engine.record({ meetingId: 'm1', description: 'X', decidedBy: 'J', decidedAt: new Date(), reason: '', impact: 'low', relatedEntities: [] });
    await engine.linkADR(d.id, 'adr-001');
    expect(engine.getDecision(d.id)?.adrId).toBe('adr-001');
  });
});
