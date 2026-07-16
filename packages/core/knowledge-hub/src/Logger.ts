export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class Logger {
  private minLevel: LogLevel;
  private context?: string;
  private entries: LogEntry[] = [];

  constructor(context?: string, minLevel: LogLevel = 'info') {
    this.context = context;
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.minLevel];
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log('error', message, metadata);
  }

  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      context: this.context,
      timestamp: new Date(),
      metadata,
    };

    this.entries.push(entry);

    const prefix = `[${level.toUpperCase()}]${
      this.context ? `[${this.context}]` : ''
    }`;
    console.log(`${prefix} ${message}`);
  }

  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  clearEntries(): void {
    this.entries = [];
  }

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  getLevel(): LogLevel {
    return this.minLevel;
  }

  getContext(): string | undefined {
    return this.context;
  }

  child(context: string): Logger {
    return new Logger(
      this.context ? `${this.context}:${context}` : context,
      this.minLevel,
    );
  }
}
