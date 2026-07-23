import type {
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  KanbanLabel,
  ChecklistItem,
  TaskComment,
  BusinessSuiteConfig,
} from '../interfaces.js';

class DefaultLogger {
  private context: string;
  constructor(context: string) { this.context = context; }
  async debug(msg: string, data?: unknown) { console.debug(`[${this.context}] DEBUG`, msg, data ?? ''); }
  async info(msg: string, data?: unknown) { console.log(`[${this.context}] INFO`, msg, data ?? ''); }
  async warn(msg: string, data?: unknown) { console.warn(`[${this.context}] WARN`, msg, data ?? ''); }
  async error(msg: string, data?: unknown) { console.error(`[${this.context}] ERROR`, msg, data ?? ''); }
}

export interface KanbanConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export class Kanban {
  private logger = new DefaultLogger('kanban');
  private boards = new Map<string, KanbanBoard>();
  private cards = new Map<string, KanbanCard>();
  private config: KanbanConfig;

  constructor(config?: KanbanConfig) {
    this.config = config ?? {};
  }

  async createBoard(data: Omit<KanbanBoard, 'id' | 'createdAt' | 'updatedAt' | 'columns' | 'labels'>): Promise<KanbanBoard> {
    const now = new Date();
    const board: KanbanBoard = { ...data, id: crypto.randomUUID(), columns: [], labels: [], createdAt: now, updatedAt: now };
    this.boards.set(board.id, board);
    await this.logger.info('Board created', { id: board.id, name: board.name });
    return board;
  }

  async getBoardById(id: string): Promise<KanbanBoard | undefined> {
    return this.boards.get(id);
  }

  async listBoards(companyId: string): Promise<KanbanBoard[]> {
    return Array.from(this.boards.values()).filter(b => b.companyId === companyId);
  }

  async updateBoard(id: string, data: Partial<KanbanBoard>): Promise<KanbanBoard> {
    const existing = this.boards.get(id);
    if (!existing) throw new Error(`KanbanBoard ${id} not found`);
    const updated: KanbanBoard = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.boards.set(id, updated);
    await this.logger.info('Board updated', { id });
    return updated;
  }

  async deleteBoard(id: string): Promise<boolean> {
    const board = this.boards.get(id);
    if (!board) return false;
    for (const col of board.columns) {
      for (const cardId of col.cardIds) {
        this.cards.delete(cardId);
      }
    }
    const deleted = this.boards.delete(id);
    if (deleted) await this.logger.info('Board deleted', { id });
    return deleted;
  }

  async addColumn(boardId: string, data: Omit<KanbanColumn, 'id' | 'cardIds'>): Promise<KanbanColumn> {
    const board = this.boards.get(boardId);
    if (!board) throw new Error(`KanbanBoard ${boardId} not found`);
    const column: KanbanColumn = { ...data, id: crypto.randomUUID(), cardIds: [] };
    board.columns.push(column);
    board.columns.sort((a, b) => a.order - b.order);
    board.updatedAt = new Date();
    this.boards.set(boardId, board);
    await this.logger.info('Column added', { boardId, columnId: column.id });
    return column;
  }

  async updateColumn(boardId: string, columnId: string, data: Partial<KanbanColumn>): Promise<KanbanColumn> {
    const board = this.boards.get(boardId);
    if (!board) throw new Error(`KanbanBoard ${boardId} not found`);
    const column = board.columns.find(c => c.id === columnId);
    if (!column) throw new Error(`KanbanColumn ${columnId} not found`);
    Object.assign(column, data, { id: column.id });
    board.updatedAt = new Date();
    this.boards.set(boardId, board);
    await this.logger.info('Column updated', { boardId, columnId });
    return column;
  }

  async deleteColumn(boardId: string, columnId: string): Promise<boolean> {
    const board = this.boards.get(boardId);
    if (!board) throw new Error(`KanbanBoard ${boardId} not found`);
    const idx = board.columns.findIndex(c => c.id === columnId);
    if (idx === -1) throw new Error(`KanbanColumn ${columnId} not found`);
    const column = board.columns[idx];
    for (const cardId of column.cardIds) {
      this.cards.delete(cardId);
    }
    board.columns.splice(idx, 1);
    board.updatedAt = new Date();
    this.boards.set(boardId, board);
    await this.logger.info('Column deleted', { boardId, columnId });
    return true;
  }

  async addLabel(boardId: string, name: string, color: string): Promise<KanbanLabel> {
    const board = this.boards.get(boardId);
    if (!board) throw new Error(`KanbanBoard ${boardId} not found`);
    const label: KanbanLabel = { id: crypto.randomUUID(), name, color };
    board.labels.push(label);
    board.updatedAt = new Date();
    this.boards.set(boardId, board);
    await this.logger.info('Label added', { boardId, labelId: label.id });
    return label;
  }

  async deleteLabel(boardId: string, labelId: string): Promise<boolean> {
    const board = this.boards.get(boardId);
    if (!board) throw new Error(`KanbanBoard ${boardId} not found`);
    const idx = board.labels.findIndex(l => l.id === labelId);
    if (idx === -1) throw new Error(`KanbanLabel ${labelId} not found`);
    board.labels.splice(idx, 1);
    for (const card of this.cards.values()) {
      if (card.boardId === boardId) {
        card.labels = card.labels.filter(l => l !== labelId);
      }
    }
    board.updatedAt = new Date();
    this.boards.set(boardId, board);
    await this.logger.info('Label deleted', { boardId, labelId });
    return true;
  }

  async createCard(data: Omit<KanbanCard, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'checklist' | 'comments' | 'attachments'>): Promise<KanbanCard> {
    const board = this.boards.get(data.boardId);
    if (!board) throw new Error(`KanbanBoard ${data.boardId} not found`);
    const column = board.columns.find(c => c.id === data.columnId);
    if (!column) throw new Error(`KanbanColumn ${data.columnId} not found`);
    if (column.wipLimit && column.cardIds.length >= column.wipLimit) {
      throw new Error(`Column ${column.name} has reached its WIP limit of ${column.wipLimit}`);
    }
    const now = new Date();
    const card: KanbanCard = {
      ...data,
      id: crypto.randomUUID(),
      order: column.cardIds.length,
      checklist: [],
      comments: [],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    };
    column.cardIds.push(card.id);
    board.updatedAt = now;
    this.cards.set(card.id, card);
    this.boards.set(data.boardId, board);
    await this.logger.info('Card created', { id: card.id, title: card.title });
    return card;
  }

  async getCardById(id: string): Promise<KanbanCard | undefined> {
    return this.cards.get(id);
  }

  async listCards(boardId: string, columnId?: string): Promise<KanbanCard[]> {
    let results = Array.from(this.cards.values()).filter(c => c.boardId === boardId);
    if (columnId) results = results.filter(c => c.columnId === columnId);
    return results.sort((a, b) => a.order - b.order);
  }

  async updateCard(id: string, data: Partial<KanbanCard>): Promise<KanbanCard> {
    const existing = this.cards.get(id);
    if (!existing) throw new Error(`KanbanCard ${id} not found`);
    const updated: KanbanCard = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.cards.set(id, updated);
    await this.logger.info('Card updated', { id });
    return updated;
  }

  async deleteCard(id: string): Promise<boolean> {
    const card = this.cards.get(id);
    if (!card) return false;
    const board = this.boards.get(card.boardId);
    if (board) {
      const column = board.columns.find(c => c.id === card.columnId);
      if (column) {
        column.cardIds = column.cardIds.filter(cid => cid !== id);
      }
      board.updatedAt = new Date();
      this.boards.set(card.boardId, board);
    }
    const deleted = this.cards.delete(id);
    if (deleted) await this.logger.info('Card deleted', { id });
    return deleted;
  }

  async moveCard(cardId: string, toColumnId: string, toOrder?: number): Promise<KanbanCard> {
    const card = this.cards.get(cardId);
    if (!card) throw new Error(`KanbanCard ${cardId} not found`);
    const board = this.boards.get(card.boardId);
    if (!board) throw new Error(`KanbanBoard ${card.boardId} not found`);
    const fromColumn = board.columns.find(c => c.id === card.columnId);
    const toColumn = board.columns.find(c => c.id === toColumnId);
    if (!fromColumn || !toColumn) throw new Error('Column not found');
    if (toColumn.wipLimit && toColumn.cardIds.length >= toColumn.wipLimit) {
      throw new Error(`Column ${toColumn.name} has reached its WIP limit of ${toColumn.wipLimit}`);
    }
    fromColumn.cardIds = fromColumn.cardIds.filter(cid => cid !== cardId);
    const insertIdx = toOrder !== undefined ? Math.min(toOrder, toColumn.cardIds.length) : toColumn.cardIds.length;
    toColumn.cardIds.splice(insertIdx, 0, cardId);
    card.columnId = toColumnId;
    card.order = insertIdx;
    card.updatedAt = new Date();
    this.cards.set(cardId, card);
    board.updatedAt = new Date();
    this.boards.set(card.boardId, board);
    await this.logger.info('Card moved', { cardId, toColumnId });
    return card;
  }

  async addCardComment(cardId: string, authorId: string, content: string): Promise<TaskComment> {
    const card = this.cards.get(cardId);
    if (!card) throw new Error(`KanbanCard ${cardId} not found`);
    const comment: TaskComment = { id: crypto.randomUUID(), authorId, content, createdAt: new Date() };
    card.comments.push(comment);
    card.updatedAt = new Date();
    this.cards.set(cardId, card);
    await this.logger.info('Comment added to card', { cardId, commentId: comment.id });
    return comment;
  }

  async addCardChecklistItem(cardId: string, text: string): Promise<ChecklistItem> {
    const card = this.cards.get(cardId);
    if (!card) throw new Error(`KanbanCard ${cardId} not found`);
    const item: ChecklistItem = { id: crypto.randomUUID(), text, completed: false };
    card.checklist.push(item);
    card.updatedAt = new Date();
    this.cards.set(cardId, card);
    await this.logger.info('Checklist item added', { cardId, itemId: item.id });
    return item;
  }
}

export { Kanban as default };
