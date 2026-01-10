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
import type { Plugin } from '../core/plugin-registry.js';
/**
 * Configuration for the PostgreSQL plugin
 */
export interface PostgresPluginConfig {
    /** Database connection URL (e.g., postgresql://user:pass@host:5432/db) */
    url: string;
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
    getStats(): {
        total: number;
        idle: number;
        waiting: number;
    };
    /** Close all connections */
    close(): Promise<void>;
}
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
export declare function getPostgres(name?: string): PostgresInstance;
/**
 * Check if a PostgreSQL instance is registered
 *
 * @param name - Instance name (default: 'default')
 * @returns true if the instance exists
 */
export declare function hasPostgres(name?: string): boolean;
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
export declare function createPostgresPlugin(config: PostgresPluginConfig, instanceName?: string): Plugin;
//# sourceMappingURL=postgres-plugin.d.ts.map