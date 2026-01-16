/**
 * Notifications Plugin
 *
 * Provides realtime SSE-based notifications for @qwickapps/server applications.
 * Uses PostgreSQL LISTEN/NOTIFY for event distribution.
 *
 * ## Features
 * - PostgreSQL LISTEN/NOTIFY integration
 * - SSE endpoint for client connections
 * - Device/user-based event filtering
 * - Automatic reconnection with exponential backoff
 * - Heartbeat system for connection health
 * - Statistics and monitoring
 *
 * ## Usage
 *
 * ```typescript
 * import { createGateway, createNotificationsPlugin } from '@qwickapps/server';
 *
 * const gateway = createGateway({
 *   productName: 'MyApp',
 *   controlPanel: {
 *     plugins: [
 *       { plugin: createPostgresPlugin({ url: DATABASE_URL }) },
 *       { plugin: createNotificationsPlugin({
 *         channels: ['events', 'messages'],
 *         heartbeat: { interval: 60000 },
 *       }) },
 *     ],
 *   },
 * });
 * ```
 *
 * ## SSE Endpoint
 *
 * ```
 * GET /notifications/stream?device_id=xxx&user_id=yyy
 *
 * Events:
 *   - connected: Initial connection confirmation
 *   - heartbeat: Periodic health check
 *   - {channel}: Events from subscribed channels
 * ```
 *
 * ## Security Note
 *
 * This plugin does NOT handle authentication. Authentication should be
 * configured at the gateway level using the `guard` option or an auth
 * middleware. The plugin trusts that requests reaching it are authorized.
 *
 * Example with gateway guard:
 * ```typescript
 * const gateway = createGateway({
 *   controlPanel: {
 *     guard: { type: 'basic', username: 'admin', password: 'secret' },
 *     plugins: [createNotificationsPlugin({ ... })],
 *   },
 * });
 * ```
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type { NotificationsPluginConfig } from './types.js';
import {
  NotificationsManager,
  setNotificationsManager,
} from './notifications-manager.js';
import { getPostgres, hasPostgres } from '../postgres-plugin.js';
import { getAuthenticatedUser } from '../auth/auth-plugin.js';

// Validation constants
const MAX_ID_LENGTH = 128;
const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * Validate a device_id or user_id parameter
 */
function validateId(id: string | undefined, paramName: string): { valid: boolean; error?: string } {
  if (!id) {
    return { valid: true }; // undefined is allowed
  }

  if (id.length > MAX_ID_LENGTH) {
    return { valid: false, error: `${paramName} exceeds maximum length of ${MAX_ID_LENGTH} characters` };
  }

  if (!ID_PATTERN.test(id)) {
    return { valid: false, error: `${paramName} contains invalid characters (allowed: alphanumeric, underscore, hyphen)` };
  }

  return { valid: true };
}

/**
 * Create the Notifications plugin
 *
 * @param config Plugin configuration
 * @returns Plugin instance
 *
 * @example
 * ```typescript
 * import { createNotificationsPlugin } from '@qwickapps/server';
 *
 * const plugin = createNotificationsPlugin({
 *   channels: ['bot_events', 'chat_messages'],
 *   heartbeat: { interval: 60000 },
 *   api: { prefix: '/notifications' },
 * });
 * ```
 */
export function createNotificationsPlugin(config: NotificationsPluginConfig): Plugin {
  const apiPrefix = config.api?.prefix || '/'; // Framework adds /notifications prefix automatically
  const streamEnabled = config.api?.stream !== false;
  const statsEnabled = config.api?.stats !== false;

  let manager: NotificationsManager | null = null;

  return {
    id: 'notifications',
    name: 'Notifications',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      const logger = registry.getLogger('notifications');

      // Check for postgres plugin dependency
      if (!hasPostgres()) {
        throw new Error(
          'Notifications plugin requires postgres plugin. ' +
          'Please add createPostgresPlugin() before createNotificationsPlugin().'
        );
      }

      // Get database connection string from postgres plugin
      const postgres = getPostgres();
      const pool = postgres.getPool();

      // Extract connection string from pool config
      // Note: pg.Pool stores config internally, we need to reconstruct it
      const poolConfig = (pool as unknown as { options: { connectionString?: string } }).options;
      let connectionString = poolConfig?.connectionString;

      if (!connectionString) {
        // If no connection string, try to get from environment
        connectionString = process.env.DATABASE_URL;
      }

      if (!connectionString) {
        throw new Error(
          'Could not determine PostgreSQL connection string. ' +
          'Ensure DATABASE_URL is set or postgres plugin was configured with a URL.'
        );
      }

      logger.debug('Initializing notifications manager', {
        channels: config.channels,
        heartbeatInterval: config.heartbeat?.interval,
      });

      // Create and initialize manager
      manager = new NotificationsManager(
        connectionString,
        config.channels,
        config,
        logger
      );

      await manager.initialize();
      setNotificationsManager(manager);

      // Register health check
      registry.registerHealthCheck({
        name: 'notifications',
        type: 'custom',
        check: async () => {
          const health = manager?.getConnectionHealth();
          return {
            healthy: health?.isHealthy ?? false,
            details: {
              connected: health?.isConnected,
              channels: config.channels,
              activeClients: manager?.getStats().currentConnections ?? 0,
              lastEventAt: health?.lastEventAt?.toISOString(),
              isReconnecting: health?.isReconnecting,
            },
          };
        },
      });

      // Register SSE stream endpoint
      if (streamEnabled) {
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/stream`,
          pluginId: 'notifications',
          handler: (req: Request, res: Response) => {
            const deviceId = req.query.device_id as string | undefined;
            const userId = req.query.user_id as string | undefined;

            // Require at least one filter
            if (!deviceId && !userId) {
              res.status(400).json({
                error: 'Bad Request',
                message: 'At least one of device_id or user_id query parameter is required',
              });
              return;
            }

            // Validate device_id
            const deviceValidation = validateId(deviceId, 'device_id');
            if (!deviceValidation.valid) {
              res.status(400).json({
                error: 'Bad Request',
                message: deviceValidation.error,
              });
              return;
            }

            // Validate user_id
            const userValidation = validateId(userId, 'user_id');
            if (!userValidation.valid) {
              res.status(400).json({
                error: 'Bad Request',
                message: userValidation.error,
              });
              return;
            }

            // Set SSE headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

            // Disable compression for SSE
            res.setHeader('Content-Encoding', 'identity');

            // Flush headers
            res.flushHeaders();

            // Generate client ID and register
            const clientId = randomUUID();
            const registered = manager?.registerClient(clientId, deviceId, userId, res);

            // Handle capacity limit
            if (!registered) {
              res.write('event: error\n');
              res.write('data: {"error": "Server at capacity, please try again later"}\n\n');
              res.end();
            }
          },
        });

        logger.debug(`SSE endpoint registered: GET ${apiPrefix}/stream`);
      }

      // Register stats endpoint
      if (statsEnabled) {
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/stats`,
          pluginId: 'notifications',
          handler: (_req: Request, res: Response) => {
            if (!manager) {
              res.status(503).json({ error: 'Service unavailable' });
              return;
            }

            const stats = manager.getStats();
            res.json({
              ...stats,
              channels: config.channels,
              lastEventAt: stats.connectionHealth.lastEventAt?.toISOString(),
              lastReconnectionAt: stats.lastReconnectionAt?.toISOString(),
            });
          },
        });

        logger.debug(`Stats endpoint registered: GET ${apiPrefix}/stats`);

        // Register clients endpoint
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/clients`,
          pluginId: 'notifications',
          handler: (_req: Request, res: Response) => {
            if (!manager) {
              res.status(503).json({ error: 'Service unavailable' });
              return;
            }

            const clients = manager.getClients();
            res.json({
              clients,
              total: clients.length,
            });
          },
        });

        logger.debug(`Clients endpoint registered: GET ${apiPrefix}/clients`);

        // Register disconnect client endpoint
        registry.addRoute({
          method: 'delete',
          path: `${apiPrefix}/clients/:id`,
          pluginId: 'notifications',
          handler: (req: Request, res: Response) => {
            if (!manager) {
              res.status(503).json({ error: 'Service unavailable' });
              return;
            }

            const clientId = req.params.id;
            if (!clientId) {
              res.status(400).json({ error: 'Bad Request', message: 'Client ID is required' });
              return;
            }

            // Get admin user info for audit logging
            const adminUser = getAuthenticatedUser(req);
            const disconnectedBy = {
              userId: adminUser?.id,
              email: adminUser?.email,
              ip: req.ip || req.socket.remoteAddress,
            };

            const disconnected = manager.disconnectClient(clientId, disconnectedBy);
            if (!disconnected) {
              res.status(404).json({ error: 'Not Found', message: 'Client not found' });
              return;
            }

            res.json({ success: true });
          },
        });

        logger.debug(`Disconnect endpoint registered: DELETE ${apiPrefix}/clients/:id`);

        // Register force reconnect endpoint
        registry.addRoute({
          method: 'post',
          path: `${apiPrefix}/reconnect`,
          pluginId: 'notifications',
          handler: async (_req: Request, res: Response) => {
            if (!manager) {
              res.status(503).json({ error: 'Service unavailable' });
              return;
            }

            try {
              await manager.forceReconnect();
              res.json({ success: true, message: 'Reconnection initiated' });
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
              res.status(500).json({ error: 'Reconnection failed', message: errorMsg });
            }
          },
        });

        logger.debug(`Reconnect endpoint registered: POST ${apiPrefix}/reconnect`);

        // Register UI menu item for management page
        registry.addMenuItem({
          pluginId: 'notifications',
          id: 'notifications:sidebar',
          label: 'Notifications',
          icon: 'notifications',
          route: '/notifications',
          order: 45, // After Rate Limits (40)
        });

        // Register dashboard widget
        registry.addWidget({
          id: 'notifications-stats',
          title: 'Notifications',
          component: 'NotificationsStatsWidget',
          type: 'status',
          priority: 25, // After ServiceHealthWidget (10) and AuthStatusWidget (20)
          showByDefault: true,
          pluginId: 'notifications',
        });
      }

      logger.info('Notifications plugin started');
    },

    async onStop(): Promise<void> {
      if (manager) {
        await manager.shutdown();
        setNotificationsManager(null);
        manager = null;
      }
    },
  };
}
