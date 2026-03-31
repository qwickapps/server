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
 * Parse database connection URL to extract components.
 * Supports both `postgresql://` and `postgres://` schemes,
 * optional port (defaults to 5432), and query-string parameters.
 */
export function parseConnectionUrl(url) {
    // Normalise postgres:// → postgresql:// so the URL constructor accepts it
    const normalised = url.replace(/^postgres:\/\//, 'postgresql://');
    let parsed;
    try {
        parsed = new URL(normalised);
    }
    catch {
        throw new Error('Invalid PostgreSQL connection URL format');
    }
    const user = decodeURIComponent(parsed.username);
    const password = decodeURIComponent(parsed.password);
    const host = parsed.hostname;
    const port = parsed.port ? parseInt(parsed.port, 10) : 5432;
    // pathname starts with '/' — strip it to get the database name
    const database = decodeURIComponent(parsed.pathname.slice(1));
    if (!user || !host || !database) {
        throw new Error('Invalid PostgreSQL connection URL format');
    }
    return { user, password, host, port, database };
}
/**
 * Returns true when the host belongs to a known managed-database provider
 * (Neon, Supabase) where destructive operations like DROP DATABASE are unsafe.
 */
export function isManagedDatabase(host) {
    return host.endsWith('.neon.tech') || host.endsWith('.supabase.co');
}
/**
 * Helper to create an admin pool for database operations
 */
function createAdminPool(config) {
    return new Pool({
        user: config.adminUser,
        password: config.adminPassword,
        host: config.host,
        port: config.port,
        database: config.adminDatabase || 'postgres',
        max: 1,
        idleTimeoutMillis: 5000,
        connectionTimeoutMillis: 5000,
    });
}
/**
 * Ensure database user exists with password
 */
async function ensureUserExists(adminPool, user, password) {
    const result = await adminPool.query(`SELECT 1 FROM pg_roles WHERE rolname = $1`, [user]);
    if (result.rows.length === 0) {
        await adminPool.query(`CREATE USER ${user} WITH PASSWORD '${password}'`);
    }
    else {
        await adminPool.query(`ALTER USER ${user} WITH PASSWORD '${password}'`);
    }
}
/**
 * Ensure database exists with correct owner
 */
async function ensureDatabaseExists(adminPool, database, owner) {
    const result = await adminPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [database]);
    if (result.rows.length === 0) {
        await adminPool.query(`CREATE DATABASE ${database} OWNER ${owner}`);
    }
}
/**
 * Grant all permissions to user on database
 */
async function grantPermissions(adminPool, database, user) {
    const tempPool = new Pool({
        user: adminPool.options.user,
        password: adminPool.options.password,
        host: adminPool.options.host,
        port: adminPool.options.port,
        database,
        max: 1,
        idleTimeoutMillis: 5000,
        connectionTimeoutMillis: 5000,
    });
    try {
        await tempPool.query(`
      GRANT ALL ON SCHEMA public TO ${user};
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${user};
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${user};
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${user};
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${user};
    `);
    }
    finally {
        await tempPool.end();
    }
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
            // Register maintenance widget FIRST (before connection attempt)
            // This ensures the widget is available even if database connection fails
            registry.addWidget({
                id: `postgres-operations-${instanceName}`,
                title: `Database Operations (${instanceName})`,
                component: 'DatabaseOperationsWidget',
                type: 'maintenance',
                priority: 50,
                showByDefault: true,
                pluginId: pluginId,
            });
            // Three-phase initialization: connect → auto-repair → error state
            // PHASE 1: Try to connect with DATABASE_URI
            try {
                await instance.query('SELECT 1');
                logger.info(`PostgreSQL "${instanceName}" connected successfully`);
            }
            catch (connectionError) {
                const errorMsg = connectionError instanceof Error ? connectionError.message : String(connectionError);
                logger.warn(`PostgreSQL "${instanceName}" connection failed: ${errorMsg}`);
                // PHASE 2: Auto-repair if admin credentials provided
                const shouldAutoRepair = config.adminUser &&
                    config.adminPassword &&
                    config.autoInitialize !== false &&
                    config.url;
                if (shouldAutoRepair) {
                    logger.info(`Attempting auto-repair for "${instanceName}"...`);
                    try {
                        const connParams = parseConnectionUrl(config.url);
                        const adminPool = createAdminPool({
                            adminUser: config.adminUser,
                            adminPassword: config.adminPassword,
                            host: connParams.host,
                            port: connParams.port,
                            adminDatabase: config.adminDatabase,
                        });
                        try {
                            // Ensure user exists
                            logger.debug(`Ensuring user "${connParams.user}" exists...`);
                            await ensureUserExists(adminPool, connParams.user, connParams.password);
                            // Ensure database exists
                            logger.debug(`Ensuring database "${connParams.database}" exists...`);
                            await ensureDatabaseExists(adminPool, connParams.database, connParams.user);
                            // Grant permissions
                            logger.debug(`Granting permissions to "${connParams.user}" on "${connParams.database}"...`);
                            await grantPermissions(adminPool, connParams.database, connParams.user);
                            logger.info(`Auto-repair completed successfully for "${instanceName}"`);
                            // Try connection again after repair
                            await instance.query('SELECT 1');
                            logger.info(`PostgreSQL "${instanceName}" connected after auto-repair`);
                        }
                        finally {
                            await adminPool.end();
                        }
                    }
                    catch (repairError) {
                        const repairMsg = repairError instanceof Error ? repairError.message : String(repairError);
                        // Log error but don't throw - allow plugin to continue starting
                        // This ensures the widget and API routes are available for manual database initialization
                        logger.error(`PostgreSQL connection failed and auto-repair unsuccessful. ` +
                            `Original error: ${errorMsg}. Repair error: ${repairMsg}. ` +
                            `Use the maintenance UI to manually initialize the database.`);
                    }
                }
                else {
                    // PHASE 3: No auto-repair available, remain in error state
                    const missingConfig = [];
                    if (!config.adminUser)
                        missingConfig.push('adminUser');
                    if (!config.adminPassword)
                        missingConfig.push('adminPassword');
                    const hint = missingConfig.length > 0
                        ? ` Provide ${missingConfig.join(', ')} in config to enable auto-repair.`
                        : ' Set autoInitialize=true to enable auto-repair.';
                    // Log error but don't throw - allow plugin to continue starting
                    // This ensures the widget and API routes are available for manual database initialization
                    logger.error(`PostgreSQL connection failed: ${errorMsg}.${hint} ` +
                        `Use the maintenance UI to manually initialize the database.`);
                }
            }
            // Register API routes for database operations
            registry.addRoute({
                method: 'get',
                path: '/status',
                pluginId: pluginId,
                handler: async (req, res) => {
                    try {
                        const requestedInstance = req.query.instance || 'default';
                        const targetInstance = instances.get(requestedInstance);
                        if (!targetInstance) {
                            return res.status(404).json({
                                status: 'error',
                                connected: false,
                                errorMessage: `PostgreSQL instance "${requestedInstance}" not found`,
                                autoInitializeEnabled: false,
                                adminCredentialsProvided: false,
                            });
                        }
                        let connParams = null;
                        if (config.url) {
                            try {
                                connParams = parseConnectionUrl(config.url);
                            }
                            catch (err) {
                                // URL parsing failed, ignore
                            }
                        }
                        const managed = connParams ? isManagedDatabase(connParams.host) : false;
                        try {
                            await targetInstance.query('SELECT 1');
                            res.json({
                                status: 'healthy',
                                connected: true,
                                database: connParams?.database,
                                user: connParams?.user,
                                host: connParams?.host,
                                port: connParams?.port,
                                managed,
                                autoInitializeEnabled: config.autoInitialize !== false,
                                adminCredentialsProvided: !!(config.adminUser && config.adminPassword),
                            });
                        }
                        catch (err) {
                            res.json({
                                status: 'error',
                                connected: false,
                                database: connParams?.database,
                                user: connParams?.user,
                                host: connParams?.host,
                                port: connParams?.port,
                                managed,
                                errorMessage: err instanceof Error ? err.message : String(err),
                                autoInitializeEnabled: config.autoInitialize !== false,
                                adminCredentialsProvided: !!(config.adminUser && config.adminPassword),
                            });
                        }
                    }
                    catch (err) {
                        res.status(500).json({
                            status: 'error',
                            connected: false,
                            errorMessage: err instanceof Error ? err.message : 'Unknown error',
                            autoInitializeEnabled: false,
                            adminCredentialsProvided: false,
                        });
                    }
                },
            });
            registry.addRoute({
                method: 'post',
                path: '/initialize',
                pluginId: pluginId,
                handler: async (req, res) => {
                    try {
                        const { instance: requestedInstance, adminUser, adminPassword } = req.body;
                        const targetInstance = requestedInstance || 'default';
                        if (!instances.has(targetInstance)) {
                            return res.status(404).json({ message: `Instance "${targetInstance}" not found` });
                        }
                        if (!config.url) {
                            return res.status(400).json({ message: 'No database URL configured' });
                        }
                        const connParams = parseConnectionUrl(config.url);
                        const effectiveAdminUser = adminUser || config.adminUser;
                        const effectiveAdminPassword = adminPassword || config.adminPassword;
                        if (!effectiveAdminUser || !effectiveAdminPassword) {
                            return res.status(400).json({
                                message: 'Admin credentials required. Provide adminUser and adminPassword.',
                            });
                        }
                        const adminPool = createAdminPool({
                            adminUser: effectiveAdminUser,
                            adminPassword: effectiveAdminPassword,
                            host: connParams.host,
                            port: connParams.port,
                            adminDatabase: config.adminDatabase,
                        });
                        try {
                            await ensureUserExists(adminPool, connParams.user, connParams.password);
                            await ensureDatabaseExists(adminPool, connParams.database, connParams.user);
                            await grantPermissions(adminPool, connParams.database, connParams.user);
                            logger.info(`Database "${connParams.database}" initialized successfully`);
                            res.json({ message: `Database "${connParams.database}" initialized successfully` });
                        }
                        finally {
                            await adminPool.end();
                        }
                    }
                    catch (err) {
                        logger.error('Database initialization failed', { error: err });
                        res.status(500).json({
                            message: err instanceof Error ? err.message : 'Unknown error',
                        });
                    }
                },
            });
            registry.addRoute({
                method: 'post',
                path: '/recreate',
                pluginId: pluginId,
                handler: async (req, res) => {
                    try {
                        const { instance: requestedInstance, adminUser, adminPassword } = req.body;
                        const targetInstance = requestedInstance || 'default';
                        if (!instances.has(targetInstance)) {
                            return res.status(404).json({ message: `Instance "${targetInstance}" not found` });
                        }
                        if (!config.url) {
                            return res.status(400).json({ message: 'No database URL configured' });
                        }
                        const connParams = parseConnectionUrl(config.url);
                        if (isManagedDatabase(connParams.host)) {
                            return res.status(403).json({
                                message: 'Delete and recreate is not supported for managed databases (Neon, Supabase). Manage your database through the provider dashboard.',
                            });
                        }
                        const effectiveAdminUser = adminUser || config.adminUser;
                        const effectiveAdminPassword = adminPassword || config.adminPassword;
                        if (!effectiveAdminUser || !effectiveAdminPassword) {
                            return res.status(400).json({
                                message: 'Admin credentials required. Provide adminUser and adminPassword.',
                            });
                        }
                        const adminPool = createAdminPool({
                            adminUser: effectiveAdminUser,
                            adminPassword: effectiveAdminPassword,
                            host: connParams.host,
                            port: connParams.port,
                            adminDatabase: config.adminDatabase,
                        });
                        try {
                            // Drop database if exists
                            await adminPool.query(`DROP DATABASE IF EXISTS ${connParams.database}`);
                            // Recreate database
                            await adminPool.query(`CREATE DATABASE ${connParams.database} OWNER ${connParams.user}`);
                            // Grant permissions
                            await grantPermissions(adminPool, connParams.database, connParams.user);
                            logger.info(`Database "${connParams.database}" recreated successfully`);
                            res.json({ message: `Database "${connParams.database}" recreated successfully` });
                        }
                        finally {
                            await adminPool.end();
                        }
                    }
                    catch (err) {
                        logger.error('Database recreation failed', { error: err });
                        res.status(500).json({
                            message: err instanceof Error ? err.message : 'Unknown error',
                        });
                    }
                },
            });
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