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

import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type {
  UsersPluginConfig,
  UserStore,
  User,
  CreateUserInput,
  UpdateUserInput,
  UserSearchParams,
  UserInfo,
  UserSyncInput,
  UserIdentifiers,
  StoredIdentifiers,
} from './types.js';
// Import helpers from other plugins for buildUserInfo
// Note: These imports are used dynamically based on registry.hasPlugin() checks
import { getEntitlements } from '../entitlements/entitlements-plugin.js';
import { getPreferences } from '../preferences/preferences-plugin.js';
import { getActiveBan } from '../bans/bans-plugin.js';
import { autoCreateUserTenant } from '../tenants/index.js';

// Store instance for helper access
let currentStore: UserStore | null = null;
let currentRegistry: PluginRegistry | null = null;

/**
 * Create the Users plugin
 */
export function createUsersPlugin(config: UsersPluginConfig): Plugin {
  const debug = config.debug || false;
  // Routes are mounted under /api by the control panel, so don't include /api in prefix
  const apiPrefix = config.api?.prefix || '/'; // Framework adds /users prefix automatically

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

      // Store references for helper access
      currentStore = config.store;
      currentRegistry = registry;

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

              // Auto-create personal tenant if tenants plugin available
              if (registry.hasPlugin('tenants')) {
                try {
                  await autoCreateUserTenant(user.id);
                  log('Auto-created personal tenant for user', { userId: user.id });
                } catch (error) {
                  console.error('[UsersPlugin] Failed to auto-create tenant:', error);
                  // Don't fail user creation if tenant creation fails
                }
              }

              res.status(201).json(user);
            } catch (error) {
              console.error('[UsersPlugin] Create user error:', error);
              res.status(500).json({ error: 'Failed to create user' });
            }
          },
        });

        // Invite user
        registry.addRoute({
          method: 'post',
          path: apiPrefix === '/' ? '/invite' : `${apiPrefix}/invite`,
          pluginId: 'users',
          handler: async (req: Request, res: Response) => {
            try {
              const { email, name, role } = req.body;

              if (!email) {
                return res.status(400).json({ error: 'Email is required' });
              }

              // Check if user already exists
              const existing = await config.store.getByEmail(email);
              if (existing) {
                return res.status(409).json({ error: 'User with this email already exists' });
              }

              // Generate invitation token (32 bytes = 64 hex chars)
              const token = randomBytes(32).toString('hex');

              // Set expiration to 7 days from now
              const expiresAt = new Date();
              expiresAt.setDate(expiresAt.getDate() + 7);

              // Create user with invited status
              const user = await config.store.create({
                email,
                name,
                metadata: role ? { role } : undefined,
              });

              // Update with invitation token
              const { getPostgres } = await import('../postgres-plugin.js');
              const pool = getPostgres().getPool();
              await pool.query(
                `UPDATE users SET
                  status = 'invited',
                  invitation_token = $1,
                  invitation_expires_at = $2
                WHERE id = $3`,
                [token, expiresAt, user.id]
              );

              // Get base URL from request
              const protocol = req.get('x-forwarded-proto') || req.protocol;
              const host = req.get('host');
              const baseUrl = `${protocol}://${host}`;
              const cpanelPath = config.controlPanelPath || '/cpanel';
              const inviteLink = `${baseUrl}${cpanelPath}/accept-invitation/${token}`;

              res.status(201).json({
                user: { ...user, status: 'invited' as const, invitation_token: token, invitation_expires_at: expiresAt },
                token,
                inviteLink,
                expiresAt: expiresAt.toISOString(),
              });
            } catch (error) {
              console.error('[UsersPlugin] Invite user error:', error);
              res.status(500).json({ error: 'Failed to invite user' });
            }
          },
        });

        // Accept invitation
        registry.addRoute({
          method: 'post',
          path: apiPrefix === '/' ? '/accept-invitation/:token' : `${apiPrefix}/accept-invitation/:token`,
          pluginId: 'users',
          handler: async (req: Request, res: Response) => {
            try {
              const { token } = req.params;

              if (!token) {
                return res.status(400).json({ error: 'Invitation token is required' });
              }

              const user = await config.store.acceptInvitation(token);

              if (!user) {
                return res.status(404).json({
                  error: 'Invalid or expired invitation token',
                  details: 'The invitation link may have expired or already been used'
                });
              }

              res.json({
                success: true,
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  status: user.status,
                },
                message: 'Invitation accepted successfully. You can now log in.',
              });
            } catch (error) {
              console.error('[UsersPlugin] Accept invitation error:', error);
              res.status(500).json({ error: 'Failed to accept invitation' });
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

        // GET /users/:id/info - Get comprehensive user info
        registry.addRoute({
          method: 'get',
          path: apiPrefix === '/' ? '/:id/info' : `${apiPrefix}/:id/info`,
          pluginId: 'users',
          handler: async (req: Request, res: Response) => {
            try {
              const user = await config.store.getById(req.params.id);
              if (!user) {
                return res.status(404).json({ error: 'User not found' });
              }

              const info = await buildUserInfo(user, registry);
              res.json(info);
            } catch (error) {
              console.error('[UsersPlugin] Get user info error:', error);
              res.status(500).json({ error: 'Failed to get user info' });
            }
          },
        });

        // POST /users/sync - Find or create user, return comprehensive info
        registry.addRoute({
          method: 'post',
          path: apiPrefix === '/' ? '/sync' : `${apiPrefix}/sync`,
          pluginId: 'users',
          handler: async (req: Request, res: Response) => {
            try {
              const input = req.body as UserSyncInput;

              // Normalize and validate email
              const email = input.email?.trim().toLowerCase();
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!email || !emailRegex.test(email)) {
                return res.status(400).json({ error: 'Valid email is required' });
              }

              // Validate required fields
              if (!input.external_id) {
                return res.status(400).json({ error: 'external_id is required' });
              }
              if (!input.provider) {
                return res.status(400).json({ error: 'provider is required' });
              }

              // Find or create user
              const user = await findOrCreateUser({
                email: email,
                external_id: input.external_id,
                provider: input.provider,
                name: input.name?.trim(),
                picture: input.picture?.trim(),
              });

              const info = await buildUserInfo(user, registry);
              res.json(info);
            } catch (error) {
              console.error('[UsersPlugin] User sync error:', error);
              res.status(500).json({ error: 'Failed to sync user' });
            }
          },
        });

        // GET /users/stats - Get user statistics
        registry.addRoute({
          method: 'get',
          path: apiPrefix === '/' ? '/stats' : `${apiPrefix}/stats`,
          pluginId: 'users',
          handler: async (_req: Request, res: Response) => {
            try {
              const allUsers = await config.store.search({ limit: 10000 });
              const now = Date.now();
              const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

              const stats = {
                totalUsers: allUsers.total,
                activeUsers: allUsers.users.filter((u) => u.status === 'active').length,
                invitedUsers: allUsers.users.filter((u) => u.status === 'invited').length,
                suspendedUsers: allUsers.users.filter((u) => u.status === 'suspended').length,
                recentSignups: allUsers.users.filter(
                  (u) => new Date(u.created_at).getTime() > sevenDaysAgo
                ).length,
              };

              res.json(stats);
            } catch (error) {
              console.error('[UsersPlugin] Get stats error:', error);
              res.status(500).json({ error: 'Failed to get user stats' });
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
      currentRegistry = null;
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
 * Get multiple users by IDs (batch query - more efficient than multiple getUserById calls)
 */
export async function getUsersByIds(ids: string[]): Promise<User[]> {
  if (!currentStore) {
    throw new Error('Users plugin not initialized');
  }
  return currentStore.getByIds(ids);
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
    // Note: external_id cannot be updated after user creation for security reasons
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

  // Auto-create personal tenant if tenants plugin available
  if (currentRegistry && currentRegistry.hasPlugin('tenants')) {
    try {
      await autoCreateUserTenant(user.id);
    } catch (error) {
      console.error('[UsersPlugin] Failed to auto-create tenant:', error);
      // Don't fail user creation if tenant creation fails
    }
  }

  return user;
}

/**
 * Build comprehensive user info by aggregating data from all loaded plugins.
 * This helper fetches data from entitlements, preferences, and bans plugins
 * in parallel (if they are loaded) and returns a unified UserInfo object.
 */
export async function buildUserInfo(user: User, registry: PluginRegistry): Promise<UserInfo> {
  const info: UserInfo = { user };

  // Fetch data from other plugins in parallel
  const promises: Promise<void>[] = [];

  if (registry.hasPlugin('entitlements')) {
    promises.push(
      getEntitlements(user.email)
        .then((result) => {
          info.entitlements = result.entitlements;
        })
        .catch((error) => {
          console.error('[UsersPlugin] Failed to fetch entitlements:', error);
          // Continue without entitlements - don't fail the whole request
        })
    );
  }

  if (registry.hasPlugin('preferences')) {
    promises.push(
      getPreferences(user.id)
        .then((prefs) => {
          info.preferences = prefs;
        })
        .catch((error) => {
          console.error('[UsersPlugin] Failed to fetch preferences:', error);
          // Continue without preferences - don't fail the whole request
        })
    );
  }

  if (registry.hasPlugin('bans')) {
    promises.push(
      getActiveBan(user.id)
        .then((ban) => {
          // Transform Ban to UserInfo.ban shape (only include relevant fields)
          info.ban = ban
            ? {
                id: ban.id,
                reason: ban.reason,
                banned_at: ban.banned_at,
                expires_at: ban.expires_at,
              }
            : null;
        })
        .catch((error) => {
          console.error('[UsersPlugin] Failed to fetch ban status:', error);
          // Continue without ban info - don't fail the whole request
        })
    );
  }

  // Future: roles plugin
  // if (registry.hasPlugin('roles')) {
  //   promises.push(getUserRoles(user.id).then(roles => info.roles = roles));
  // }

  await Promise.all(promises);
  return info;
}

/**
 * Get a user by any known identifier.
 * Tries identifiers in priority order: email > auth0_user_id > wp_user_id > keap_contact_id.
 */
export async function getUserByIdentifier(identifiers: UserIdentifiers): Promise<User | null> {
  if (!currentStore) {
    throw new Error('Users plugin not initialized');
  }
  return currentStore.getByIdentifier(identifiers);
}

/**
 * Link external identifiers to a user.
 * Stores identifiers in metadata.identifiers for future lookups.
 */
export async function linkUserIdentifiers(
  userId: string,
  identifiers: Partial<StoredIdentifiers>
): Promise<void> {
  if (!currentStore) {
    throw new Error('Users plugin not initialized');
  }
  return currentStore.linkIdentifiers(userId, identifiers);
}
