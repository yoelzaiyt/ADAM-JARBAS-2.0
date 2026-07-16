import { describe, it, expect, beforeEach } from 'vitest';
import { Projects } from '../projects/Projects.js';

const CID = 'comp-1';

function projectData(overrides = {}) {
  return {
    companyId: CID,
    name: 'Project Phoenix',
    description: 'Next-gen platform',
    status: 'active' as const,
    priority: 'high' as const,
    managerId: 'mgr-1',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    budget: 200000,
    tags: [],
    milestones: [],
    ...overrides,
  };
}

describe('Projects', () => {
  let projects: Projects;

  beforeEach(() => {
    projects = new Projects();
  });

  it('creates and retrieves a project', async () => {
    const p = await projects.createProject(projectData());
    expect(p.id).toBeDefined();
    expect(p.spent).toBe(0);
    const found = await projects.getProjectById(p.id);
    expect(found?.name).toBe('Project Phoenix');
  });

  it('creates epic, task, and sprint hierarchy', async () => {
    const p = await projects.createProject(projectData());
    const epic = await projects.createEpic({ projectId: p.id, name: 'Auth Module', status: 'in_progress', priority: 'high', description: 'Auth epic', color: '#f00' });
    const sprint = await projects.createSprint({ projectId: p.id, name: 'Sprint 1', status: 'active', startDate: new Date(), endDate: new Date(), totalPoints: 20, goal: 'Ship auth' });
    const task = await projects.createTask({ projectId: p.id, epicId: epic.id, sprintId: sprint.id, title: 'Login page', status: 'todo', type: 'story', priority: 'high', storyPoints: 5, assigneeId: 'dev-1', description: '', labels: [], comments: [], checklist: [] });
    expect(task.epicId).toBe(epic.id);
    expect(task.sprintId).toBe(sprint.id);
    const epicTasks = await projects.listTasks(p.id, { epicId: epic.id });
    expect(epicTasks).toHaveLength(1);
  });

  it('computes project progress', async () => {
    const p = await projects.createProject(projectData());
    await projects.createTask({ projectId: p.id, title: 'T1', status: 'done', type: 'story', priority: 'medium', storyPoints: 5, assigneeId: 'd1', description: '', labels: [], comments: [], checklist: [] });
    await projects.createTask({ projectId: p.id, title: 'T2', status: 'todo', type: 'story', priority: 'medium', storyPoints: 5, assigneeId: 'd2', description: '', labels: [], comments: [], checklist: [] });
    const progress = await projects.getProjectProgress(p.id);
    expect(progress.totalTasks).toBe(2);
    expect(progress.completedTasks).toBe(1);
    expect(progress.progressPercentage).toBe(50);
  });

  it('completes a sprint and generates report', async () => {
    const p = await projects.createProject(projectData());
    const sprint = await projects.createSprint({ projectId: p.id, name: 'S1', status: 'active', startDate: new Date(), endDate: new Date(), totalPoints: 13, goal: 'Demo' });
    await projects.createTask({ projectId: p.id, sprintId: sprint.id, title: 'T1', status: 'done', type: 'story', priority: 'medium', storyPoints: 8, assigneeId: 'd1', description: '', labels: [], comments: [], checklist: [] });
    await projects.createTask({ projectId: p.id, sprintId: sprint.id, title: 'T2', status: 'todo', type: 'story', priority: 'medium', storyPoints: 5, assigneeId: 'd2', description: '', labels: [], comments: [], checklist: [] });
    const completed = await projects.completeSprint(sprint.id);
    expect(completed.status).toBe('completed');
    expect(completed.completedPoints).toBe(8);
    const report = await projects.getSprintReport(sprint.id);
    expect(report.velocity).toBe(8);
    expect(report.tasksCompleted).toBe(1);
    expect(report.tasksTotal).toBe(2);
  });

  it('cannot complete a non-active sprint', async () => {
    const p = await projects.createProject(projectData());
    const sprint = await projects.createSprint({ projectId: p.id, name: 'S1', status: 'planned', startDate: new Date(), endDate: new Date(), totalPoints: 0, goal: '' });
    await expect(projects.completeSprint(sprint.id)).rejects.toThrow('not active');
  });

  it('deletes project cascades to tasks/epics/sprints', async () => {
    const p = await projects.createProject(projectData());
    await projects.createEpic({ projectId: p.id, name: 'E', status: 'planned', priority: 'low', description: '', color: '#00f' });
    await projects.createSprint({ projectId: p.id, name: 'S', status: 'planned', startDate: new Date(), endDate: new Date(), totalPoints: 0, goal: '' });
    await projects.createTask({ projectId: p.id, title: 'T', status: 'todo', type: 'task', priority: 'low', storyPoints: 1, assigneeId: 'd1', description: '', labels: [], comments: [], checklist: [] });
    const deleted = await projects.deleteProject(p.id);
    expect(deleted).toBe(true);
    expect(await projects.getProjectById(p.id)).toBeUndefined();
    expect(await projects.listEpics(p.id)).toHaveLength(0);
  });

  it('adds comment and checklist item to task', async () => {
    const p = await projects.createProject(projectData());
    const task = await projects.createTask({ projectId: p.id, title: 'T1', status: 'todo', type: 'task', priority: 'low', storyPoints: 1, assigneeId: 'd1', description: '', labels: [], comments: [], checklist: [] });
    const comment = await projects.addTaskComment(task.id, 'author-1', 'Looks good');
    expect(comment.content).toBe('Looks good');
    const item = await projects.addTaskChecklistItem(task.id, 'Write tests');
    expect(item.completed).toBe(false);
  });
});
