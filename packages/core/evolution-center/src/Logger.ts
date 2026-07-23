export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

export interface LogFn {
  (message: string, data?: unknown): void;
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

function format(context: string | undefined, level: LogLevel, message: string): string {
  const ts = new Date().toISOString();
  const ctx = context ? ` [${context}]` : '';
  return `${ts} ${level.toUpperCase()}${ctx} ${message}`;
}

export function createLogger(context?: string, minLevel: LogLevel = 'info'): LogFn {
  const min = LOG_LEVELS[minLevel];
  const shouldLog = (level: LogLevel) => LOG_LEVELS[level] >= min;

  const log: LogFn = ((message: string, data?: unknown) => {
    if (shouldLog('info')) console.log(format(context, 'info', message), data ?? '');
  }) as LogFn;

  log.debug = (message: string, data?: unknown) => {
    if (shouldLog('debug')) console.debug(format(context, 'debug', message), data ?? '');
  };
  log.info = (message: string, data?: unknown) => {
    if (shouldLog('info')) console.log(format(context, 'info', message), data ?? '');
  };
  log.warn = (message: string, data?: unknown) => {
    if (shouldLog('warn')) console.warn(format(context, 'warn', message), data ?? '');
  };
  log.error = (message: string, data?: unknown) => {
    if (shouldLog('error')) console.error(format(context, 'error', message), data ?? '');
  };

  return log;
}
