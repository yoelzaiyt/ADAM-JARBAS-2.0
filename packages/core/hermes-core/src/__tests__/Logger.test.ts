import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from '../Logger.js';

describe('Logger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('constructor with no args uses info level', () => {
    const logger = new Logger();
    expect(logger).toBeDefined();
  });

  it('debug messages are filtered at default info level', async () => {
    const logger = new Logger();
    await logger.debug('should not appear');
    expect(logger.getLogs()).toHaveLength(0);
  });

  it('constructor with context and minLevel', async () => {
    const logger = new Logger('myContext', 'debug');
    await logger.debug('hello');
    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].context).toBe('myContext');
    expect(logs[0].level).toBe('debug');
  });

  it('debug/info/warn/error methods produce log entries', async () => {
    const logger = new Logger(undefined, 'debug');
    await logger.debug('d');
    await logger.info('i');
    await logger.warn('w');
    await logger.error('e');
    expect(logger.getLogs()).toHaveLength(4);
    expect(logger.getLogs('debug')).toHaveLength(1);
    expect(logger.getLogs('info')).toHaveLength(1);
    expect(logger.getLogs('warn')).toHaveLength(1);
    expect(logger.getLogs('error')).toHaveLength(1);
  });

  it('getLogs returns all logs', async () => {
    const logger = new Logger(undefined, 'debug');
    await logger.info('one');
    await logger.warn('two');
    await logger.error('three');
    expect(logger.getLogs()).toHaveLength(3);
  });

  it('getLogs with level filter', async () => {
    const logger = new Logger(undefined, 'debug');
    await logger.info('a');
    await logger.error('b');
    await logger.info('c');
    expect(logger.getLogs('info')).toHaveLength(2);
    expect(logger.getLogs('error')).toHaveLength(1);
    expect(logger.getLogs('warn')).toHaveLength(0);
  });

  it('getLogs with limit', async () => {
    const logger = new Logger(undefined, 'debug');
    await logger.info('a');
    await logger.info('b');
    await logger.info('c');
    await logger.info('d');
    expect(logger.getLogs('info', 2)).toHaveLength(2);
    expect(logger.getLogs('info', 2)[0].message).toBe('c');
    expect(logger.getLogs('info', 2)[1].message).toBe('d');
  });

  it('log entries have correct format', async () => {
    const logger = new Logger();
    await logger.info('test message', { key: 'value' });
    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    const entry = logs[0];
    expect(entry.timestamp).toBeTypeOf('number');
    expect(entry.timestamp).toBeGreaterThan(0);
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('test message');
    expect(entry.data).toEqual({ key: 'value' });
  });

  it('minLevel filters out lower-level messages', async () => {
    const logger = new Logger(undefined, 'warn');
    await logger.debug('d');
    await logger.info('i');
    await logger.warn('w');
    await logger.error('e');
    expect(logger.getLogs()).toHaveLength(2);
    expect(logger.getLogs('warn')).toHaveLength(1);
    expect(logger.getLogs('error')).toHaveLength(1);
  });
});
