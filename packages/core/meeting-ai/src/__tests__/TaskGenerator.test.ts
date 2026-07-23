import { describe, it, expect, beforeEach } from 'vitest';
import { TaskGenerator } from '../TaskGenerator.js';
import type { ExtractedEntity } from '../interfaces.js';

const entities: ExtractedEntity[] = [
  { type: 'decisao', value: 'Usar whisper', context: 'Decidimos usar whisper', confidence: 0.9, speakerId: 'Joel' },
  { type: 'pendencia', value: 'Criar proposta', context: 'Precisamos criar proposta', confidence: 0.85, speakerId: 'Ana' },
];

describe('TaskGenerator', () => {
  let gen: TaskGenerator;
  beforeEach(() => { gen = new TaskGenerator(); });

  it('should generate tasks from entities', async () => {
    const tasks = await gen.generateFromEntities(entities, 'm1');
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0].meetingId).toBe('m1');
    expect(tasks[0].status).toBe('pendente');
  });

  it('should generate tasks from text', async () => {
    const tasks = await gen.generateFromText('Criar proposta comercial. Definir prazo. Analisar custos.', 'm1');
    expect(tasks.length).toBeGreaterThan(0);
  });

  it('should get task by id', async () => {
    const tasks = await gen.generateFromEntities(entities, 'm1');
    expect(gen.getTask(tasks[0].id)).not.toBeNull();
  });

  it('should update task status', async () => {
    const tasks = await gen.generateFromEntities(entities, 'm1');
    const updated = await gen.updateStatus(tasks[0].id, 'em_progresso');
    expect(updated.status).toBe('em_progresso');
  });
});
