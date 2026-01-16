/**
 * PostgreSQL Plugin
 *
 * Provides PostgreSQL database connection pooling and health checks.
 * Wraps the 'pg' library with a simple, reusable interface.
 *
 * ## Features
 * - Connection pooling with configurable limits
 * - Automatic health checks with pool stats
 * - Transaction helpers
 * - Multiple named instances support
 * - Graceful shutdown
 *
 * ## Usage
 *
 * ```typescript
 * import { createGateway, createPostgresPlugin, getPostgres } from '@qwickapps/server';
 *
 * const gateway = createGateway({
 *   // ... config
 *   plugins: [
 *     createPostgresPlugin({
 *       url: process.env.DATABASE_URL,
 *       maxConnections: 20,
 *     }),
 *   ],
 * });
 *
 * // In your service code:
 * const db = getPostgres();
 * const users = await db.query<User>('SELECT * FROM users WHERE active = $1', [true]);
 * ```
 *
 * ## Multiple Databases
 *
 * ```typescript
 * // Register multiple databases with different names
 * createPostgresPlugin({ url: primaryUrl }, 'primary');
 * createPostgresPlugin({ url: replicaUrl }, 'replica');
 *
 * // Access by name
 * const primary = getPostgres('primary');
 * const replica = getPostgres('replica');
 * ```
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import pg from 'pg';
import type { Plugin, PluginConfig, PluginRegistry } from '../core/plugin-registry.js';

const { Pool } = pg;

/**
 * Configuration for the PostgreSQL plugin
 */
export interface PostgresPluginConfig {
  /** Database connection URL (e.g., postgresql://user:pass@host:5432/db) */
  url?: string;

  /** Pre-configured pg.Pool instance (alternative to url) */
  pool?: pg.Pool;

  /** Maximum number of clients in the pool (default: 20) */
  maxConnections?: number;

  /** Minimum number of clients in the pool (default: 2) */
  minConnections?: number;

  /** Idle timeout in milliseconds - close idle clients after this time (default: 30000) */
  idleTimeoutMs?: number;

  /** Connection timeout in milliseconds - fail if can't connect within this time (default: 5000) */
  connectionTimeoutMs?: number;

  /** Statement timeout in milliseconds - cancel queries taking longer (default: none) */
  statementTimeoutMs?: number;

  /** Register a health check for this database (default: true) */
  healthCheck?: boolean;

  /** Name for the health check (default: 'postgres') */
  healthCheckName?: string;

  /** Health check interval in milliseconds (default: 30000) */
  healthCheckInterval?: number;

  /** Called when a client connects (for setup like setting search_path) */
  onConnect?: (client: pg.PoolClient) => Promise<void>;

  /** Called on pool errors */
  onError?: (error: Error) => void;
}

/**
 * Transaction callback function
 */
export type TransactionCallback<T> = (client: pg.PoolClient) => Promise<T>;

/**
 * PostgreSQL instance returned by the plugin
 */
export interface PostgresInstance {
  /** Get a client from the pool (remember to release it!) */
  getClient(): Promise<pg.PoolClient>;

  /** Execute a query and return rows */
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;

  /** Execute a query and return first row or null */
  queryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null>;

  /** Execute a query and return the full result (includes rowCount, etc.) */
  queryRaw(sql: string, params?: unknown[]): Promise<pg.QueryResult>;

  /**
   * Execute multiple queries in a transaction
   *
   * @example
   * ```typescript
   * const result = await db.transaction(async (client) => {
   *   await client.query('INSERT INTO users (name) VALUES ($1)', ['Alice']);
   *   await client.query('INSERT INTO audit_log (action) VALUES ($1)', ['user_created']);
   *   return { success: true };
   * });
   * ```
   */
  transaction<T>(callback: TransactionCallback<T>): Promise<T>;

  /** Get the underlying pool (for advanced use cases) */
  getPool(): pg.Pool;

  /** Get pool statistics */
  getStats(): { total: number; idle: number; waiting: number };

  /** Close all connections */
  close(): Promise<void>;
}

// Global registry of PostgreSQL instances by name
const instances = new Map<string, PostgresInstance>();

/**
 * Get a PostgreSQL instance by name
 *
 * @param name - Instance name (default: 'default')
 * @returns The PostgreSQL instance
 * @throws Error if the instance is not registered
 *
 * @example
 * ```typescript
 * const db = getPostgres();
 * const users = await db.query<User>('SELECT * FROM users');
 * ```
 */
export function getPostgres(name = 'default'): PostgresInstance {
  const instance = instances.get(name);
  if (!instance) {
    throw new Error(`PostgreSQL instance "${name}" not found. Did you register the postgres plugin?`);
  }
  return instance;
}

/**
 * Check if a PostgreSQL instance is registered
 *
 * @param name - Instance name (default: 'default')
 * @returns true if the instance exists
 */
export function hasPostgres(name = 'default'): boolean {
  return instances.has(name);
}

/**
 * Create a PostgreSQL plugin
 *
 * @param config - PostgreSQL configuration
 * @param instanceName - Name for this PostgreSQL instance (default: 'default')
 * @returns A plugin
 *
 * @example
 * ```typescript
 * createPostgresPlugin({
 *   url: process.env.DATABASE_URL,
 *   maxConnections: 20,
 *   healthCheck: true,
 * });
 * ```
 */
export function createPostgresPlugin(
  config: PostgresPluginConfig,
  instanceName = 'default'
): Plugin {
  let pool: pg.Pool | null = null;
  const pluginId = `postgres:${instanceName}`;

  const createInstance = (): PostgresInstance => {
    if (!pool) {
      if (config.pool) {
        // Use pre-configured pool (e.g., pg-mem for testing)
        pool = config.pool;
      } else if (config.url) {
        // Create pool from URL
        pool = new Pool({
          connectionString: config.url,
          max: config.maxConnections ?? 20,
          min: config.minConnections ?? 2,
          idleTimeoutMillis: config.idleTimeoutMs ?? 30000,
          connectionTimeoutMillis: config.connectionTimeoutMs ?? 5000,
          statement_timeout: config.statementTimeoutMs,
        });
      } else {
        throw new Error('PostgresPluginConfig must have either url or pool');
      }

      // Handle pool errors
      pool.on('error', (err) => {
        if (config.onError) {
          config.onError(err);
        } else {
          console.error(`[database:${instanceName}] Pool error:`, err.message);
        }
      });

      // Call onConnect for each new client
      if (config.onConnect) {
        pool.on('connect', (client) => {
          config.onConnect!(client).catch((err) => {
            console.error(`[database:${instanceName}] onConnect error:`, err.message);
          });
        });
      }
    }

    const instance: PostgresInstance = {
      async getClient(): Promise<pg.PoolClient> {
        if (!pool) throw new Error('Database pool not initialized');
        return pool.connect();
      },

      async query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
        if (!pool) throw new Error('Database pool not initialized');
        const result = await pool.query(sql, params);
        return result.rows as T[];
      },

      async queryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null> {
        const rows = await instance.query<T>(sql, params);
        return rows[0] ?? null;
      },

      async queryRaw(sql: string, params?: unknown[]): Promise<pg.QueryResult> {
        if (!pool) throw new Error('Database pool not initialized');
        return pool.query(sql, params);
      },

      async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
        const client = await instance.getClient();
        try {
          await client.query('BEGIN');
          const result = await callback(client);
          await client.query('COMMIT');
          return result;
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      },

      getPool(): pg.Pool {
        if (!pool) throw new Error('Database pool not initialized');
        return pool;
      },

      getStats(): { total: number; idle: number; waiting: number } {
        return {
          total: pool?.totalCount ?? 0,
          idle: pool?.idleCount ?? 0,
          waiting: pool?.waitingCount ?? 0,
        };
      },

      async close(): Promise<void> {
        if (pool) {
          await pool.end();
          pool = null;
        }
      },
    };

    return instance;
  };

  return {
    id: pluginId,
    name: `PostgreSQL (${instanceName})`,
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      const logger = registry.getLogger(pluginId);

      // Create and register the instance
      const instance = createInstance();
      instances.set(instanceName, instance);

      // Test connection
      try {
        await instance.query('SELECT 1');
        logger.debug(`PostgreSQL "${instanceName}" connected`);
      } catch (err) {
        logger.error(`PostgreSQL "${instanceName}" connection failed: ${err instanceof Error ? err.message : String(err)}`);
        throw err;
      }

      // Register health check if enabled
      if (config.healthCheck !== false) {
        registry.registerHealthCheck({
          name: config.healthCheckName ?? 'postgres',
          type: 'custom',
          interval: config.healthCheckInterval ?? 30000,
          timeout: 5000,
          check: async () => {
            const start = Date.now();
            try {
              await instance.query('SELECT 1');
              const stats = instance.getStats();
              return {
                healthy: true,
                latency: Date.now() - start,
                details: {
                  pool: stats,
                },
              };
            } catch (err) {
              return {
                healthy: false,
                latency: Date.now() - start,
                details: {
                  error: err instanceof Error ? err.message : String(err),
                },
              };
            }
          },
        });
      }
    },

    async onStop(): Promise<void> {
      const instance = instances.get(instanceName);
      if (instance) {
        await instance.close();
        instances.delete(instanceName);
      }
    },
  };
}
