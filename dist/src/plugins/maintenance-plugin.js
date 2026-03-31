/**
 * Maintenance Plugin
 *
 * Provides operational UI for Payload CMS-based applications:
 * - Seed script management and execution
 * - Service control (start/stop/restart)
 * - Environment variable management
 * - Database backup and restore operations
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { readdirSync, statSync, readFileSync } from 'fs';
import { resolve, join, relative } from 'path';
import { SeedExecutor, validateScriptPath } from './maintenance/seed-executor.js';
import { getPostgres, hasPostgres } from './postgres-plugin.js';
/**
 * Extract description from JSDoc comment at top of file
 */
function extractDescription(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        // Match JSDoc comment at start of file (after any whitespace)
        const jsdocMatch = content.match(/^\s*\/\*\*\s*\n([\s\S]*?)\*\//);
        if (jsdocMatch) {
            // Extract lines and clean up asterisks and whitespace
            const lines = jsdocMatch[1]
                .split('\n')
                .map(line => line.replace(/^\s*\*\s?/, '').trim())
                .filter(line => line.length > 0);
            // Skip the first line if it's just the title (will be shown separately)
            // Return subsequent lines as the description
            return lines.slice(1).join(' ').trim() || undefined;
        }
    }
    catch (err) {
        // Failed to read file or parse description
    }
    return undefined;
}
/**
 * Recursively scan directory for .mjs files
 */
function scanSeedScripts(dir, basePath = dir) {
    const results = [];
    try {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                // Recursively scan subdirectories
                results.push(...scanSeedScripts(fullPath, basePath));
            }
            else if (entry.isFile() && (entry.name.endsWith('.mjs') || entry.name.endsWith('.ts'))) {
                // Found a .mjs or .ts file
                const stats = statSync(fullPath);
                const relativePath = relative(basePath, fullPath);
                const description = extractDescription(fullPath);
                results.push({
                    type: 'file',
                    name: entry.name,
                    path: relativePath, // Relative path from scripts directory
                    fullPath: fullPath, // Absolute path
                    size: stats.size,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime,
                    description, // Add description from JSDoc
                });
            }
        }
    }
    catch (err) {
        // Directory not accessible, return empty array
    }
    return results;
}
/**
 * Create a maintenance plugin
 */
export function createMaintenancePlugin(config = {}) {
    const scriptsPath = config.scriptsPath || './scripts';
    const envFilePath = config.envFilePath || './.env.local';
    const backupsPath = config.backupsPath || './backups';
    return {
        id: 'maintenance',
        name: 'Maintenance Plugin',
        version: '1.0.0',
        async onStart(_pluginConfig, registry) {
            const logger = registry.getLogger('maintenance');
            logger.info('Maintenance plugin starting...');
            // Initialize seed_executions table if PostgreSQL is available
            if (hasPostgres()) {
                try {
                    const db = getPostgres();
                    await db.queryRaw(`
            CREATE TABLE IF NOT EXISTS seed_executions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL,
              status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
              started_at TIMESTAMPTZ NOT NULL,
              completed_at TIMESTAMPTZ,
              exit_code INTEGER,
              output TEXT,
              error TEXT,
              duration_ms INTEGER,
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
          `);
                    // Create index on status for faster queries
                    await db.queryRaw(`
            CREATE INDEX IF NOT EXISTS idx_seed_executions_status
            ON seed_executions(status)
          `);
                    logger.debug('Seed executions table initialized');
                }
                catch (error) {
                    logger.error('Failed to initialize seed_executions table', { error });
                }
            }
            // Clean up orphaned executions from previous crashes
            if (hasPostgres()) {
                try {
                    const db = getPostgres();
                    const result = await db.queryRaw(`UPDATE seed_executions
             SET status = 'failed',
                 error = 'Server interrupted during execution',
                 completed_at = NOW(),
                 updated_at = NOW()
             WHERE status = 'running'`);
                    if (result.rowCount && result.rowCount > 0) {
                        logger.warn(`Cleaned up ${result.rowCount} orphaned seed execution(s)`);
                    }
                }
                catch (error) {
                    logger.error('Failed to clean up orphaned executions', { error });
                }
            }
            // Register status endpoint
            registry.addRoute({
                method: 'get',
                path: '/status',
                pluginId: 'maintenance',
                handler: (_req, res) => {
                    res.json({
                        status: 'ok',
                        features: {
                            seeds: config.enableSeeds !== false,
                            serviceControl: config.enableServiceControl !== false,
                            envManagement: config.enableEnvManagement !== false,
                            databaseOps: config.enableDatabaseOps !== false,
                        },
                        config: {
                            scriptsPath,
                            envFilePath,
                            backupsPath,
                        },
                    });
                },
            });
            // Register seed management routes
            if (config.enableSeeds !== false) {
                logger.debug('Seed management enabled');
                // Check PostgreSQL dependency for seed history
                if (!hasPostgres()) {
                    logger.warn('Seed management requires PostgreSQL plugin for execution history');
                }
                // GET /seeds/discover - List available seed scripts and custom tasks
                registry.addRoute({
                    method: 'get',
                    path: '/seeds/discover',
                    pluginId: 'maintenance',
                    handler: (_req, res) => {
                        try {
                            const resolvedPath = resolve(scriptsPath);
                            let seedFiles = [];
                            try {
                                // Recursively scan for .mjs files
                                seedFiles = scanSeedScripts(resolvedPath);
                                // Sort by relative path (natural ordering respects numbered prefixes)
                                // Example: "01-Setup/001.init.mjs" comes before "02-Production/001.seed.mjs"
                                seedFiles.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
                            }
                            catch (err) {
                                // Scripts directory may not exist, which is fine if we have custom tasks
                                logger.debug('Scripts directory not found or not readable');
                            }
                            // Add custom tasks
                            const customTasks = (config.customTasks || []).map((task) => ({
                                type: 'task',
                                id: task.id,
                                name: task.name,
                                description: task.description,
                                options: task.options,
                            }));
                            res.json({ seeds: [...seedFiles, ...customTasks] });
                        }
                        catch (error) {
                            logger.error('Failed to discover seed scripts', { error });
                            res.status(500).json({
                                error: 'Failed to discover seed scripts',
                                message: error instanceof Error ? error.message : String(error),
                            });
                        }
                    },
                });
                // POST /seeds/execute - Execute a seed script or custom task
                registry.addRoute({
                    method: 'post',
                    path: '/seeds/execute',
                    pluginId: 'maintenance',
                    handler: async (req, res) => {
                        try {
                            const { name, type, options } = req.body;
                            if (!name || typeof name !== 'string') {
                                return res.status(400).json({ error: 'Script name is required' });
                            }
                            // Ensure seed_executions table exists (lazy initialization)
                            if (hasPostgres()) {
                                const db = getPostgres();
                                try {
                                    await db.queryRaw(`
                    CREATE TABLE IF NOT EXISTS seed_executions (
                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      name TEXT NOT NULL,
                      status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
                      started_at TIMESTAMPTZ NOT NULL,
                      completed_at TIMESTAMPTZ,
                      exit_code INTEGER,
                      output TEXT,
                      error TEXT,
                      duration_ms INTEGER,
                      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    )
                  `);
                                    await db.queryRaw(`
                    CREATE INDEX IF NOT EXISTS idx_seed_executions_status
                    ON seed_executions(status)
                  `);
                                }
                                catch (err) {
                                    logger.debug('Table initialization check', { err });
                                }
                            }
                            // Check for concurrent execution
                            if (hasPostgres()) {
                                const db = getPostgres();
                                const running = await db.queryOne('SELECT id FROM seed_executions WHERE status = $1', ['running']);
                                if (running) {
                                    return res.status(409).json({
                                        error: 'A seed is already running. Please wait for it to complete.',
                                    });
                                }
                            }
                            // Set SSE headers
                            res.setHeader('Content-Type', 'text/event-stream');
                            res.setHeader('Cache-Control', 'no-cache');
                            res.setHeader('Connection', 'keep-alive');
                            res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
                            res.setHeader('Content-Encoding', 'identity'); // Disable compression
                            res.flushHeaders();
                            // Create execution record in database
                            let executionId = null;
                            if (hasPostgres()) {
                                const db = getPostgres();
                                const result = await db.queryOne(`INSERT INTO seed_executions (name, status, started_at)
                   VALUES ($1, $2, NOW())
                   RETURNING id`, [name, 'running']);
                                executionId = result?.id || null;
                            }
                            const startTime = Date.now();
                            let exitCode = 0;
                            let output = '';
                            let error = '';
                            try {
                                // Execute based on type
                                if (type === 'task') {
                                    // Find custom task
                                    const task = (config.customTasks || []).find((t) => t.id === name);
                                    if (!task) {
                                        throw new Error(`Custom task not found: ${name}`);
                                    }
                                    // Execute custom task handler with SSE streaming
                                    await task.handler(options || {}, res);
                                }
                                else {
                                    // Execute file-based seed script
                                    const scriptPath = validateScriptPath(name, scriptsPath);
                                    if (!scriptPath) {
                                        throw new Error('Invalid script name or file not found');
                                    }
                                    const executor = new SeedExecutor();
                                    // Project root is one level up from scripts directory
                                    const projectRoot = resolve(scriptsPath, '..');
                                    const result = await executor.execute(scriptPath, res, config.databaseUrl, projectRoot);
                                    exitCode = result.exitCode;
                                    output = result.output;
                                    error = result.error;
                                }
                                const duration = Date.now() - startTime;
                                // Update execution record
                                if (hasPostgres() && executionId) {
                                    const db = getPostgres();
                                    await db.query(`UPDATE seed_executions
                     SET status = $1, completed_at = NOW(), exit_code = $2,
                         output = $3, error = $4, duration_ms = $5, updated_at = NOW()
                     WHERE id = $6`, [
                                        exitCode === 0 ? 'completed' : 'failed',
                                        exitCode,
                                        output,
                                        error,
                                        duration,
                                        executionId,
                                    ]);
                                }
                                res.end();
                            }
                            catch (error) {
                                logger.error('Seed execution failed', { name, error });
                                const duration = Date.now() - startTime;
                                // Send error event via SSE to notify client
                                res.write(`data: ${JSON.stringify({
                                    type: 'error',
                                    data: error instanceof Error ? error.message : String(error),
                                    timestamp: new Date().toISOString()
                                })}\n\n`);
                                // Send exit event so the UI can transition out of the "Running..." state
                                res.write(`data: ${JSON.stringify({
                                    type: 'exit',
                                    data: JSON.stringify({ exitCode: 1, duration }),
                                    timestamp: new Date().toISOString()
                                })}\n\n`);
                                // Update execution record as failed
                                if (hasPostgres() && executionId) {
                                    const db = getPostgres();
                                    await db.query(`UPDATE seed_executions
                     SET status = $1, completed_at = NOW(), error = $2, updated_at = NOW()
                     WHERE id = $3`, ['failed', error instanceof Error ? error.message : String(error), executionId]);
                                }
                                res.end();
                            }
                        }
                        catch (error) {
                            logger.error('Failed to start seed execution', { error });
                            res.status(500).json({
                                error: 'Failed to start seed execution',
                                message: error instanceof Error ? error.message : String(error),
                            });
                        }
                    },
                });
                // POST /database/reset - Drop and recreate database schema (local/dev only)
                registry.addRoute({
                    method: 'post',
                    path: '/database/reset',
                    pluginId: 'maintenance',
                    handler: async (req, res) => {
                        try {
                            // Security: Prevent running on production domain
                            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.APP_URL || '';
                            // Block if domain is exactly faabzi.com (production)
                            // Allow dev.faabzi.com, staging.faabzi.com, localhost, etc.
                            const isProductionDomain = /^https?:\/\/faabzi\.com(\/|$)/.test(serverUrl);
                            if (isProductionDomain) {
                                return res.status(403).json({
                                    error: 'Database reset is not allowed on production domain (faabzi.com)',
                                    currentUrl: serverUrl,
                                    allowedDomains: 'dev.faabzi.com, staging.faabzi.com, localhost, or local',
                                });
                            }
                            if (!hasPostgres()) {
                                return res.status(503).json({
                                    error: 'PostgreSQL plugin required for database reset',
                                });
                            }
                            const db = getPostgres();
                            // Derive the DB role from the connection URL so GRANT statements
                            // work regardless of which user owns the schema.
                            let dbRole = 'qwickapps';
                            if (config.databaseUrl) {
                                try {
                                    const parsedUrl = new URL(config.databaseUrl);
                                    const urlUser = parsedUrl.username;
                                    if (urlUser && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(urlUser)) {
                                        dbRole = urlUser;
                                    }
                                }
                                catch {
                                    // Keep default if URL is unparseable
                                }
                            }
                            // Drop and recreate public schema (removes all tables, data, etc.)
                            await db.queryRaw('DROP SCHEMA IF EXISTS public CASCADE');
                            await db.queryRaw('CREATE SCHEMA public');
                            await db.queryRaw('GRANT ALL ON SCHEMA public TO public');
                            await db.queryRaw('GRANT ALL ON SCHEMA public TO postgres');
                            await db.queryRaw(`GRANT ALL ON SCHEMA public TO ${dbRole}`);
                            // Grant default privileges for future tables and sequences
                            await db.queryRaw(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${dbRole}`);
                            await db.queryRaw(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${dbRole}`);
                            res.json({
                                success: true,
                                message: 'Database schema has been reset. All tables and data have been deleted.',
                                timestamp: new Date().toISOString(),
                            });
                        }
                        catch (error) {
                            logger.error('Database reset failed', { error });
                            res.status(500).json({
                                error: 'Failed to reset database',
                                message: error instanceof Error ? error.message : String(error),
                            });
                        }
                    },
                });
                // GET /seeds/history - List execution history
                registry.addRoute({
                    method: 'get',
                    path: '/seeds/history',
                    pluginId: 'maintenance',
                    handler: async (req, res) => {
                        if (!hasPostgres()) {
                            return res.status(503).json({
                                error: 'PostgreSQL plugin required for execution history',
                            });
                        }
                        try {
                            const db = getPostgres();
                            const limit = Math.min(parseInt(req.query.limit) || 50, 100);
                            const offset = parseInt(req.query.offset) || 0;
                            const status = req.query.status;
                            const search = req.query.search;
                            // Build query
                            let whereClause = '';
                            const params = [];
                            if (status && ['running', 'completed', 'failed'].includes(status)) {
                                params.push(status);
                                whereClause = `WHERE status = $${params.length}`;
                            }
                            if (search) {
                                params.push(`%${search}%`);
                                whereClause += (whereClause ? ' AND' : 'WHERE') + ` name ILIKE $${params.length}`;
                            }
                            // Get total count
                            const countResult = await db.queryOne(`SELECT COUNT(*) as count FROM seed_executions ${whereClause}`, params);
                            const total = parseInt(countResult?.count || '0', 10);
                            // Get executions
                            params.push(limit, offset);
                            const executions = await db.query(`SELECT id, name, status, started_at, completed_at, exit_code, duration_ms,
                        created_at, updated_at
                 FROM seed_executions
                 ${whereClause}
                 ORDER BY started_at DESC
                 LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
                            res.json({ executions, total, limit, offset });
                        }
                        catch (error) {
                            logger.error('Failed to get execution history', { error });
                            res.status(500).json({
                                error: 'Failed to get execution history',
                                message: error instanceof Error ? error.message : String(error),
                            });
                        }
                    },
                });
                // GET /seeds/history/:id - Get execution details
                registry.addRoute({
                    method: 'get',
                    path: '/seeds/history/:id',
                    pluginId: 'maintenance',
                    handler: async (req, res) => {
                        if (!hasPostgres()) {
                            return res.status(503).json({
                                error: 'PostgreSQL plugin required for execution history',
                            });
                        }
                        try {
                            const db = getPostgres();
                            const { id } = req.params;
                            const execution = await db.queryOne('SELECT * FROM seed_executions WHERE id = $1', [id]);
                            if (!execution) {
                                return res.status(404).json({ error: 'Execution not found' });
                            }
                            res.json({ execution });
                        }
                        catch (error) {
                            logger.error('Failed to get execution details', { error });
                            res.status(500).json({
                                error: 'Failed to get execution details',
                                message: error instanceof Error ? error.message : String(error),
                            });
                        }
                    },
                });
            }
            // Migration Management Routes
            if (config.enableMigrations !== false) {
                // Ensure migration_executions table exists
                registry.addRoute({
                    method: 'post',
                    path: '/migrations/_init',
                    pluginId: 'maintenance',
                    handler: async (req, res) => {
                        try {
                            if (hasPostgres()) {
                                const db = getPostgres();
                                await db.queryRaw(`
                  CREATE TABLE IF NOT EXISTS migration_executions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
                    started_at TIMESTAMPTZ NOT NULL,
                    completed_at TIMESTAMPTZ,
                    exit_code INTEGER,
                    output TEXT,
                    error TEXT,
                    duration_ms INTEGER,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                  )
                `);
                                await db.queryRaw(`
                  CREATE INDEX IF NOT EXISTS idx_migration_executions_status
                  ON migration_executions(status)
                `);
                                await db.queryRaw(`
                  CREATE INDEX IF NOT EXISTS idx_migration_executions_started_at
                  ON migration_executions(started_at DESC)
                `);
                            }
                            res.json({ success: true });
                        }
                        catch (error) {
                            logger.error('Failed to initialize migration_executions table', { error });
                            res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
                        }
                    },
                });
                // GET /migrations/status - Get migration status
                registry.addRoute({
                    method: 'get',
                    path: '/migrations/status',
                    pluginId: 'maintenance',
                    handler: async (req, res) => {
                        try {
                            // Check if there are any pending migrations by checking Payload
                            // This is a simple implementation - just returns basic status
                            res.json({
                                available: true,
                                lastChecked: new Date().toISOString(),
                            });
                        }
                        catch (error) {
                            logger.error('Failed to get migration status', { error });
                            res.status(500).json({
                                error: error instanceof Error ? error.message : String(error),
                            });
                        }
                    },
                });
                // GET /migrations/execute - Execute Payload migrations with SSE output
                registry.addRoute({
                    method: 'get',
                    path: '/migrations/execute',
                    pluginId: 'maintenance',
                    handler: async (req, res) => {
                        const MIGRATION_LOCK_ID = 123456789;
                        const MIGRATION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
                        let lockAcquired = false;
                        try {
                            // Ensure table exists (lazy initialization)
                            if (hasPostgres()) {
                                const db = getPostgres();
                                try {
                                    await db.queryRaw(`
                    CREATE TABLE IF NOT EXISTS migration_executions (
                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
                      started_at TIMESTAMPTZ NOT NULL,
                      completed_at TIMESTAMPTZ,
                      exit_code INTEGER,
                      output TEXT,
                      error TEXT,
                      duration_ms INTEGER,
                      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    )
                  `);
                                }
                                catch (err) {
                                    logger.debug('Table initialization check', { err });
                                }
                            }
                            // Acquire advisory lock for concurrency control
                            if (hasPostgres()) {
                                const db = getPostgres();
                                const lockResult = await db.queryOne('SELECT pg_try_advisory_lock($1) as pg_try_advisory_lock', [MIGRATION_LOCK_ID]);
                                lockAcquired = lockResult?.pg_try_advisory_lock || false;
                                if (!lockAcquired) {
                                    return res.status(409).json({
                                        error: 'Migrations are already running. Please wait for them to complete.',
                                    });
                                }
                            }
                            // Set SSE headers
                            res.setHeader('Content-Type', 'text/event-stream');
                            res.setHeader('Cache-Control', 'no-cache');
                            res.setHeader('Connection', 'keep-alive');
                            res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
                            res.setHeader('Content-Encoding', 'identity'); // Disable compression
                            res.flushHeaders();
                            // Create execution record in database
                            let executionId = null;
                            if (hasPostgres()) {
                                const db = getPostgres();
                                const result = await db.queryOne(`INSERT INTO migration_executions (status, started_at)
                   VALUES ($1, NOW())
                   RETURNING id`, ['running']);
                                executionId = result?.id || null;
                            }
                            const startTime = Date.now();
                            let exitCode = undefined;
                            let output = '';
                            let error = '';
                            let migrationProcess = null;
                            let timeoutHandle = null;
                            // Cleanup function to ensure resources are released
                            const cleanup = async (reason) => {
                                logger.debug(`Migration cleanup: ${reason}`, { executionId });
                                // Clear timeout if set
                                if (timeoutHandle) {
                                    clearTimeout(timeoutHandle);
                                    timeoutHandle = null;
                                }
                                // Kill process if still running
                                if (migrationProcess && !migrationProcess.killed) {
                                    migrationProcess.kill('SIGTERM');
                                }
                                // Update execution record if not already completed
                                if (hasPostgres() && executionId && exitCode === undefined) {
                                    const db = getPostgres();
                                    const duration = Date.now() - startTime;
                                    await db.query(`UPDATE migration_executions
                     SET status = $1, completed_at = NOW(),
                         error = $2, duration_ms = $3, updated_at = NOW()
                     WHERE id = $4 AND status = 'running'`, ['failed', reason, duration, executionId]).catch(err => logger.error('Failed to update execution on cleanup', { err }));
                                }
                                // Release advisory lock
                                if (hasPostgres() && lockAcquired) {
                                    const db = getPostgres();
                                    await db.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]).catch(err => logger.error('Failed to release advisory lock', { err }));
                                    lockAcquired = false;
                                }
                            };
                            // Handle client disconnect
                            res.on('close', () => {
                                cleanup('Client disconnected before completion').catch(err => logger.error('Cleanup failed on disconnect', { err }));
                            });
                            try {
                                // Execute Payload migration command
                                const { spawn } = await import('child_process');
                                migrationProcess = spawn('pnpm', ['exec', 'payload', 'migrate', '--force-accept-warning'], {
                                    cwd: process.cwd(),
                                    env: {
                                        ...process.env,
                                        CI: 'true', // Force non-interactive mode
                                        NODE_ENV: 'production', // Disable dev mode prompts
                                    },
                                });
                                // Automatically answer 'y' to any interactive prompts
                                if (migrationProcess.stdin) {
                                    migrationProcess.stdin.write('y\n');
                                    migrationProcess.stdin.end();
                                }
                                // Set timeout to prevent hanging migrations
                                timeoutHandle = setTimeout(() => {
                                    logger.warn('Migration timeout - killing process', { executionId, timeout: MIGRATION_TIMEOUT_MS });
                                    if (migrationProcess && !migrationProcess.killed) {
                                        migrationProcess.kill('SIGTERM');
                                        error += '\n[TIMEOUT] Migration exceeded maximum execution time and was terminated.';
                                    }
                                }, MIGRATION_TIMEOUT_MS);
                                // Stream stdout
                                migrationProcess.stdout?.on('data', (data) => {
                                    const chunk = data.toString();
                                    output += chunk;
                                    if (!res.writableEnded) {
                                        res.write(`data: ${JSON.stringify({
                                            type: 'output',
                                            data: chunk,
                                            timestamp: new Date().toISOString()
                                        })}\n\n`);
                                    }
                                });
                                // Stream stderr
                                migrationProcess.stderr?.on('data', (data) => {
                                    const chunk = data.toString();
                                    error += chunk;
                                    if (!res.writableEnded) {
                                        res.write(`data: ${JSON.stringify({
                                            type: 'error',
                                            data: chunk,
                                            timestamp: new Date().toISOString()
                                        })}\n\n`);
                                    }
                                });
                                // Wait for process to complete
                                await new Promise((resolve, reject) => {
                                    migrationProcess.on('close', (code) => {
                                        exitCode = code || 0;
                                        resolve();
                                    });
                                    migrationProcess.on('error', (err) => {
                                        reject(err);
                                    });
                                });
                                // Clear timeout since process completed
                                if (timeoutHandle) {
                                    clearTimeout(timeoutHandle);
                                    timeoutHandle = null;
                                }
                                const duration = Date.now() - startTime;
                                // Update execution record
                                if (hasPostgres() && executionId) {
                                    const db = getPostgres();
                                    await db.query(`UPDATE migration_executions
                     SET status = $1, completed_at = NOW(), exit_code = $2,
                         output = $3, error = $4, duration_ms = $5, updated_at = NOW()
                     WHERE id = $6`, [
                                        exitCode === 0 ? 'completed' : 'failed',
                                        exitCode,
                                        output,
                                        error,
                                        duration,
                                        executionId,
                                    ]);
                                }
                                // Send completion event
                                if (!res.writableEnded) {
                                    res.write(`data: ${JSON.stringify({
                                        type: 'complete',
                                        exitCode,
                                        duration,
                                        timestamp: new Date().toISOString()
                                    })}\n\n`);
                                }
                                res.end();
                                // Release advisory lock after successful completion
                                if (hasPostgres() && lockAcquired) {
                                    const db = getPostgres();
                                    await db.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]);
                                    lockAcquired = false;
                                }
                            }
                            catch (error) {
                                logger.error('Migration execution failed', { error });
                                // Send error event via SSE
                                if (!res.writableEnded) {
                                    res.write(`data: ${JSON.stringify({
                                        type: 'error',
                                        data: error instanceof Error ? error.message : String(error),
                                        timestamp: new Date().toISOString()
                                    })}\n\n`);
                                }
                                // Update execution record as failed
                                if (hasPostgres() && executionId) {
                                    const db = getPostgres();
                                    const duration = Date.now() - startTime;
                                    await db.query(`UPDATE migration_executions
                     SET status = $1, completed_at = NOW(),
                         error = $2, duration_ms = $3, updated_at = NOW()
                     WHERE id = $4`, ['failed', error instanceof Error ? error.message : String(error), duration, executionId]);
                                }
                                res.end();
                                // Release advisory lock after error
                                if (hasPostgres() && lockAcquired) {
                                    const db = getPostgres();
                                    await db.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]);
                                    lockAcquired = false;
                                }
                            }
                        }
                        catch (error) {
                            logger.error('Migration execution setup failed', { error });
                            // Release advisory lock if acquired
                            if (hasPostgres() && lockAcquired) {
                                const db = getPostgres();
                                await db.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID])
                                    .catch(err => logger.error('Failed to release lock on setup error', { err }));
                            }
                            res.status(500).json({
                                error: error instanceof Error ? error.message : String(error),
                            });
                        }
                    },
                });
                // GET /migrations/history - Get migration execution history
                registry.addRoute({
                    method: 'get',
                    path: '/migrations/history',
                    pluginId: 'maintenance',
                    handler: async (req, res) => {
                        try {
                            if (!hasPostgres()) {
                                return res.json({ executions: [] });
                            }
                            const db = getPostgres();
                            const { limit = '10', offset = '0', status, search } = req.query;
                            let query = 'SELECT * FROM migration_executions WHERE 1=1';
                            const params = [];
                            let paramIndex = 1;
                            if (status && typeof status === 'string') {
                                query += ` AND status = $${paramIndex}`;
                                params.push(status);
                                paramIndex++;
                            }
                            if (search && typeof search === 'string') {
                                query += ` AND (output ILIKE $${paramIndex} OR error ILIKE $${paramIndex})`;
                                params.push(`%${search}%`);
                                paramIndex++;
                            }
                            query += ` ORDER BY started_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
                            params.push(parseInt(limit, 10), parseInt(offset, 10));
                            const executions = await db.query(query, params);
                            // Get total count
                            let countQuery = 'SELECT COUNT(*) as count FROM migration_executions WHERE 1=1';
                            const countParams = [];
                            let countParamIndex = 1;
                            if (status && typeof status === 'string') {
                                countQuery += ` AND status = $${countParamIndex}`;
                                countParams.push(status);
                                countParamIndex++;
                            }
                            if (search && typeof search === 'string') {
                                countQuery += ` AND (output ILIKE $${countParamIndex} OR error ILIKE $${countParamIndex})`;
                                countParams.push(`%${search}%`);
                            }
                            const countResult = await db.queryOne(countQuery, countParams);
                            const total = parseInt(countResult?.count || '0', 10);
                            res.json({
                                executions,
                                pagination: {
                                    total,
                                    limit: parseInt(limit, 10),
                                    offset: parseInt(offset, 10),
                                },
                            });
                        }
                        catch (error) {
                            logger.error('Failed to fetch migration history', { error });
                            res.status(500).json({
                                error: error instanceof Error ? error.message : String(error),
                            });
                        }
                    },
                });
                // GET /migrations/history/:id - Get detailed migration execution result
                registry.addRoute({
                    method: 'get',
                    path: '/migrations/history/:id',
                    pluginId: 'maintenance',
                    handler: async (req, res) => {
                        try {
                            if (!hasPostgres()) {
                                return res.status(404).json({ error: 'Execution not found' });
                            }
                            const { id } = req.params;
                            const db = getPostgres();
                            const execution = await db.queryOne('SELECT * FROM migration_executions WHERE id = $1', [id]);
                            if (!execution) {
                                return res.status(404).json({ error: 'Execution not found' });
                            }
                            res.json({ execution });
                        }
                        catch (error) {
                            logger.error('Failed to fetch migration execution detail', { error });
                            res.status(500).json({
                                error: error instanceof Error ? error.message : String(error),
                                message: error instanceof Error ? error.message : String(error),
                            });
                        }
                    },
                });
            }
            // Register maintenance widgets
            if (config.enableSeeds !== false) {
                registry.addWidget({
                    id: 'seed-management',
                    title: 'Seed Management',
                    component: 'SeedManagementWidget',
                    type: 'maintenance',
                    priority: 10,
                    showByDefault: true, // Show by default on maintenance page
                    pluginId: 'maintenance',
                });
            }
            // Register migration management widget
            if (config.enableMigrations !== false) {
                registry.addWidget({
                    id: 'migration-management',
                    title: 'Database Migrations',
                    component: 'MigrationManagementWidget',
                    type: 'maintenance',
                    priority: 15,
                    showByDefault: true, // Show by default on maintenance page
                    pluginId: 'maintenance',
                });
            }
            // TODO: Register service control routes
            if (config.enableServiceControl !== false) {
                logger.debug('Service control enabled');
                // Routes will be added in #703
                registry.addWidget({
                    id: 'service-control',
                    title: 'Service Control',
                    component: 'ServiceControlWidget',
                    type: 'maintenance',
                    priority: 20,
                    showByDefault: false,
                    pluginId: 'maintenance',
                });
            }
            // TODO: Register environment variable management routes
            if (config.enableEnvManagement !== false) {
                logger.debug('Environment variable management enabled');
                // Routes will be added in #704
                registry.addWidget({
                    id: 'environment-config',
                    title: 'Environment Configuration',
                    component: 'EnvironmentConfigWidget',
                    type: 'maintenance',
                    priority: 30,
                    showByDefault: false,
                    pluginId: 'maintenance',
                });
            }
            // TODO: Register database operation routes
            if (config.enableDatabaseOps !== false) {
                logger.debug('Database operations enabled');
                // Routes will be added in #705
                registry.addWidget({
                    id: 'database-ops',
                    title: 'Database Operations',
                    component: 'DatabaseOpsWidget',
                    type: 'maintenance',
                    priority: 40,
                    showByDefault: false,
                    pluginId: 'maintenance',
                });
            }
            // Register UI page
            registry.addPage({
                id: 'maintenance',
                route: '/maintenance',
                component: 'MaintenanceManagementPage',
                title: 'Maintenance',
                pluginId: 'maintenance',
            });
            // Register menu contribution
            registry.addMenuItem({
                id: 'maintenance',
                label: 'Maintenance',
                route: '/maintenance',
                icon: 'build',
                pluginId: 'maintenance',
                order: 900,
            });
            logger.info('Maintenance plugin started successfully');
        },
        async onStop() {
            // Cleanup if needed
        },
    };
}
//# sourceMappingURL=maintenance-plugin.js.map