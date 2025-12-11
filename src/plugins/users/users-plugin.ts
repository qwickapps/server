/**
 * Users Plugin
 *
 * User identity management plugin for @qwickapps/server.
 * Provides CRUD operations, search, and user lookup functionality.
 *
 * Note: Ban management is handled by the separate Bans Plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type {
  UsersPluginConfig,
  UserStore,
  User,
  CreateUserInput,
  UpdateUserInput,
  UserSearchParams,
} from './types.js';

// Store instance for helper access
let currentStore: UserStore | null = null;

/**
 * Create the Users plugin
 */
export function createUsersPlugin(config: UsersPluginConfig): Plugin {
  const debug = config.debug || false;
  // Routes are mounted under /api by the control panel, so don't include /api in prefix
  const apiPrefix = config.api?.prefix || '/users';

  function log(message: string, data?: Record<string, unknown>) {
    if (debug) {
      console.log(`[UsersPlugin] ${message}`, data || '');
    }
  }

  return {
    id: 'users',
    name: 'Users',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      log('Starting users plugin');

      // Initialize the store (creates tables if needed)
      await config.store.initialize();
      log('Users plugin migrations complete');

      // Store reference for helper access
      currentStore = config.store;

      // Register health check
      registry.registerHealthCheck({
        name: 'users-store',
        type: 'custom',
        check: async () => {
          try {
            // Simple health check - try to search with limit 1
            await config.store.search({ limit: 1 });
            return { healthy: true };
          } catch {
            return { healthy: false };
          }
        },
      });

      // Add API routes if enabled
      if (config.api?.crud !== false) {
        // List/Search users
        registry.addRoute({
          method: 'get',
          path: apiPrefix,
          pluginId: 'users',
          handler: async (req: Request, res: Response) => {
            try {
              const params: UserSearchParams = {
                query: req.query.q as string,
                provider: req.query.provider as string,
                page: parseInt(req.query.page as string) || 1,
                limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
                sortBy: (req.query.sortBy as UserSearchParams['sortBy']) || 'created_at',
                sortOrder: (req.query.sortOrder as UserSearchParams['sortOrder']) || 'desc',
              };

              const result = await config.store.search(params);
              res.json(result);
            } catch (error) {
              console.error('[UsersPlugin] Search error:', error);
              res.status(500).json({ error: 'Failed to search users' });
            }
          },
        });

        // Get user by ID
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/:id`,
          pluginId: 'users',
          handler: async (req: Request, res: Response) => {
            try {
              const user = await config.store.getById(req.params.id);
              if (!user) {
                return res.status(404).json({ error: 'User not found' });
              }
              res.json(user);
            } catch (error) {
              console.error('[UsersPlugin] Get user error:', error);
              res.status(500).json({ error: 'Failed to get user' });
            }
          },
        });

        // Create user
        registry.addRoute({
          method: 'post',
          path: apiPrefix,
          pluginId: 'users',
          handler: async (req: Request, res: Response) => {
            try {
              const input: CreateUserInput = {
                email: req.body.email,
                name: req.body.name,
                external_id: req.body.external_id,
                provider: req.body.provider,
                picture: req.body.picture,
                metadata: req.body.metadata,
              };

              if (!input.email) {
                return res.status(400).json({ error: 'Email is required' });
              }

              // Check if user already exists
              const existing = await config.store.getByEmail(input.email);
              if (existing) {
                return res.status(409).json({ error: 'User with this email already exists' });
              }

              const user = await config.store.create(input);
              res.status(201).json(user);
            } catch (error) {
              console.error('[UsersPlugin] Create user error:', error);
              res.status(500).json({ error: 'Failed to create user' });
            }
          },
        });

        // Update user
        registry.addRoute({
          method: 'put',
          path: `${apiPrefix}/:id`,
          pluginId: 'users',
          handler: async (req: Request, res: Response) => {
            try {
              const input: UpdateUserInput = {
                name: req.body.name,
                picture: req.body.picture,
                metadata: req.body.metadata,
              };

              const user = await config.store.update(req.params.id, input);
              if (!user) {
                return res.status(404).json({ error: 'User not found' });
              }
              res.json(user);
            } catch (error) {
              console.error('[UsersPlugin] Update user error:', error);
              res.status(500).json({ error: 'Failed to update user' });
            }
          },
        });

        // Delete user
        registry.addRoute({
          method: 'delete',
          path: `${apiPrefix}/:id`,
          pluginId: 'users',
          handler: async (req: Request, res: Response) => {
            try {
              const deleted = await config.store.delete(req.params.id);
              if (!deleted) {
                return res.status(404).json({ error: 'User not found' });
              }
              res.status(204).send();
            } catch (error) {
              console.error('[UsersPlugin] Delete user error:', error);
              res.status(500).json({ error: 'Failed to delete user' });
            }
          },
        });
      }

      log('Users plugin started');
    },

    async onStop(): Promise<void> {
      log('Stopping users plugin');
      await config.store.shutdown();
      currentStore = null;
      log('Users plugin stopped');
    },
  };
}

// ========================================
// Helper Functions
// ========================================

/**
 * Get the current user store instance
 */
export function getUserStore(): UserStore | null {
  return currentStore;
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  if (!currentStore) {
    throw new Error('Users plugin not initialized');
  }
  return currentStore.getById(id);
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  if (!currentStore) {
    throw new Error('Users plugin not initialized');
  }
  return currentStore.getByEmail(email);
}

/**
 * Find or create a user from auth provider data
 */
export async function findOrCreateUser(data: {
  email: string;
  name?: string;
  external_id: string;
  provider: string;
  picture?: string;
}): Promise<User> {
  if (!currentStore) {
    throw new Error('Users plugin not initialized');
  }

  // Try to find by external ID first
  let user = await currentStore.getByExternalId(data.external_id, data.provider);
  if (user) {
    await currentStore.updateLastLogin(user.id);
    return user;
  }

  // Try to find by email
  user = await currentStore.getByEmail(data.email);
  if (user) {
    // Update with external ID if not set
    if (!user.external_id) {
      await currentStore.update(user.id, {});
    }
    await currentStore.updateLastLogin(user.id);
    return user;
  }

  // Create new user
  user = await currentStore.create({
    email: data.email,
    name: data.name,
    external_id: data.external_id,
    provider: data.provider,
    picture: data.picture,
  });

  return user;
}
