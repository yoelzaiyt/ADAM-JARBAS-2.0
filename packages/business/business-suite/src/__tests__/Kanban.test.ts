import { describe, it, expect, beforeEach } from 'vitest';
import { Kanban } from '../kanban/Kanban.js';

const CID = 'comp-1';

describe('Kanban', () => {
  let kanban: Kanban;

  beforeEach(() => {
    kanban = new Kanban();
  });

  async function setupBoard() {
    const board = await kanban.createBoard({ companyId: CID, name: 'Dev Board', description: 'Main board' });
    const col1 = await kanban.addColumn(board.id, { name: 'To Do', order: 0 });
    const col2 = await kanban.addColumn(board.id, { name: 'In Progress', order: 1 });
    const col3 = await kanban.addColumn(board.id, { name: 'Done', order: 2 });
    return { board, col1, col2, col3 };
  }

  it('creates and retrieves a board with columns', async () => {
    const { board } = await setupBoard();
    const found = await kanban.getBoardById(board.id);
    expect(found?.columns).toHaveLength(3);
  });

  it('creates a card in a column', async () => {
    const { board, col1 } = await setupBoard();
    const card = await kanban.createCard({ boardId: board.id, columnId: col1.id, title: 'Fix login bug', description: '', assigneeId: 'dev-1', labels: [], priority: 'high' });
    expect(card.id).toBeDefined();
    expect(card.columnId).toBe(col1.id);
    expect(card.order).toBe(0);
  });

  it('moves card between columns', async () => {
    const { board, col1, col2 } = await setupBoard();
    const card = await kanban.createCard({ boardId: board.id, columnId: col1.id, title: 'Task 1', description: '', assigneeId: 'd1', labels: [], priority: 'medium' });
    const moved = await kanban.moveCard(card.id, col2.id);
    expect(moved.columnId).toBe(col2.id);
    const col1Cards = await kanban.listCards(board.id, col1.id);
    expect(col1Cards).toHaveLength(0);
    const col2Cards = await kanban.listCards(board.id, col2.id);
    expect(col2Cards).toHaveLength(1);
  });

  it('enforces WIP limit on card creation', async () => {
    const { board, col1 } = await setupBoard();
    await kanban.updateColumn(board.id, col1.id, { wipLimit: 1 });
    await kanban.createCard({ boardId: board.id, columnId: col1.id, title: 'T1', description: '', assigneeId: 'd1', labels: [], priority: 'low' });
    await expect(kanban.createCard({ boardId: board.id, columnId: col1.id, title: 'T2', description: '', assigneeId: 'd2', labels: [], priority: 'low' })).rejects.toThrow('WIP limit');
  });

  it('enforces WIP limit on card move', async () => {
    const { board, col1, col2 } = await setupBoard();
    await kanban.updateColumn(board.id, col2.id, { wipLimit: 1 });
    await kanban.createCard({ boardId: board.id, columnId: col2.id, title: 'Existing', description: '', assigneeId: 'd1', labels: [], priority: 'low' });
    const card = await kanban.createCard({ boardId: board.id, columnId: col1.id, title: 'Move me', description: '', assigneeId: 'd2', labels: [], priority: 'low' });
    await expect(kanban.moveCard(card.id, col2.id)).rejects.toThrow('WIP limit');
  });

  it('adds and manages labels', async () => {
    const { board } = await setupBoard();
    const label = await kanban.addLabel(board.id, 'Bug', '#ff0000');
    expect(label.name).toBe('Bug');
    const card = await kanban.createCard({ boardId: board.id, columnId: board.columns[0].id, title: 'Bug report', description: '', assigneeId: 'd1', labels: [label.id], priority: 'high' });
    expect(card.labels).toContain(label.id);
    const deleted = await kanban.deleteLabel(board.id, label.id);
    expect(deleted).toBe(true);
    const updatedCard = await kanban.getCardById(card.id);
    expect(updatedCard?.labels).toHaveLength(0);
  });

  it('deletes a card and removes from column', async () => {
    const { board, col1 } = await setupBoard();
    const card = await kanban.createCard({ boardId: board.id, columnId: col1.id, title: 'Del me', description: '', assigneeId: 'd1', labels: [], priority: 'low' });
    const deleted = await kanban.deleteCard(card.id);
    expect(deleted).toBe(true);
    expect(await kanban.getCardById(card.id)).toBeUndefined();
    expect((await kanban.listCards(board.id, col1.id))).toHaveLength(0);
  });

  it('adds comment and checklist to card', async () => {
    const { board, col1 } = await setupBoard();
    const card = await kanban.createCard({ boardId: board.id, columnId: col1.id, title: 'Feature', description: '', assigneeId: 'd1', labels: [], priority: 'medium' });
    const comment = await kanban.addCardComment(card.id, 'author-1', 'Please review');
    expect(comment.content).toBe('Please review');
    const item = await kanban.addCardChecklistItem(card.id, 'Write unit tests');
    expect(item.completed).toBe(false);
  });
});
