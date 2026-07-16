import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSchema } from '../database/DatabaseSchema.js';

describe('DatabaseSchema', () => {
  let schema: DatabaseSchema;

  beforeEach(() => {
    schema = new DatabaseSchema({
      type: 'sqlite',
      url: ':memory:',
      maxConnections: 1,
    });
  });

  it('should have default tables', () => {
    const tables = schema.getAllTables();
    expect(tables.length).toBe(7);
    expect(tables.map(t => t.name)).toContain('api_endpoints');
    expect(tables.map(t => t.name)).toContain('api_tokens');
    expect(tables.map(t => t.name)).toContain('health_checks');
    expect(tables.map(t => t.name)).toContain('rate_limits');
    expect(tables.map(t => t.name)).toContain('api_metrics');
    expect(tables.map(t => t.name)).toContain('monitoring_alerts');
    expect(tables.map(t => t.name)).toContain('api_comparisons');
  });

  it('should get table by name', () => {
    const table = schema.getTable('api_endpoints');
    expect(table).toBeDefined();
    expect(table?.columns.length).toBeGreaterThan(0);
  });

  it('should have primary keys', () => {
    const table = schema.getTable('api_endpoints');
    const primaryKeys = table?.columns.filter(c => c.primaryKey);
    expect(primaryKeys?.length).toBe(1);
    expect(primaryKeys?.[0].name).toBe('id');
  });

  it('should have indexes', () => {
    const table = schema.getTable('api_endpoints');
    expect(table?.indexes.length).toBeGreaterThan(0);
  });

  it('should generate SQL', () => {
    const sql = schema.generateSQL();
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS api_endpoints');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS api_tokens');
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS');
  });

  it('should return stats', () => {
    const stats = schema.getStats();
    expect(stats.tables).toBe(7);
    expect(stats.totalColumns).toBeGreaterThan(0);
    expect(stats.totalIndexes).toBeGreaterThan(0);
  });

  it('should have foreign keys', () => {
    const tokenTable = schema.getTable('api_tokens');
    const foreignKeys = tokenTable?.columns.filter(c => c.references);
    expect(foreignKeys?.length).toBeGreaterThan(0);
  });
});
