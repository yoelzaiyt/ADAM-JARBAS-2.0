import type { DatabaseConfig } from '../interfaces.js';
import { createLogger } from '../Logger.js';

const log = createLogger({ module: 'DatabaseSchema' });

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  indexes: IndexSchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  default?: string;
  references?: string;
}

export interface IndexSchema {
  name: string;
  columns: string[];
  unique: boolean;
}

export class DatabaseSchema {
  private config: DatabaseConfig;
  private tables: Map<string, TableSchema> = new Map();

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.initializeSchema();
  }

  private initializeSchema(): void {
    this.tables.set('api_endpoints', {
      name: 'api_endpoints',
      columns: [
        { name: 'id', type: 'TEXT', nullable: false, primaryKey: true },
        { name: 'name', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'description', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'base_url', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'documentation', type: 'TEXT', nullable: true, primaryKey: false },
        { name: 'category', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'subcategory', type: 'TEXT', nullable: true, primaryKey: false },
        { name: 'auth', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'auth_url', type: 'TEXT', nullable: true, primaryKey: false },
        { name: 'https', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'cors', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'priority', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'status', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'tags', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'rate_limit_requests', type: 'INTEGER', nullable: true, primaryKey: false },
        { name: 'rate_limit_period', type: 'TEXT', nullable: true, primaryKey: false },
        { name: 'pricing_free', type: 'BOOLEAN', nullable: true, primaryKey: false },
        { name: 'alternatives', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'related_apis', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'last_verified', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'created_at', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'updated_at', type: 'TEXT', nullable: false, primaryKey: false },
      ],
      indexes: [
        { name: 'idx_api_category', columns: ['category'], unique: false },
        { name: 'idx_api_priority', columns: ['priority'], unique: false },
        { name: 'idx_api_status', columns: ['status'], unique: false },
        { name: 'idx_api_auth', columns: ['auth'], unique: false },
        { name: 'idx_api_name', columns: ['name'], unique: true },
      ],
    });

    this.tables.set('api_tokens', {
      name: 'api_tokens',
      columns: [
        { name: 'id', type: 'TEXT', nullable: false, primaryKey: true },
        { name: 'api_id', type: 'TEXT', nullable: false, primaryKey: false, references: 'api_endpoints(id)' },
        { name: 'name', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'key_encrypted', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'masked_key', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'environment', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'permissions', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'expires_at', type: 'TEXT', nullable: true, primaryKey: false },
        { name: 'last_used', type: 'TEXT', nullable: true, primaryKey: false },
        { name: 'is_active', type: 'BOOLEAN', nullable: false, primaryKey: false },
        { name: 'created_at', type: 'TEXT', nullable: false, primaryKey: false },
      ],
      indexes: [
        { name: 'idx_token_api', columns: ['api_id'], unique: false },
        { name: 'idx_token_env', columns: ['environment'], unique: false },
        { name: 'idx_token_active', columns: ['is_active'], unique: false },
      ],
    });

    this.tables.set('health_checks', {
      name: 'health_checks',
      columns: [
        { name: 'id', type: 'TEXT', nullable: false, primaryKey: true },
        { name: 'api_id', type: 'TEXT', nullable: false, primaryKey: false, references: 'api_endpoints(id)' },
        { name: 'status', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'latency_ms', type: 'INTEGER', nullable: false, primaryKey: false },
        { name: 'status_code', type: 'INTEGER', nullable: false, primaryKey: false },
        { name: 'error', type: 'TEXT', nullable: true, primaryKey: false },
        { name: 'timestamp', type: 'TEXT', nullable: false, primaryKey: false },
      ],
      indexes: [
        { name: 'idx_health_api', columns: ['api_id'], unique: false },
        { name: 'idx_health_status', columns: ['status'], unique: false },
        { name: 'idx_health_time', columns: ['timestamp'], unique: false },
      ],
    });

    this.tables.set('rate_limits', {
      name: 'rate_limits',
      columns: [
        { name: 'id', type: 'TEXT', nullable: false, primaryKey: true },
        { name: 'api_id', type: 'TEXT', nullable: false, primaryKey: false, references: 'api_endpoints(id)' },
        { name: 'requests', type: 'INTEGER', nullable: false, primaryKey: false },
        { name: 'remaining', type: 'INTEGER', nullable: false, primaryKey: false },
        { name: 'limit', type: 'INTEGER', nullable: false, primaryKey: false },
        { name: 'reset_at', type: 'TEXT', nullable: false, primaryKey: false },
      ],
      indexes: [
        { name: 'idx_rate_api', columns: ['api_id'], unique: true },
      ],
    });

    this.tables.set('api_metrics', {
      name: 'api_metrics',
      columns: [
        { name: 'id', type: 'TEXT', nullable: false, primaryKey: true },
        { name: 'api_id', type: 'TEXT', nullable: false, primaryKey: false, references: 'api_endpoints(id)' },
        { name: 'total_requests', type: 'INTEGER', nullable: false, primaryKey: false },
        { name: 'success_rate', type: 'REAL', nullable: false, primaryKey: false },
        { name: 'avg_latency', type: 'REAL', nullable: false, primaryKey: false },
        { name: 'error_rate', type: 'REAL', nullable: false, primaryKey: false },
        { name: 'period', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'timestamp', type: 'TEXT', nullable: false, primaryKey: false },
      ],
      indexes: [
        { name: 'idx_metrics_api', columns: ['api_id'], unique: false },
        { name: 'idx_metrics_period', columns: ['period'], unique: false },
        { name: 'idx_metrics_time', columns: ['timestamp'], unique: false },
      ],
    });

    this.tables.set('monitoring_alerts', {
      name: 'monitoring_alerts',
      columns: [
        { name: 'id', type: 'TEXT', nullable: false, primaryKey: true },
        { name: 'api_id', type: 'TEXT', nullable: false, primaryKey: false, references: 'api_endpoints(id)' },
        { name: 'type', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'severity', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'message', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'timestamp', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'resolved', type: 'BOOLEAN', nullable: false, primaryKey: false },
      ],
      indexes: [
        { name: 'idx_alert_api', columns: ['api_id'], unique: false },
        { name: 'idx_alert_severity', columns: ['severity'], unique: false },
        { name: 'idx_alert_resolved', columns: ['resolved'], unique: false },
      ],
    });

    this.tables.set('api_comparisons', {
      name: 'api_comparisons',
      columns: [
        { name: 'id', type: 'TEXT', nullable: false, primaryKey: true },
        { name: 'api_a', type: 'TEXT', nullable: false, primaryKey: false, references: 'api_endpoints(id)' },
        { name: 'api_b', type: 'TEXT', nullable: false, primaryKey: false, references: 'api_endpoints(id)' },
        { name: 'metrics', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'recommendation', type: 'TEXT', nullable: false, primaryKey: false },
        { name: 'confidence', type: 'REAL', nullable: false, primaryKey: false },
        { name: 'created_at', type: 'TEXT', nullable: false, primaryKey: false },
      ],
      indexes: [
        { name: 'idx_compare_a', columns: ['api_a'], unique: false },
        { name: 'idx_compare_b', columns: ['api_b'], unique: false },
      ],
    });
  }

  getTable(name: string): TableSchema | undefined {
    return this.tables.get(name);
  }

  getAllTables(): TableSchema[] {
    return Array.from(this.tables.values());
  }

  generateSQL(): string {
    const statements: string[] = [];

    for (const [, table] of this.tables) {
      const columns = table.columns.map(col => {
        let def = `  ${col.name} ${col.type}`;
        if (col.primaryKey) def += ' PRIMARY KEY';
        if (!col.nullable && !col.primaryKey) def += ' NOT NULL';
        if (col.default) def += ` DEFAULT ${col.default}`;
        if (col.references) def += ` REFERENCES ${col.references}`;
        return def;
      });

      statements.push(`CREATE TABLE IF NOT EXISTS ${table.name} (\n${columns.join(',\n')}\n);`);

      for (const index of table.indexes) {
        const uniqueStr = index.unique ? 'UNIQUE ' : '';
        statements.push(`CREATE ${uniqueStr}INDEX IF NOT EXISTS ${index.name} ON ${table.name} (${index.columns.join(', ')});`);
      }
    }

    return statements.join('\n\n');
  }

  getStats(): {
    tables: number;
    totalColumns: number;
    totalIndexes: number;
  } {
    const tables = this.getAllTables();
    return {
      tables: tables.length,
      totalColumns: tables.reduce((sum, t) => sum + t.columns.length, 0),
      totalIndexes: tables.reduce((sum, t) => sum + t.indexes.length, 0),
    };
  }
}
