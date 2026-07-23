import { randomUUID } from 'node:crypto';
import type {
  TaskGenerator as ITaskGenerator,
  GeneratedTask,
  ExtractedEntity,
  Priority,
} from './interfaces.js';

export class TaskGenerator implements ITaskGenerator {
  private tasks: Map<string, GeneratedTask> = new Map();

  async generateFromEntities(entities: ExtractedEntity[], meetingId: string): Promise<GeneratedTask[]> {
    const results: GeneratedTask[] = [];
    const taskEntities = entities.filter(e => ['decisao', 'pendencia', 'ideia'].includes(e.type));

    for (const entity of taskEntities) {
      const id = randomUUID();
      const task: GeneratedTask = {
        id,
        meetingId,
        title: entity.value.substring(0, 80),
        description: entity.context,
        assignee: entity.speakerId,
        priority: entity.type === 'decisao' ? 'alta' : 'media',
        source: entity.type,
        createdAt: new Date(),
        status: 'pendente',
      };
      this.tasks.set(id, task);
      results.push(task);
    }
    return results;
  }

  async generateFromText(text: string, meetingId: string): Promise<GeneratedTask[]> {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const results: GeneratedTask[] = [];

    for (const sentence of sentences.slice(0, 5)) {
      const id = randomUUID();
      const task: GeneratedTask = {
        id,
        meetingId,
        title: sentence.trim().substring(0, 80),
        description: sentence.trim(),
        priority: 'media',
        source: 'texto',
        createdAt: new Date(),
        status: 'pendente',
      };
      this.tasks.set(id, task);
      results.push(task);
    }
    return results;
  }

  getTask(taskId: string): GeneratedTask | null {
    return this.tasks.get(taskId) ?? null;
  }

  getByMeeting(meetingId: string): GeneratedTask[] {
    return Array.from(this.tasks.values()).filter(t => t.meetingId === meetingId);
  }

  async updateStatus(taskId: string, status: GeneratedTask['status']): Promise<GeneratedTask> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    task.status = status;
    return task;
  }
}
