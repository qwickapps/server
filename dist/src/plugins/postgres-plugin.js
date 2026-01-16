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
const { Pool } = pg;
// Global registry of PostgreSQL instances by name
const instances = new Map();
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
export function getPostgres(name = 'default') {
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
export function hasPostgres(name = 'default') {
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
export function createPostgresPlugin(config, instanceName = 'default') {
    let pool = null;
    const pluginId = `postgres:${instanceName}`;
    const createInstance = () => {
        if (!pool) {
            if (config.pool) {
                // Use pre-configured pool (e.g., pg-mem for testing)
                pool = config.pool;
            }
            else if (config.url) {
                // Create pool from URL
                pool = new Pool({
                    connectionString: config.url,
                    max: config.maxConnections ?? 20,
                    min: config.minConnections ?? 2,
                    idleTimeoutMillis: config.idleTimeoutMs ?? 30000,
                    connectionTimeoutMillis: config.connectionTimeoutMs ?? 5000,
                    statement_timeout: config.statementTimeoutMs,
                });
            }
            else {
                throw new Error('PostgresPluginConfig must have either url or pool');
            }
            // Handle pool errors
            pool.on('error', (err) => {
                if (config.onError) {
                    config.onError(err);
                }
                else {
                    console.error(`[database:${instanceName}] Pool error:`, err.message);
                }
            });
            // Call onConnect for each new client
            if (config.onConnect) {
                pool.on('connect', (client) => {
                    config.onConnect(client).catch((err) => {
                        console.error(`[database:${instanceName}] onConnect error:`, err.message);
                    });
                });
            }
        }
        const instance = {
            async getClient() {
                if (!pool)
                    throw new Error('Database pool not initialized');
                return pool.connect();
            },
            async query(sql, params) {
                if (!pool)
                    throw new Error('Database pool not initialized');
                const result = await pool.query(sql, params);
                return result.rows;
            },
            async queryOne(sql, params) {
                const rows = await instance.query(sql, params);
                return rows[0] ?? null;
            },
            async queryRaw(sql, params) {
                if (!pool)
                    throw new Error('Database pool not initialized');
                return pool.query(sql, params);
            },
            async transaction(callback) {
                const client = await instance.getClient();
                try {
                    await client.query('BEGIN');
                    const result = await callback(client);
                    await client.query('COMMIT');
                    return result;
                }
                catch (err) {
                    await client.query('ROLLBACK');
                    throw err;
                }
                finally {
                    client.release();
                }
            },
            getPool() {
                if (!pool)
                    throw new Error('Database pool not initialized');
                return pool;
            },
            getStats() {
                return {
                    total: pool?.totalCount ?? 0,
                    idle: pool?.idleCount ?? 0,
                    waiting: pool?.waitingCount ?? 0,
                };
            },
            async close() {
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
        async onStart(_pluginConfig, registry) {
            const logger = registry.getLogger(pluginId);
            // Create and register the instance
            const instance = createInstance();
            instances.set(instanceName, instance);
            // Test connection
            try {
                await instance.query('SELECT 1');
                logger.debug(`PostgreSQL "${instanceName}" connected`);
            }
            catch (err) {
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
                        }
                        catch (err) {
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
        async onStop() {
            const instance = instances.get(instanceName);
            if (instance) {
                await instance.close();
                instances.delete(instanceName);
            }
        },
    };
}
//# sourceMappingURL=postgres-plugin.js.map