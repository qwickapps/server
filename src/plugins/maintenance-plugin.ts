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
import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../core/plugin-registry.js';
import { SeedExecutor, validateScriptPath } from './maintenance/seed-executor.js';
import { getPostgres, hasPostgres } from './postgres-plugin.js';

/**
 * Extract description from JSDoc comment at top of file
 */
function extractDescription(filePath: string): string | undefined {
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
  } catch (err) {
    // Failed to read file or parse description
  }

  return undefined;
}

/**
 * Recursively scan directory for .mjs files
 */
function scanSeedScripts(dir: string, basePath: string = dir): any[] {
  const results: any[] = [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        results.push(...scanSeedScripts(fullPath, basePath));
      } else if (entry.isFile() && entry.name.endsWith('.mjs')) {
        // Found a .mjs file
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
  } catch (err) {
    // Directory not accessible, return empty array
  }

  return results;
}

/**
 * Custom seed task handler
 */
export interface SeedTaskHandler {
  (options?: Record<string, any>, res?: Response): Promise<void>;
}

/**
 * Custom seed task definition
 */
export interface SeedTask {
  /** Unique task identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description of what this task does */
  description: string;
  /** Task handler function */
  handler: SeedTaskHandler;
  /** Optional task options/parameters */
  options?: Record<string, any>;
}

export interface MaintenancePluginConfig {
  /** Path to scripts directory (default: './scripts') */
  scriptsPath?: string;

  /** Path to .env file (default: './.env.local') */
  envFilePath?: string;

  /** Database connection URL (for backup/restore) */
  databaseUrl?: string;

  /** Backup storage path (default: './backups') */
  backupsPath?: string;

  /** Enable seed management (default: true) */
  enableSeeds?: boolean;

  /** Enable service control (default: true) */
  enableServiceControl?: boolean;

  /** Enable environment variable management (default: true) */
  enableEnvManagement?: boolean;

  /** Enable database operations (default: true) */
  enableDatabaseOps?: boolean;

  /** Custom seed tasks */
  customTasks?: SeedTask[];
}

/**
 * Create a maintenance plugin
 */
export function createMaintenancePlugin(config: MaintenancePluginConfig = {}): Plugin {
  const scriptsPath = config.scriptsPath || './scripts';
  const envFilePath = config.envFilePath || './.env.local';
  const backupsPath = config.backupsPath || './backups';

  return {
    id: 'maintenance',
    name: 'Maintenance Plugin',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
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
        } catch (error) {
          logger.error('Failed to initialize seed_executions table', { error });
        }
      }

      // Clean up orphaned executions from previous crashes
      if (hasPostgres()) {
        try {
          const db = getPostgres();
          const result = await db.queryRaw(
            `UPDATE seed_executions
             SET status = 'failed',
                 error = 'Server interrupted during execution',
                 completed_at = NOW(),
                 updated_at = NOW()
             WHERE status = 'running'`
          );
          if (result.rowCount && result.rowCount > 0) {
            logger.warn(`Cleaned up ${result.rowCount} orphaned seed execution(s)`);
          }
        } catch (error) {
          logger.error('Failed to clean up orphaned executions', { error });
        }
      }

      // Register status endpoint
      registry.addRoute({
        method: 'get',
        path: '/status',
        pluginId: 'maintenance',
        handler: (_req: Request, res: Response) => {
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
          handler: (_req: Request, res: Response) => {
            try {
              const resolvedPath = resolve(scriptsPath);
              let seedFiles: any[] = [];

              try {
                // Recursively scan for .mjs files
                seedFiles = scanSeedScripts(resolvedPath);

                // Sort by relative path (natural ordering respects numbered prefixes)
                // Example: "01-Setup/001.init.mjs" comes before "02-Production/001.seed.mjs"
                seedFiles.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
              } catch (err) {
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
            } catch (error) {
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
          handler: async (req: Request, res: Response) => {
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
                } catch (err) {
                  logger.debug('Table initialization check', { err });
                }
              }

              // Check for concurrent execution
              if (hasPostgres()) {
                const db = getPostgres();
                const running = await db.queryOne(
                  'SELECT id FROM seed_executions WHERE status = $1',
                  ['running']
                );

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
              let executionId: string | null = null;
              if (hasPostgres()) {
                const db = getPostgres();
                const result = await db.queryOne<{ id: string }>(
                  `INSERT INTO seed_executions (name, status, started_at)
                   VALUES ($1, $2, NOW())
                   RETURNING id`,
                  [name, 'running']
                );
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
                } else {
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
                  await db.query(
                    `UPDATE seed_executions
                     SET status = $1, completed_at = NOW(), exit_code = $2,
                         output = $3, error = $4, duration_ms = $5, updated_at = NOW()
                     WHERE id = $6`,
                    [
                      exitCode === 0 ? 'completed' : 'failed',
                      exitCode,
                      output,
                      error,
                      duration,
                      executionId,
                    ]
                  );
                }

                res.end();
              } catch (error) {
                logger.error('Seed execution failed', { name, error });

                // Send error event via SSE to notify client
                res.write(`data: ${JSON.stringify({
                  type: 'error',
                  data: error instanceof Error ? error.message : String(error),
                  timestamp: new Date().toISOString()
                })}\n\n`);

                // Update execution record as failed
                if (hasPostgres() && executionId) {
                  const db = getPostgres();
                  await db.query(
                    `UPDATE seed_executions
                     SET status = $1, completed_at = NOW(), error = $2, updated_at = NOW()
                     WHERE id = $3`,
                    ['failed', error instanceof Error ? error.message : String(error), executionId]
                  );
                }

                res.end();
              }
            } catch (error) {
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
          handler: async (req: Request, res: Response) => {
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

              // Drop and recreate public schema (removes all tables, data, etc.)
              await db.queryRaw('DROP SCHEMA IF EXISTS public CASCADE');
              await db.queryRaw('CREATE SCHEMA public');
              await db.queryRaw('GRANT ALL ON SCHEMA public TO public');
              await db.queryRaw('GRANT ALL ON SCHEMA public TO postgres');
              await db.queryRaw('GRANT ALL ON SCHEMA public TO qwickapps');

              // Grant default privileges for future tables and sequences
              await db.queryRaw('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO qwickapps');
              await db.queryRaw('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO qwickapps');

              res.json({
                success: true,
                message: 'Database schema has been reset. All tables and data have been deleted.',
                timestamp: new Date().toISOString(),
              });
            } catch (error) {
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
          handler: async (req: Request, res: Response) => {
            if (!hasPostgres()) {
              return res.status(503).json({
                error: 'PostgreSQL plugin required for execution history',
              });
            }

            try {
              const db = getPostgres();
              const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
              const offset = parseInt(req.query.offset as string) || 0;
              const status = req.query.status as string;
              const search = req.query.search as string;

              // Build query
              let whereClause = '';
              const params: unknown[] = [];

              if (status && ['running', 'completed', 'failed'].includes(status)) {
                params.push(status);
                whereClause = `WHERE status = $${params.length}`;
              }

              if (search) {
                params.push(`%${search}%`);
                whereClause += (whereClause ? ' AND' : 'WHERE') + ` name ILIKE $${params.length}`;
              }

              // Get total count
              const countResult = await db.queryOne<{ count: string }>(
                `SELECT COUNT(*) as count FROM seed_executions ${whereClause}`,
                params
              );
              const total = parseInt(countResult?.count || '0', 10);

              // Get executions
              params.push(limit, offset);
              const executions = await db.query(
                `SELECT id, name, status, started_at, completed_at, exit_code, duration_ms,
                        created_at, updated_at
                 FROM seed_executions
                 ${whereClause}
                 ORDER BY started_at DESC
                 LIMIT $${params.length - 1} OFFSET $${params.length}`,
                params
              );

              res.json({ executions, total, limit, offset });
            } catch (error) {
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
          handler: async (req: Request, res: Response) => {
            if (!hasPostgres()) {
              return res.status(503).json({
                error: 'PostgreSQL plugin required for execution history',
              });
            }

            try {
              const db = getPostgres();
              const { id } = req.params;

              const execution = await db.queryOne(
                'SELECT * FROM seed_executions WHERE id = $1',
                [id]
              );

              if (!execution) {
                return res.status(404).json({ error: 'Execution not found' });
              }

              res.json({ execution });
            } catch (error) {
              logger.error('Failed to get execution details', { error });
              res.status(500).json({
                error: 'Failed to get execution details',
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

    async onStop(): Promise<void> {
      // Cleanup if needed
    },
  };
}
