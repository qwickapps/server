/**
 * Rate Limit Plugin
 *
 * Provides rate limiting capabilities for @qwickapps/server.
 * Includes PostgreSQL persistence with RLS, caching, multiple strategies,
 * and Express middleware.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type { RateLimitPluginConfig, RateLimitStrategy } from './types.js';
import type { AuthenticatedRequest } from '../auth/types.js';
import { RateLimitService, setRateLimitService } from './rate-limit-service.js';
import { createRateLimitCache } from './stores/cache-store.js';
import { createCleanupJob, type CleanupJob } from './cleanup.js';

/**
 * Runtime configuration state
 */
interface RuntimeConfig {
  windowMs: number;
  maxRequests: number;
  strategy: RateLimitStrategy;
  cleanupEnabled: boolean;
  cleanupIntervalMs: number;
}

/**
 * Create the Rate Limit plugin
 *
 * @param config Plugin configuration
 * @returns Plugin instance
 *
 * @example
 * ```ts
 * import {
 *   createGateway,
 *   createRateLimitPlugin,
 *   postgresRateLimitStore,
 *   getPostgres,
 * } from '@qwickapps/server';
 *
 * const gateway = createGateway({
 *   plugins: [
 *     createRateLimitPlugin({
 *       store: postgresRateLimitStore({
 *         pool: () => getPostgres().getPool(),
 *       }),
 *       defaults: {
 *         windowMs: 60000,
 *         maxRequests: 100,
 *         strategy: 'sliding-window',
 *       },
 *     }),
 *   ],
 * });
 * ```
 */
export function createRateLimitPlugin(config: RateLimitPluginConfig): Plugin {
  const debug = config.debug || false;
  const apiPrefix = config.api?.prefix || '/rate-limit';
  const apiEnabled = config.api?.enabled !== false;
  const uiEnabled = config.ui?.enabled !== false;
  const initialCleanupEnabled = config.cleanup?.enabled !== false;
  const initialCleanupIntervalMs = config.cleanup?.intervalMs || 300000;

  let service: RateLimitService | null = null;
  let cleanupJob: CleanupJob | null = null;
  let cache: ReturnType<typeof createRateLimitCache>;

  // Runtime config state (can be modified via API)
  const runtimeConfig: RuntimeConfig = {
    windowMs: config.defaults?.windowMs || 60000,
    maxRequests: config.defaults?.maxRequests || 100,
    strategy: config.defaults?.strategy || 'sliding-window',
    cleanupEnabled: initialCleanupEnabled,
    cleanupIntervalMs: initialCleanupIntervalMs,
  };

  function log(message: string, data?: Record<string, unknown>) {
    if (debug) {
      console.log(`[RateLimitPlugin] ${message}`, data || '');
    }
  }

  return {
    id: 'rate-limit',
    name: 'Rate Limit',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      log('Starting rate limit plugin');

      // Initialize the store
      await config.store.initialize();
      log('Store initialized');

      // Create cache
      cache = createRateLimitCache(config.cache);
      log('Cache created', { type: cache.name });

      // Create service
      service = new RateLimitService({
        store: config.store,
        cache,
        defaults: config.defaults,
      });
      setRateLimitService(service);
      log('Service created');

      // Start cleanup job if enabled
      if (runtimeConfig.cleanupEnabled) {
        cleanupJob = createCleanupJob({
          store: config.store,
          intervalMs: runtimeConfig.cleanupIntervalMs,
          debug,
        });
        cleanupJob.start();
        log('Cleanup job started', { intervalMs: runtimeConfig.cleanupIntervalMs });
      }

      // Register health check
      registry.registerHealthCheck({
        name: 'rate-limit',
        type: 'custom',
        check: async () => {
          try {
            const defaults = service?.getDefaults();
            return {
              healthy: service !== null,
              details: {
                store: config.store.name,
                cache: cache.name,
                cacheAvailable: cache.isAvailable(),
                defaults,
                cleanupEnabled: runtimeConfig.cleanupEnabled,
              },
            };
          } catch {
            return { healthy: false };
          }
        },
      });

      // Register UI menu item if enabled
      if (uiEnabled) {
        registry.addMenuItem({
          pluginId: 'rate-limit',
          id: 'rate-limit:sidebar',
          label: 'Rate Limits',
          icon: 'speed',
          route: '/rate-limits',
          order: 40, // After Entitlements (35)
        });
      }

      // Add API routes if enabled
      if (apiEnabled) {
        // GET /rate-limit/config - Get current config
        registry.addRoute({
          method: 'get',
          path: '/rate-limit/config',
          pluginId: 'rate-limit',
          handler: async (_req: Request, res: Response) => {
            try {
              const defaults = service?.getDefaults();
              res.json({
                ...runtimeConfig,
                ...defaults,
                store: config.store.name,
                cache: cache.name,
                cacheAvailable: cache.isAvailable(),
              });
            } catch (error) {
              console.error('[RateLimitPlugin] Config error:', error);
              res.status(500).json({ error: 'Failed to get config' });
            }
          },
        });

        // PUT /rate-limit/config - Update config at runtime
        registry.addRoute({
          method: 'put',
          path: '/rate-limit/config',
          pluginId: 'rate-limit',
          handler: async (req: Request, res: Response) => {
            try {
              const updates = req.body as Partial<RuntimeConfig>;
              const validStrategies: RateLimitStrategy[] = ['sliding-window', 'fixed-window', 'token-bucket'];

              // Validate and apply updates
              if (updates.windowMs !== undefined) {
                if (typeof updates.windowMs !== 'number' || updates.windowMs <= 0) {
                  return res.status(400).json({ error: 'windowMs must be a positive number' });
                }
                runtimeConfig.windowMs = updates.windowMs;
              }

              if (updates.maxRequests !== undefined) {
                if (typeof updates.maxRequests !== 'number' || updates.maxRequests <= 0) {
                  return res.status(400).json({ error: 'maxRequests must be a positive number' });
                }
                runtimeConfig.maxRequests = updates.maxRequests;
              }

              if (updates.strategy !== undefined) {
                if (!validStrategies.includes(updates.strategy)) {
                  return res.status(400).json({
                    error: `Invalid strategy. Must be one of: ${validStrategies.join(', ')}`,
                  });
                }
                runtimeConfig.strategy = updates.strategy;
              }

              // Update service defaults
              if (service) {
                service.setDefaults({
                  windowMs: runtimeConfig.windowMs,
                  maxRequests: runtimeConfig.maxRequests,
                  strategy: runtimeConfig.strategy,
                });
              }

              // Handle cleanup config changes
              if (updates.cleanupEnabled !== undefined) {
                runtimeConfig.cleanupEnabled = updates.cleanupEnabled;
                if (updates.cleanupEnabled && !cleanupJob) {
                  // Start cleanup job
                  cleanupJob = createCleanupJob({
                    store: config.store,
                    intervalMs: runtimeConfig.cleanupIntervalMs,
                    debug,
                  });
                  cleanupJob.start();
                } else if (!updates.cleanupEnabled && cleanupJob) {
                  // Stop cleanup job
                  cleanupJob.stop();
                  cleanupJob = null;
                }
              }

              if (updates.cleanupIntervalMs !== undefined) {
                if (typeof updates.cleanupIntervalMs !== 'number' || updates.cleanupIntervalMs <= 0) {
                  return res.status(400).json({ error: 'cleanupIntervalMs must be a positive number' });
                }
                runtimeConfig.cleanupIntervalMs = updates.cleanupIntervalMs;
                // Restart cleanup job with new interval if running
                if (cleanupJob && runtimeConfig.cleanupEnabled) {
                  cleanupJob.stop();
                  cleanupJob = createCleanupJob({
                    store: config.store,
                    intervalMs: runtimeConfig.cleanupIntervalMs,
                    debug,
                  });
                  cleanupJob.start();
                }
              }

              log('Config updated', { ...runtimeConfig });

              res.json({
                success: true,
                config: {
                  ...runtimeConfig,
                  store: config.store.name,
                  cache: cache.name,
                  cacheAvailable: cache.isAvailable(),
                },
              });
            } catch (error) {
              console.error('[RateLimitPlugin] Config update error:', error);
              res.status(500).json({ error: 'Failed to update config' });
            }
          },
        });
        // GET /rate-limit/status - Get rate limit status for current user
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/status`,
          pluginId: 'rate-limit',
          handler: async (req: Request, res: Response) => {
            try {
              const authReq = req as AuthenticatedRequest;
              const userId = authReq.auth?.user?.id;

              // Generate key (same logic as middleware)
              let key: string;
              if (userId) {
                key = `user:${userId}`;
              } else {
                const ip = req.ip ||
                  req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
                  req.socket.remoteAddress ||
                  'unknown';
                key = `ip:${ip}`;
              }

              // Get status without incrementing
              const status = await service!.checkLimit(key, {
                userId,
                increment: false,
              });

              res.json({
                key,
                ...status,
              });
            } catch (error) {
              console.error('[RateLimitPlugin] Status error:', error);
              res.status(500).json({ error: 'Failed to get rate limit status' });
            }
          },
        });

        // GET /rate-limit/status/:key - Get rate limit status for a specific key
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/status/:key`,
          pluginId: 'rate-limit',
          handler: async (req: Request, res: Response) => {
            try {
              const authReq = req as AuthenticatedRequest;
              const userId = authReq.auth?.user?.id;
              const key = req.params.key;

              if (!key) {
                return res.status(400).json({ error: 'Key is required' });
              }

              // Get status without incrementing
              const status = await service!.checkLimit(key, {
                userId,
                increment: false,
              });

              res.json({
                key,
                ...status,
              });
            } catch (error) {
              console.error('[RateLimitPlugin] Status error:', error);
              res.status(500).json({ error: 'Failed to get rate limit status' });
            }
          },
        });

        // DELETE /rate-limit/clear/:key - Clear a rate limit (requires auth)
        registry.addRoute({
          method: 'delete',
          path: `${apiPrefix}/clear/:key`,
          pluginId: 'rate-limit',
          handler: async (req: Request, res: Response) => {
            try {
              const authReq = req as AuthenticatedRequest;
              const userId = authReq.auth?.user?.id;

              if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
              }

              const key = req.params.key;
              if (!key) {
                return res.status(400).json({ error: 'Key is required' });
              }

              await service!.clearLimit(key, userId);
              res.status(204).send();
            } catch (error) {
              console.error('[RateLimitPlugin] Clear error:', error);
              res.status(500).json({ error: 'Failed to clear rate limit' });
            }
          },
        });
      }

      log('Rate limit plugin started');
    },

    async onStop(): Promise<void> {
      log('Stopping rate limit plugin');

      // Stop cleanup job
      if (cleanupJob) {
        cleanupJob.stop();
        cleanupJob = null;
      }

      // Clear service reference
      setRateLimitService(null);
      service = null;

      // Shutdown store
      await config.store.shutdown();

      log('Rate limit plugin stopped');
    },
  };
}
