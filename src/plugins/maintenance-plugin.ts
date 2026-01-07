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

import { readdirSync, statSync } from 'fs';
import { resolve } from 'path';
import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../core/plugin-registry.js';
import { SeedExecutor, validateScriptPath } from './maintenance/seed-executor.js';
import { getPostgres, hasPostgres } from './postgres-plugin.js';

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

        // GET /seeds/discover - List available seed scripts
        registry.addRoute({
          method: 'get',
          path: '/seeds/discover',
          pluginId: 'maintenance',
          handler: (_req: Request, res: Response) => {
            try {
              const resolvedPath = resolve(scriptsPath);
              const files = readdirSync(resolvedPath);

              // Filter for seed-*.mjs files
              const seedFiles = files
                .filter((file) => /^seed-[a-z0-9-]+\.mjs$/.test(file))
                .map((file) => {
                  const filePath = resolve(resolvedPath, file);
                  const stats = statSync(filePath);
                  return {
                    name: file,
                    path: filePath,
                    size: stats.size,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime,
                  };
                })
                .sort((a, b) => a.name.localeCompare(b.name));

              res.json({ seeds: seedFiles });
            } catch (error) {
              logger.error('Failed to discover seed scripts', { error });
              res.status(500).json({
                error: 'Failed to discover seed scripts',
                message: error instanceof Error ? error.message : String(error),
              });
            }
          },
        });

        // POST /seeds/execute - Execute a seed script
        registry.addRoute({
          method: 'post',
          path: '/seeds/execute',
          pluginId: 'maintenance',
          handler: async (req: Request, res: Response) => {
            try {
              const { name } = req.body;

              if (!name || typeof name !== 'string') {
                return res.status(400).json({ error: 'Script name is required' });
              }

              // Validate script path
              const scriptPath = validateScriptPath(name, scriptsPath);
              if (!scriptPath) {
                return res.status(400).json({ error: 'Invalid script name or file not found' });
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

              // Execute seed script
              const executor = new SeedExecutor();
              try {
                const result = await executor.execute(scriptPath, res);

                // Update execution record
                if (hasPostgres() && executionId) {
                  const db = getPostgres();
                  await db.query(
                    `UPDATE seed_executions
                     SET status = $1, completed_at = NOW(), exit_code = $2,
                         output = $3, error = $4, duration_ms = $5, updated_at = NOW()
                     WHERE id = $6`,
                    [
                      result.exitCode === 0 ? 'completed' : 'failed',
                      result.exitCode,
                      result.output,
                      result.error,
                      result.duration,
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

      // TODO: Register service control routes
      if (config.enableServiceControl !== false) {
        logger.debug('Service control enabled');
        // Routes will be added in #703
      }

      // TODO: Register environment variable management routes
      if (config.enableEnvManagement !== false) {
        logger.debug('Environment variable management enabled');
        // Routes will be added in #704
      }

      // TODO: Register database operation routes
      if (config.enableDatabaseOps !== false) {
        logger.debug('Database operations enabled');
        // Routes will be added in #705
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
