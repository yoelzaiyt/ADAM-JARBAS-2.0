import { describe, it, expect } from 'vitest';
import { Logger } from '../Logger.js';

describe('Logger', () => {
  it('should create logger with default level', () => {
    const logger = new Logger();
    expect(logger.getLevel()).toBe('info');
  });

  it('should create logger with context', () => {
    const logger = new Logger('TestContext');
    expect(logger.getLevel()).toBe('info');
  });

  it('should create logger with custom level', () => {
    const logger = new Logger('Test', 'debug');
    expect(logger.getLevel()).toBe('debug');
  });

  it('should log messages', () => {
    const logger = new Logger('Test', 'debug');
    logger.info('test message');
    expect(logger.getEntries()).toHaveLength(1);
    expect(logger.getEntries()[0].message).toBe('test message');
    expect(logger.getEntries()[0].level).toBe('info');
  });

  it('should filter by level', () => {
    const logger = new Logger('Test', 'warn');
    logger.debug('nope');
    logger.info('nope');
    logger.warn('yes');
    logger.error('yes');
    expect(logger.getEntries()).toHaveLength(2);
  });

  it('should clear entries', () => {
    const logger = new Logger('Test', 'debug');
    logger.info('test');
    logger.clearEntries();
    expect(logger.getEntries()).toHaveLength(0);
  });

  it('should change level', () => {
    const logger = new Logger('Test', 'error');
    logger.setLevel('debug');
    expect(logger.getLevel()).toBe('debug');
  });
});
