/**
 * Bans Plugin
 *
 * User ban management plugin for @qwickapps/server.
 * Bans are always on USER entities (by user_id), not emails.
 *
 * This plugin depends on the Users Plugin for user resolution.
 * Use `isEmailBanned()` convenience function to check bans by email,
 * which internally resolves email → user_id → ban status.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type {
  BansPluginConfig,
  BanStore,
  Ban,
  CreateBanInput,
  RemoveBanInput,
} from './types.js';
import type { AuthenticatedRequest } from '../auth/types.js';
import { getUserByEmail, getUserById } from '../users/users-plugin.js';

// Store instance for helper access
let currentStore: BanStore | null = null;
let banCleanupInterval: NodeJS.Timeout | null = null;
let pluginConfig: BansPluginConfig | null = null;

/**
 * Create the Bans plugin
 */
export function createBansPlugin(config: BansPluginConfig): Plugin {
  const debug = config.debug || false;
  // Routes are mounted under /api by the control panel, so don't include /api in prefix
  const apiPrefix = config.api?.prefix || '/bans';
  const apiEnabled = config.api?.enabled !== false;

  function log(message: string, data?: Record<string, unknown>) {
    if (debug) {
      console.log(`[BansPlugin] ${message}`, data || '');
    }
  }

  return {
    id: 'bans',
    name: 'Bans',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      log('Starting bans plugin');

      // Check for users plugin dependency
      if (!registry.hasPlugin('users')) {
        throw new Error('Bans plugin requires Users plugin to be loaded first');
      }

      // Initialize the store (creates tables if needed)
      await config.store.initialize();
      log('Bans plugin migrations complete');

      // Store references for helper access
      currentStore = config.store;
      pluginConfig = config;

      // Start ban cleanup interval if temporary bans are supported
      if (config.supportTemporary) {
        banCleanupInterval = setInterval(async () => {
          try {
            const cleaned = await config.store.cleanupExpiredBans();
            if (cleaned > 0) {
              log('Cleaned up expired bans', { count: cleaned });
            }
          } catch (error) {
            console.error('[BansPlugin] Ban cleanup error:', error);
          }
        }, 60 * 1000); // Check every minute
      }

      // Register health check
      registry.registerHealthCheck({
        name: 'bans-store',
        type: 'custom',
        check: async () => {
          try {
            // Simple health check - list with limit 0
            await config.store.listActiveBans({ limit: 0 });
            return { healthy: true };
          } catch {
            return { healthy: false };
          }
        },
      });

      // Add API routes if enabled
      if (apiEnabled) {
        // List active bans
        registry.addRoute({
          method: 'get',
          path: apiPrefix,
          pluginId: 'bans',
          handler: async (req: Request, res: Response) => {
            try {
              const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
              const offset = parseInt(req.query.offset as string) || 0;

              const result = await config.store.listActiveBans({ limit, offset });
              res.json(result);
            } catch (error) {
              console.error('[BansPlugin] List bans error:', error);
              res.status(500).json({ error: 'Failed to list bans' });
            }
          },
        });

        // Get user ban status by user ID
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/user/:userId`,
          pluginId: 'bans',
          handler: async (req: Request, res: Response) => {
            try {
              const ban = await config.store.getActiveBan(req.params.userId);
              res.json({
                isBanned: ban !== null,
                ban,
              });
            } catch (error) {
              console.error('[BansPlugin] Get ban status error:', error);
              res.status(500).json({ error: 'Failed to get ban status' });
            }
          },
        });

        // Get user ban history
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/user/:userId/history`,
          pluginId: 'bans',
          handler: async (req: Request, res: Response) => {
            try {
              const bans = await config.store.listBans(req.params.userId);
              res.json({ bans });
            } catch (error) {
              console.error('[BansPlugin] Get ban history error:', error);
              res.status(500).json({ error: 'Failed to get ban history' });
            }
          },
        });

        // Ban user by user ID
        registry.addRoute({
          method: 'post',
          path: `${apiPrefix}/user/:userId`,
          pluginId: 'bans',
          handler: async (req: Request, res: Response) => {
            try {
              const authReq = req as AuthenticatedRequest;
              const bannedBy = authReq.auth?.user?.id || authReq.auth?.user?.email || 'system';

              const input: CreateBanInput = {
                user_id: req.params.userId,
                reason: req.body.reason || 'No reason provided',
                banned_by: bannedBy,
                duration: config.supportTemporary ? req.body.duration : undefined,
                metadata: req.body.metadata,
              };

              // Verify user exists via Users Plugin
              const user = await getUserById(req.params.userId);
              if (!user) {
                return res.status(404).json({ error: 'User not found' });
              }

              const ban = await config.store.createBan(input);

              // Call onBan callback if provided
              if (config.callbacks?.onBan) {
                try {
                  await config.callbacks.onBan(user, ban);
                } catch (callbackError) {
                  console.error('[BansPlugin] onBan callback error:', callbackError);
                }
              }

              log('User banned', { userId: req.params.userId, reason: input.reason });
              res.status(201).json(ban);
            } catch (error) {
              console.error('[BansPlugin] Ban user error:', error);
              res.status(500).json({ error: 'Failed to ban user' });
            }
          },
        });

        // Unban user by user ID
        registry.addRoute({
          method: 'delete',
          path: `${apiPrefix}/user/:userId`,
          pluginId: 'bans',
          handler: async (req: Request, res: Response) => {
            try {
              const authReq = req as AuthenticatedRequest;
              const removedBy = authReq.auth?.user?.id || authReq.auth?.user?.email || 'system';

              // Verify user exists via Users Plugin
              const user = await getUserById(req.params.userId);
              if (!user) {
                return res.status(404).json({ error: 'User not found' });
              }

              const input: RemoveBanInput = {
                user_id: req.params.userId,
                removed_by: removedBy,
                note: req.body?.note,
              };

              const removed = await config.store.removeBan(input);
              if (!removed) {
                return res.status(404).json({ error: 'No active ban found' });
              }

              // Call onUnban callback if provided
              if (config.callbacks?.onUnban) {
                try {
                  await config.callbacks.onUnban(user);
                } catch (callbackError) {
                  console.error('[BansPlugin] onUnban callback error:', callbackError);
                }
              }

              log('User unbanned', { userId: req.params.userId });
              res.status(204).send();
            } catch (error) {
              console.error('[BansPlugin] Unban user error:', error);
              res.status(500).json({ error: 'Failed to unban user' });
            }
          },
        });

        // Check ban status by email (convenience endpoint)
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/email/:email`,
          pluginId: 'bans',
          handler: async (req: Request, res: Response) => {
            try {
              const email = decodeURIComponent(req.params.email);
              const isBanned = await isEmailBanned(email);
              res.json({ email, isBanned });
            } catch (error) {
              console.error('[BansPlugin] Check email ban error:', error);
              res.status(500).json({ error: 'Failed to check ban status' });
            }
          },
        });

        // Ban user by email (convenience endpoint)
        registry.addRoute({
          method: 'post',
          path: `${apiPrefix}/email/:email`,
          pluginId: 'bans',
          handler: async (req: Request, res: Response) => {
            try {
              const email = decodeURIComponent(req.params.email);
              const authReq = req as AuthenticatedRequest;
              const bannedBy = authReq.auth?.user?.id || authReq.auth?.user?.email || 'system';

              // Resolve email to user via Users Plugin
              const user = await getUserByEmail(email);
              if (!user) {
                return res.status(404).json({ error: 'User not found' });
              }

              const input: CreateBanInput = {
                user_id: user.id,
                reason: req.body.reason || 'No reason provided',
                banned_by: bannedBy,
                duration: config.supportTemporary ? req.body.duration : undefined,
                metadata: req.body.metadata,
              };

              const ban = await config.store.createBan(input);

              // Call onBan callback if provided
              if (config.callbacks?.onBan) {
                try {
                  await config.callbacks.onBan(user, ban);
                } catch (callbackError) {
                  console.error('[BansPlugin] onBan callback error:', callbackError);
                }
              }

              log('User banned by email', { email, userId: user.id, reason: input.reason });
              res.status(201).json(ban);
            } catch (error) {
              console.error('[BansPlugin] Ban user by email error:', error);
              res.status(500).json({ error: 'Failed to ban user' });
            }
          },
        });

        // Unban user by email (convenience endpoint)
        registry.addRoute({
          method: 'delete',
          path: `${apiPrefix}/email/:email`,
          pluginId: 'bans',
          handler: async (req: Request, res: Response) => {
            try {
              const email = decodeURIComponent(req.params.email);
              const authReq = req as AuthenticatedRequest;
              const removedBy = authReq.auth?.user?.id || authReq.auth?.user?.email || 'system';

              // Resolve email to user via Users Plugin
              const user = await getUserByEmail(email);
              if (!user) {
                return res.status(404).json({ error: 'User not found' });
              }

              const input: RemoveBanInput = {
                user_id: user.id,
                removed_by: removedBy,
                note: req.body?.note,
              };

              const removed = await config.store.removeBan(input);
              if (!removed) {
                return res.status(404).json({ error: 'No active ban found' });
              }

              // Call onUnban callback if provided
              if (config.callbacks?.onUnban) {
                try {
                  await config.callbacks.onUnban(user);
                } catch (callbackError) {
                  console.error('[BansPlugin] onUnban callback error:', callbackError);
                }
              }

              log('User unbanned by email', { email, userId: user.id });
              res.status(204).send();
            } catch (error) {
              console.error('[BansPlugin] Unban user by email error:', error);
              res.status(500).json({ error: 'Failed to unban user' });
            }
          },
        });
      }

      log('Bans plugin started');
    },

    async onStop(): Promise<void> {
      log('Stopping bans plugin');

      if (banCleanupInterval) {
        clearInterval(banCleanupInterval);
        banCleanupInterval = null;
      }

      await config.store.shutdown();
      currentStore = null;
      pluginConfig = null;

      log('Bans plugin stopped');
    },
  };
}

// ========================================
// Helper Functions
// ========================================

/**
 * Get the current ban store instance
 */
export function getBanStore(): BanStore | null {
  return currentStore;
}

/**
 * Check if a user is banned by user ID
 */
export async function isUserBanned(userId: string): Promise<boolean> {
  if (!currentStore) {
    throw new Error('Bans plugin not initialized');
  }
  return currentStore.isBanned(userId);
}

/**
 * Check if a user is banned by email
 *
 * This is a convenience function that:
 * 1. Resolves email → user via Users Plugin
 * 2. Checks ban status by user_id
 *
 * Returns false if user doesn't exist (unknown user = not banned)
 */
export async function isEmailBanned(email: string): Promise<boolean> {
  if (!currentStore) {
    throw new Error('Bans plugin not initialized');
  }

  // Resolve email to user via Users Plugin
  const user = await getUserByEmail(email);
  if (!user) {
    return false; // Unknown user = not banned
  }

  return currentStore.isBanned(user.id);
}

/**
 * Get active ban for a user
 */
export async function getActiveBan(userId: string): Promise<Ban | null> {
  if (!currentStore) {
    throw new Error('Bans plugin not initialized');
  }
  return currentStore.getActiveBan(userId);
}

/**
 * Ban a user
 */
export async function banUser(input: CreateBanInput): Promise<Ban> {
  if (!currentStore) {
    throw new Error('Bans plugin not initialized');
  }

  const ban = await currentStore.createBan(input);

  // Call onBan callback if configured
  if (pluginConfig?.callbacks?.onBan) {
    const user = await getUserById(input.user_id);
    if (user) {
      try {
        await pluginConfig.callbacks.onBan(user, ban);
      } catch (error) {
        console.error('[BansPlugin] onBan callback error:', error);
      }
    }
  }

  return ban;
}

/**
 * Unban a user
 */
export async function unbanUser(input: RemoveBanInput): Promise<boolean> {
  if (!currentStore) {
    throw new Error('Bans plugin not initialized');
  }

  const removed = await currentStore.removeBan(input);

  // Call onUnban callback if configured
  if (removed && pluginConfig?.callbacks?.onUnban) {
    const user = await getUserById(input.user_id);
    if (user) {
      try {
        await pluginConfig.callbacks.onUnban(user);
      } catch (error) {
        console.error('[BansPlugin] onUnban callback error:', error);
      }
    }
  }

  return removed;
}

/**
 * List all active bans
 */
export async function listActiveBans(options?: { limit?: number; offset?: number }): Promise<{
  bans: Ban[];
  total: number;
}> {
  if (!currentStore) {
    throw new Error('Bans plugin not initialized');
  }
  return currentStore.listActiveBans(options);
}
