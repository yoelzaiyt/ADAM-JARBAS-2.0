import { generateId } from '@jarbas/utils';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  module: string;
  action?: string;
  apiId?: string;
  requestId?: string;
}

export class Logger {
  private level: LogLevel;
  private context: LogContext;

  constructor(context: LogContext, level: LogLevel = 'info') {
    this.context = context;
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level.toUpperCase()}] [${this.context.module}]`;
    const action = this.context.action ? ` [${this.context.action}]` : '';
    const apiId = this.context.apiId ? ` [${this.context.apiId}]` : '';
    const requestId = this.context.requestId ? ` [${this.context.requestId}]` : '';
    const suffix = data ? ` ${JSON.stringify(data)}` : '';
    return `${base}${action}${apiId}${requestId} ${message}${suffix}`;
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, error));
    }
  }

  child(context: Partial<LogContext>): Logger {
    return new Logger({ ...this.context, ...context }, this.level);
  }
}

export function createLogger(context: LogContext, level?: LogLevel): Logger {
  return new Logger(context, level);
}
