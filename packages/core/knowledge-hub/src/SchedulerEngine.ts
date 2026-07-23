import type {
  SchedulerEngine as ISchedulerEngine,
  ScheduleConfig,
  ScheduleSource,
  ScheduleStatus,
  IngestionResult,
} from './interfaces.js';

export class SchedulerEngine implements ISchedulerEngine {
  private statuses: Map<string, ScheduleStatus> = new Map();
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map();
  private sources: Map<string, ScheduleSource> = new Map();
  private running = false;
  private config: ScheduleConfig;

  constructor(config: ScheduleConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.running) return;

    for (const source of this.config.sources) {
      const id = this.generateId(source);
      if (!this.sources.has(id)) {
        this.sources.set(id, source);
      }

      if (!this.statuses.has(id)) {
        this.statuses.set(id, {
          id,
          runsCount: 0,
          errorsCount: 0,
          status: 'active',
        });
      } else {
        this.statuses.get(id)!.status = 'active';
      }

      this.createTimer(id);
    }

    this.running = true;
  }

  async stop(): Promise<void> {
    for (const [id, timer] of this.timers) {
      clearInterval(timer);
      this.timers.delete(id);
    }

    for (const [id, status] of this.statuses) {
      if (status.status === 'active') {
        this.statuses.set(id, { ...status, status: 'paused' });
      }
    }

    this.running = false;
  }

  async addSource(source: ScheduleSource): Promise<void> {
    const id = this.generateId(source);
    this.sources.set(id, source);

    this.statuses.set(id, {
      id,
      runsCount: 0,
      errorsCount: 0,
      status: this.running ? 'active' : 'paused',
    });

    if (this.running) {
      this.createTimer(id);
    }
  }

  async removeSource(sourceId: string): Promise<void> {
    const timer = this.timers.get(sourceId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(sourceId);
    }

    this.sources.delete(sourceId);
    this.statuses.delete(sourceId);
  }

  getStatus(): ScheduleStatus[] {
    return Array.from(this.statuses.values());
  }

  async triggerNow(sourceId: string): Promise<IngestionResult> {
    const status = this.statuses.get(sourceId);
    if (!status) {
      throw new Error(`Source ${sourceId} not found`);
    }

    const now = new Date();
    this.statuses.set(sourceId, {
      ...status,
      lastRun: now,
      runsCount: status.runsCount + 1,
      nextRun: new Date(now.getTime() + this.config.intervalMs),
    });

    return {
      documentId: `doc-${sourceId}-${Date.now()}`,
      status: 'indexed',
      chunksCreated: 0,
      embeddingTimeMs: 0,
      indexingTimeMs: 0,
      totalTimeMs: 0,
    };
  }

  private generateId(source: ScheduleSource): string {
    const existingCount = Array.from(this.sources.values()).filter(
      (s) => s.connectorType === source.connectorType,
    ).length;
    return `${source.connectorType}-${existingCount}`;
  }

  private createTimer(sourceId: string): void {
    if (this.timers.has(sourceId)) return;

    const timer = setInterval(() => {
      const status = this.statuses.get(sourceId);
      if (status && status.status === 'active') {
        const now = new Date();
        this.statuses.set(sourceId, {
          ...status,
          lastRun: now,
          runsCount: status.runsCount + 1,
          nextRun: new Date(now.getTime() + this.config.intervalMs),
        });
      }
    }, this.config.intervalMs);

    this.timers.set(sourceId, timer);
  }
}
