/**
 * CMS Plugin
 *
 * Manages Payload CMS service integration, monitoring, and control.
 * Provides dashboard widgets, restart capabilities, and seed management.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type { Express } from 'express';

export interface CMSPluginConfig {
  /** Payload CMS service URL (e.g., http://localhost:3301) */
  serviceUrl: string;
  /** Path to seed scripts directory */
  seedsPath?: string;
  /** Whether to show dashboard widget (default: true) */
  showDashboardWidget?: boolean;
  /** Whether to show maintenance widget (default: true) */
  showMaintenanceWidget?: boolean;
}

/**
 * Create a CMS plugin for Payload CMS service management
 */
export function createCMSPlugin(config: CMSPluginConfig): Plugin {
  return {
    id: 'cms',
    name: 'CMS Plugin',
    version: '1.0.0',

    async onStart(pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      const logger = registry.getLogger('cms');
      const app = registry.getApp() as Express;

      logger.info('CMS Plugin starting...');
      logger.debug(`Service URL: ${config.serviceUrl}`);

      // Register health check for Payload CMS service
      registry.registerHealthCheck({
        name: 'payload-cms-service',
        type: 'http',
        url: `${config.serviceUrl}/api/health`,
      });

      // Register dashboard widget for CMS status
      if (config.showDashboardWidget !== false) {
        registry.addWidget({
          id: 'cms-status',
          title: 'Payload CMS',
          component: 'CMSStatusWidget',
          priority: 15, // After ServiceHealthWidget (10)
          showByDefault: true,
          pluginId: 'cms',
        });
      }

      // Register maintenance widget for CMS operations
      if (config.showMaintenanceWidget !== false) {
        registry.addWidget({
          id: 'cms-maintenance',
          title: 'CMS Service Control',
          component: 'CMSMaintenanceWidget',
          priority: 10,
          showByDefault: false, // Only shown on maintenance page
          pluginId: 'cms',
        });
      }

      // API Routes
      /**
       * GET /api/cms/status
       * Get Payload CMS service status
       */
      registry.addRoute({
        method: 'get',
        path: '/status',
        pluginId: 'cms',
        handler: async (_req, res) => {
          try {
            const response = await fetch(`${config.serviceUrl}/api/health`, {
              method: 'GET',
              signal: AbortSignal.timeout(5000),
            });

            const health = await response.json();

            res.json({
              status: response.ok ? 'running' : 'unhealthy',
              url: config.serviceUrl,
              health,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            logger.error('Failed to check CMS status:', error as Record<string, unknown>);
            res.status(503).json({
              status: 'down',
              url: config.serviceUrl,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString(),
            });
          }
        },
      });

      /**
       * POST /api/cms/restart
       * Restart Payload CMS service
       *
       * Note: This is a placeholder. Actual restart would require process management
       * (PM2, systemd, Docker, etc.) and appropriate permissions.
       */
      registry.addRoute({
        method: 'post',
        path: '/restart',
        pluginId: 'cms',
        handler: async (_req, res) => {
          logger.warn('CMS restart requested - not implemented');
          res.status(501).json({
            error: 'Not implemented',
            message: 'CMS restart requires process manager integration (PM2, systemd, Docker, etc.)',
            suggestion: 'Use your process manager to restart the Payload service',
          });
        },
      });

      /**
       * GET /api/cms/seeds
       * List available seed scripts
       */
      registry.addRoute({
        method: 'get',
        path: '/seeds',
        pluginId: 'cms',
        handler: async (_req, res) => {
        try {
          if (!config.seedsPath) {
            return res.json({ seeds: [] });
          }

          const fs = await import('fs/promises');
          const path = await import('path');

          const files = await fs.readdir(config.seedsPath);
          const seedFiles = files.filter(f =>
            f.startsWith('seed-') && (f.endsWith('.mjs') || f.endsWith('.js'))
          );

          const seeds = seedFiles.map(file => ({
            name: file.replace(/^seed-/, '').replace(/\.(m)?js$/, ''),
            file,
            path: path.join(config.seedsPath!, file),
          }));

          res.json({ seeds });
        } catch (error) {
          logger.error('Failed to list seeds:', error as Record<string, unknown>);
          res.status(500).json({
            error: 'Failed to list seeds',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
        },
      });

      /**
       * POST /api/cms/seeds/:seedName/execute
       * Execute a seed script
       */
      registry.addRoute({
        method: 'post',
        path: '/seeds/:seedName/execute',
        pluginId: 'cms',
        handler: async (req, res) => {
          const { seedName } = req.params;

        logger.info(`Executing seed: ${seedName}`);

        try {
          if (!config.seedsPath) {
            return res.status(400).json({
              error: 'Seeds not configured',
              message: 'seedsPath not provided in plugin configuration',
            });
          }

          const path = await import('path');
          const { spawn } = await import('child_process');

          // Find the seed file
          const seedFile = `seed-${seedName}.mjs`;
          const seedPath = path.join(config.seedsPath, seedFile);

          // Execute seed script
          const child = spawn('node', [seedPath], {
            cwd: process.cwd(),
            env: process.env,
          });

          let stdout = '';
          let stderr = '';

          child.stdout.on('data', (data) => {
            stdout += data.toString();
          });

          child.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          child.on('close', (code) => {
            if (code === 0) {
              logger.info(`Seed ${seedName} completed successfully`);
              res.json({
                success: true,
                seedName,
                output: stdout,
                executedAt: new Date().toISOString(),
              });
            } else {
              logger.error(`Seed ${seedName} failed with code ${code}`);
              res.status(500).json({
                success: false,
                seedName,
                error: `Seed script exited with code ${code}`,
                output: stdout,
                errorOutput: stderr,
              });
            }
          });

          child.on('error', (error) => {
            logger.error(`Failed to execute seed ${seedName}:`, { error: error.message });
            res.status(500).json({
              success: false,
              seedName,
              error: error.message,
            });
          });
        } catch (error) {
          logger.error(`Failed to execute seed ${seedName}:`, error as Record<string, unknown>);
          res.status(500).json({
            success: false,
            seedName,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
        },
      });

      logger.info('CMS Plugin started successfully');
    },

    async onStop(): Promise<void> {
      // Nothing to cleanup
    },
  };
}
