/**
 * API Keys Plugin
 *
 * API key authentication and management plugin for @qwickapps/server.
 * Provides API key generation, storage, and verification with PostgreSQL RLS.
 *
 * This plugin depends on the Users Plugin for user identity.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type {
  ApiKeysPluginConfig,
  ApiKeyStore,
  CreateApiKeyParams,
  UpdateApiKeyParams,
  ApiKey,
} from './types.js';
import type { AuthenticatedRequest } from '../auth/types.js';
import {
  CreateApiKeySchema,
  UpdateApiKeySchema,
} from './types.js';

// Store instance for helper access
let currentStore: ApiKeyStore | null = null;

/**
 * Create the API Keys plugin
 */
export function createApiKeysPlugin(config: ApiKeysPluginConfig): Plugin {
  const debug = config.debug || false;
  // Framework automatically prefixes routes with plugin slug, so use root path
  const apiPrefix = config.api?.prefix || '/';
  const apiEnabled = config.api?.enabled !== false;

  function log(message: string, data?: Record<string, unknown>) {
    if (debug) {
      console.log(`[ApiKeysPlugin] ${message}`, data || '');
    }
  }

  return {
    id: 'api-keys',
    name: 'API Keys',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      log('Starting API keys plugin');

      // Check for users plugin dependency
      if (!registry.hasPlugin('users')) {
        throw new Error('API Keys plugin requires Users plugin to be loaded first');
      }

      // Initialize the store (creates tables and RLS policies if needed)
      await config.store.initialize();
      log('API keys store initialized');

      // Initialize optional Phase 2 stores
      if (config.scopeStore) {
        await config.scopeStore.initialize();
        log('Plugin scope store initialized');
      }

      if (config.usageStore) {
        await config.usageStore.initialize();
        log('Usage log store initialized');
      }

      // Store reference for helper access
      currentStore = config.store;

      // Register health check
      registry.registerHealthCheck({
        name: 'api-keys-store',
        type: 'custom',
        check: async () => {
          try {
            // Simple health check - store is accessible
            return { healthy: currentStore !== null };
          } catch {
            return { healthy: false };
          }
        },
      });

      // Add API routes if enabled
      if (apiEnabled) {
        // POST /api-keys - Create a new API key
        registry.addRoute({
          method: 'post',
          path: apiPrefix,
          pluginId: 'api-keys',
          handler: async (req: Request, res: Response) => {
            try {
              const authReq = req as AuthenticatedRequest;
              const userId = authReq.auth?.user?.id;

              if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
              }

              // Validate request body
              const validation = CreateApiKeySchema.safeParse(req.body);
              if (!validation.success) {
                return res.status(400).json({
                  error: 'Invalid request',
                });
              }

              const params: CreateApiKeyParams = {
                user_id: userId,
                ...validation.data,
              };

              // Create the API key
              const apiKey = await config.store.create(params);

              // Return the key with plaintext (ONLY time plaintext is accessible)
              res.status(201).json({
                id: apiKey.id,
                name: apiKey.name,
                key: apiKey.plaintext_key, // Client must save this - won't be shown again
                key_prefix: apiKey.key_prefix,
                key_type: apiKey.key_type,
                scopes: apiKey.scopes,
                expires_at: apiKey.expires_at,
                is_active: apiKey.is_active,
                created_at: apiKey.created_at,
              });
            } catch (error) {
              console.error('[ApiKeysPlugin] Create API key error:', error);
              res.status(500).json({ error: 'Failed to create API key' });
            }
          },
        });

        // GET /api-keys - List current user's API keys
        registry.addRoute({
          method: 'get',
          path: apiPrefix,
          pluginId: 'api-keys',
          handler: async (req: Request, res: Response) => {
            try {
              const authReq = req as AuthenticatedRequest;
              const userId = authReq.auth?.user?.id;

              if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
              }

              const keys = await config.store.list(userId);

              // Remove sensitive fields from response
              const sanitized = keys.map(key => ({
                id: key.id,
                name: key.name,
                key_prefix: key.key_prefix,
                key_type: key.key_type,
                scopes: key.scopes,
                last_used_at: key.last_used_at,
                expires_at: key.expires_at,
                is_active: key.is_active,
                created_at: key.created_at,
                updated_at: key.updated_at,
              }));

              res.json({ keys: sanitized });
            } catch (error) {
              console.error('[ApiKeysPlugin] List API keys error:', error);
              res.status(500).json({ error: 'Failed to list API keys' });
            }
          },
        });

        // GET /api-keys/:id - Get a specific API key
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/:id`,
          pluginId: 'api-keys',
          handler: async (req: Request, res: Response) => {
            try {
              const authReq = req as AuthenticatedRequest;
              const userId = authReq.auth?.user?.id;

              if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
              }

              const { id } = req.params;
              const key = await config.store.get(userId, id);

              if (!key) {
                return res.status(404).json({ error: 'API key not found' });
              }

              // Remove sensitive fields from response
              const sanitized = {
                id: key.id,
                name: key.name,
                key_prefix: key.key_prefix,
                key_type: key.key_type,
                scopes: key.scopes,
                last_used_at: key.last_used_at,
                expires_at: key.expires_at,
                is_active: key.is_active,
                created_at: key.created_at,
                updated_at: key.updated_at,
              };

              res.json(sanitized);
            } catch (error) {
              console.error('[ApiKeysPlugin] Get API key error:', error);
              res.status(500).json({ error: 'Failed to get API key' });
            }
          },
        });

        // PUT /api-keys/:id - Update an API key
        registry.addRoute({
          method: 'put',
          path: `${apiPrefix}/:id`,
          pluginId: 'api-keys',
          handler: async (req: Request, res: Response) => {
            try {
              const authReq = req as AuthenticatedRequest;
              const userId = authReq.auth?.user?.id;

              if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
              }

              // Validate request body
              const validation = UpdateApiKeySchema.safeParse(req.body);
              if (!validation.success) {
                return res.status(400).json({
                  error: 'Invalid request',
                });
              }

              const { id } = req.params;
              const params: UpdateApiKeyParams = validation.data;

              const updated = await config.store.update(userId, id, params);

              if (!updated) {
                return res.status(404).json({ error: 'API key not found' });
              }

              // Remove sensitive fields from response
              const sanitized = {
                id: updated.id,
                name: updated.name,
                key_prefix: updated.key_prefix,
                key_type: updated.key_type,
                scopes: updated.scopes,
                last_used_at: updated.last_used_at,
                expires_at: updated.expires_at,
                is_active: updated.is_active,
                created_at: updated.created_at,
                updated_at: updated.updated_at,
              };

              res.json(sanitized);
            } catch (error) {
              console.error('[ApiKeysPlugin] Update API key error:', error);
              res.status(500).json({ error: 'Failed to update API key' });
            }
          },
        });

        // DELETE /api-keys/:id - Delete an API key
        registry.addRoute({
          method: 'delete',
          path: `${apiPrefix}/:id`,
          pluginId: 'api-keys',
          handler: async (req: Request, res: Response) => {
            try {
              const authReq = req as AuthenticatedRequest;
              const userId = authReq.auth?.user?.id;

              if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
              }

              const { id } = req.params;
              const deleted = await config.store.delete(userId, id);

              if (!deleted) {
                return res.status(404).json({ error: 'API key not found' });
              }

              res.status(204).send();
            } catch (error) {
              console.error('[ApiKeysPlugin] Delete API key error:', error);
              res.status(500).json({ error: 'Failed to delete API key' });
            }
          },
        });

        // Phase 2: GET /scopes - List all available scopes
        if (config.scopeStore) {
          registry.addRoute({
            method: 'get',
            path: '/scopes',
            pluginId: 'api-keys',
            handler: async (_req: Request, res: Response) => {
              try {
                const scopes = await config.scopeStore!.getAllScopes();

                // Group by plugin
                const grouped = scopes.reduce((acc, scope) => {
                  if (!acc[scope.plugin_id]) {
                    acc[scope.plugin_id] = [];
                  }
                  acc[scope.plugin_id].push({
                    name: scope.name,
                    description: scope.description,
                    category: scope.category,
                  });
                  return acc;
                }, {} as Record<string, Array<{ name: string; description: string; category?: string }>>);

                // Convert to array format
                const result = Object.entries(grouped).map(([pluginId, pluginScopes]) => ({
                  pluginId,
                  scopes: pluginScopes,
                }));

                res.json({ scopes: result });
              } catch (error) {
                console.error('[ApiKeysPlugin] Get scopes error:', error);
                res.status(500).json({ error: 'Failed to retrieve scopes' });
              }
            },
          });
        }

        // Phase 2: GET /api-keys/:id/usage - Get usage logs for a specific key
        if (config.usageStore) {
          registry.addRoute({
            method: 'get',
            path: `${apiPrefix}/:id/usage`,
            pluginId: 'api-keys',
            handler: async (req: Request, res: Response) => {
              try {
                const authReq = req as AuthenticatedRequest;
                const userId = authReq.auth?.user?.id;

                if (!userId) {
                  return res.status(401).json({ error: 'Authentication required' });
                }

                const { id: keyId } = req.params;

                // Verify key belongs to user
                const key = await config.store.get(userId, keyId);
                if (!key) {
                  return res.status(404).json({ error: 'API key not found' });
                }

                // Parse query parameters
                const limit = parseInt(req.query.limit as string) || 100;
                const offset = parseInt(req.query.offset as string) || 0;
                const since = req.query.since ? new Date(req.query.since as string) : undefined;
                const until = req.query.until ? new Date(req.query.until as string) : undefined;
                const endpoint = req.query.endpoint as string | undefined;
                const method = req.query.method as string | undefined;
                const statusCode = req.query.statusCode ? parseInt(req.query.statusCode as string) : undefined;

                // Get usage logs
                const logs = await config.usageStore!.getKeyUsage(keyId, {
                  limit,
                  offset,
                  since,
                  until,
                  endpoint,
                  method,
                  statusCode,
                });

                // Get stats
                const stats = await config.usageStore!.getKeyStats(keyId, { since, until });

                res.json({
                  keyId,
                  keyName: key.name,
                  totalCalls: stats.totalCalls,
                  lastUsed: stats.lastUsed,
                  callsByStatus: stats.callsByStatus,
                  callsByEndpoint: stats.callsByEndpoint,
                  logs,
                });
              } catch (error) {
                console.error('[ApiKeysPlugin] Get usage error:', error);
                res.status(500).json({ error: 'Failed to retrieve usage logs' });
              }
            },
          });
        }
      }

      log('API keys plugin started');
    },

    async onStop(): Promise<void> {
      log('Stopping API keys plugin');
      if (currentStore) {
        await currentStore.shutdown();
      }
      if (config.scopeStore) {
        await config.scopeStore.shutdown();
      }
      if (config.usageStore) {
        await config.usageStore.shutdown();
      }
      currentStore = null;
      log('API keys plugin stopped');
    },

    async onPluginEvent(event): Promise<void> {
      // Automatically register plugin scopes when plugins start
      if (event.type === 'plugin:started' && config.scopeStore) {
        const { plugin } = event;

        if (plugin.scopes && plugin.scopes.length > 0) {
          try {
            await config.scopeStore.registerScopes(plugin.id, plugin.scopes);
            log(`Registered ${plugin.scopes.length} scopes for plugin: ${plugin.id}`, {
              scopes: plugin.scopes.map(s => s.name),
            });
          } catch (error) {
            console.error(`[ApiKeysPlugin] Failed to register scopes for ${plugin.id}:`, error);
          }
        }
      }
    },
  };
}

// ========================================
// Helper Functions
// ========================================

/**
 * Get the current API keys store instance
 */
export function getApiKeysStore(): ApiKeyStore | null {
  return currentStore;
}

/**
 * Verify an API key and return the associated key record
 * Returns null if key is invalid, expired, or inactive
 */
export async function verifyApiKey(plaintextKey: string): Promise<ApiKey | null> {
  if (!currentStore) {
    throw new Error('API Keys plugin not initialized');
  }

  const key = await currentStore.verify(plaintextKey);

  // Update last_used_at timestamp if key is valid
  if (key) {
    await currentStore.recordUsage(key.id).catch(err => {
      console.error('[ApiKeysPlugin] Failed to record key usage:', err);
    });
  }

  return key;
}

/**
 * Create an API key for a user
 */
export async function createApiKey(params: CreateApiKeyParams): Promise<ApiKey> {
  if (!currentStore) {
    throw new Error('API Keys plugin not initialized');
  }

  return currentStore.create(params);
}

/**
 * List all API keys for a user
 */
export async function listApiKeys(userId: string): Promise<ApiKey[]> {
  if (!currentStore) {
    throw new Error('API Keys plugin not initialized');
  }

  return currentStore.list(userId);
}

/**
 * Get a specific API key
 */
export async function getApiKey(userId: string, keyId: string): Promise<ApiKey | null> {
  if (!currentStore) {
    throw new Error('API Keys plugin not initialized');
  }

  return currentStore.get(userId, keyId);
}

/**
 * Update an API key
 */
export async function updateApiKey(
  userId: string,
  keyId: string,
  params: UpdateApiKeyParams
): Promise<ApiKey | null> {
  if (!currentStore) {
    throw new Error('API Keys plugin not initialized');
  }

  return currentStore.update(userId, keyId, params);
}

/**
 * Delete an API key
 */
export async function deleteApiKey(userId: string, keyId: string): Promise<boolean> {
  if (!currentStore) {
    throw new Error('API Keys plugin not initialized');
  }

  return currentStore.delete(userId, keyId);
}
