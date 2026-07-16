import type { Logger as ILogger, LogLevel } from './interfaces.js';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
}

export class Logger implements ILogger {
  private minLevel: LogLevel = 'info';
  private logs: LogEntry[] = [];
  private readonly maxLogs = 10000;
  private context?: string;

  constructor(context?: string, minLevel: LogLevel = 'info') {
    this.context = context;
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatEntry(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const ctx = entry.context ? ` [${entry.context}]` : '';
    return `${timestamp} ${entry.level.toUpperCase()}${ctx} ${entry.message}`;
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context: this.context,
      data,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.log(this.formatEntry(entry));
  }

  async debug(message: string, data?: unknown): Promise<void> {
    this.log('debug', message, data);
  }

  async info(message: string, data?: unknown): Promise<void> {
    this.log('info', message, data);
  }

  async warn(message: string, data?: unknown): Promise<void> {
    this.log('warn', message, data);
  }

  async error(message: string, data?: unknown): Promise<void> {
    this.log('error', message, data);
  }

  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filtered = level ? this.logs.filter((l) => l.level === level) : [...this.logs];
    if (limit) {
      filtered = filtered.slice(-limit);
    }
    return filtered;
  }
}
