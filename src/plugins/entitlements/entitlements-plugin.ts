/**
 * Entitlements Plugin
 *
 * User entitlement management plugin for @qwickapps/server.
 * Supports pluggable sources (PostgreSQL, Keap, etc.) with Redis caching.
 *
 * Entitlements are string-based tags (e.g., 'pro', 'enterprise', 'feature:analytics').
 * Multiple sources can be combined - entitlements are merged from all sources.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response, RequestHandler } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type {
  EntitlementsPluginConfig,
  EntitlementSource,
  EntitlementResult,
  EntitlementDefinition,
  CachedEntitlements,
  EntitlementStats,
} from './types.js';
import type { AuthenticatedRequest } from '../auth/types.js';
import { getCache, type CacheInstance } from '../cache-plugin.js';

// Plugin state
let primarySource: EntitlementSource | null = null;
let additionalSources: EntitlementSource[] = [];
let pluginConfig: EntitlementsPluginConfig | null = null;
let cacheInstance: CacheInstance | null = null;
let cacheKeyPrefix = 'entitlements:';
let cacheTtl = 300;
let cacheMappingTtl = 600;
let cacheEnabled = true;
let cacheVersion = 1;

/**
 * Create the Entitlements plugin
 */
export function createEntitlementsPlugin(config: EntitlementsPluginConfig): Plugin {
  const debug = config.debug || false;
  // Routes are mounted under /api by the control panel, so don't include /api in prefix
  const apiPrefix = config.api?.prefix || '/'; // Framework adds /entitlements prefix automatically
  const apiEnabled = config.api?.enabled !== false;
  const enableWriteApi = config.api?.enableWrite !== false;

  function log(message: string, data?: Record<string, unknown>) {
    if (debug) {
      console.log(`[EntitlementsPlugin] ${message}`, data || '');
    }
  }

  // Cache key helpers
  const keys = {
    entitlements: (email: string) => `${cacheKeyPrefix}user:${email.toLowerCase()}`,
    mapping: (source: string, id: string) => `${cacheKeyPrefix}mapping:${source}:${id}`,
  };

  return {
    id: 'entitlements',
    name: 'Entitlements',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      log('Starting entitlements plugin');

      // Initialize primary source
      await config.source.initialize();
      primarySource = config.source;
      log('Primary source initialized', { source: config.source.name });

      // Initialize additional sources
      additionalSources = config.additionalSources || [];
      for (const source of additionalSources) {
        await source.initialize();
        log('Additional source initialized', { source: source.name });
      }

      // Store config
      pluginConfig = config;

      // Setup caching if enabled
      cacheEnabled = config.cache?.enabled !== false;
      if (cacheEnabled) {
        try {
          const instanceName = config.cache?.instanceName || 'default';
          cacheInstance = getCache(instanceName);
          cacheKeyPrefix = config.cache?.keyPrefix || 'entitlements:';
          cacheTtl = config.cache?.ttl || 300;
          cacheMappingTtl = config.cache?.mappingTtl || cacheTtl * 2;
          log('Cache configured', { instanceName, prefix: cacheKeyPrefix, ttl: cacheTtl });
        } catch {
          log('Cache not available, running without caching');
          cacheEnabled = false;
          cacheInstance = null;
        }
      }

      // Register health check
      registry.registerHealthCheck({
        name: 'entitlements-source',
        type: 'custom',
        check: async () => {
          try {
            // Use source's isHealthy() method if available (avoids API calls)
            // Otherwise just check that source is initialized
            if (config.source.isHealthy) {
              const healthy = await config.source.isHealthy();
              return { healthy };
            }
            // Source is healthy if initialized (we got here means it started)
            return { healthy: primarySource !== null };
          } catch {
            return { healthy: false };
          }
        },
      });

      // Add API routes if enabled
      // IMPORTANT: Static paths must be registered BEFORE parameterized paths
      // to prevent /:email from matching "available" and "status"
      if (apiEnabled) {
        // List available entitlements (static path - must be before /:email)
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/available`,
          pluginId: 'entitlements',
          handler: async (_req: Request, res: Response) => {
            try {
              const available = await getAvailableEntitlements();
              res.json({ entitlements: available, total: available.length });
            } catch (error) {
              console.error('[EntitlementsPlugin] List available error:', error);
              res.status(500).json({ error: 'Failed to list available entitlements' });
            }
          },
        });

        // Get entitlements plugin status (static path - must be before /:email)
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/status`,
          pluginId: 'entitlements',
          handler: async (_req: Request, res: Response) => {
            try {
              const sources = [
                {
                  name: config.source.name,
                  description: config.source.description,
                  readonly: config.source.readonly ?? false,
                  primary: true,
                },
                ...additionalSources.map((s) => ({
                  name: s.name,
                  description: s.description,
                  readonly: s.readonly ?? false,
                  primary: false,
                })),
              ];

              res.json({
                readonly: config.source.readonly ?? false,
                writeEnabled: enableWriteApi && !config.source.readonly,
                cacheEnabled,
                cacheTtl,
                sources,
              });
            } catch (error) {
              console.error('[EntitlementsPlugin] Status error:', error);
              res.status(500).json({ error: 'Failed to get status' });
            }
          },
        });

        // Get entitlements statistics (static path - must be before /:email)
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/stats`,
          pluginId: 'entitlements',
          handler: async (_req: Request, res: Response) => {
            try {
              const stats = await getEntitlementStats();
              res.json(stats);
            } catch (error) {
              console.error('[EntitlementsPlugin] Stats error:', error);
              res.status(500).json({ error: 'Failed to get entitlement stats' });
            }
          },
        });

        // Invalidate cache for email (static prefix - must be before /:email)
        registry.addRoute({
          method: 'delete',
          path: `${apiPrefix}/cache/:email`,
          pluginId: 'entitlements',
          handler: async (req: Request, res: Response) => {
            try {
              const email = decodeURIComponent(req.params.email);
              await invalidateEntitlementCache(email);
              log('Cache invalidated', { email });
              res.status(204).send();
            } catch (error) {
              console.error('[EntitlementsPlugin] Invalidate cache error:', error);
              res.status(500).json({ error: 'Failed to invalidate cache' });
            }
          },
        });

        // Get entitlements for email (parameterized - after static paths)
        // Note: We guard against reserved paths that might accidentally match :email
        const reservedPaths = ['stats', 'available', 'status', 'cache'];
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/:email`,
          pluginId: 'entitlements',
          handler: async (req: Request, res: Response) => {
            try {
              const email = decodeURIComponent(req.params.email);

              // Skip reserved paths - they have their own handlers
              if (reservedPaths.includes(email.toLowerCase())) {
                return res.status(404).json({ error: 'Not found' });
              }

              const refresh = req.query.refresh === 'true';

              const result = refresh
                ? await refreshEntitlements(email)
                : await getEntitlements(email);

              res.json(result);
            } catch (error) {
              console.error('[EntitlementsPlugin] Get entitlements error:', error);
              res.status(500).json({ error: 'Failed to get entitlements' });
            }
          },
        });

        // Check specific entitlement
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/:email/check/:entitlement`,
          pluginId: 'entitlements',
          handler: async (req: Request, res: Response) => {
            try {
              const email = decodeURIComponent(req.params.email);
              const entitlement = decodeURIComponent(req.params.entitlement);

              const has = await hasEntitlement(email, entitlement);
              res.json({ email, entitlement, hasEntitlement: has });
            } catch (error) {
              console.error('[EntitlementsPlugin] Check entitlement error:', error);
              res.status(500).json({ error: 'Failed to check entitlement' });
            }
          },
        });

        // Check multiple entitlements
        registry.addRoute({
          method: 'post',
          path: `${apiPrefix}/:email/check`,
          pluginId: 'entitlements',
          handler: async (req: Request, res: Response) => {
            try {
              const email = decodeURIComponent(req.params.email);
              const { entitlements: toCheck, mode = 'any' } = req.body;

              if (!Array.isArray(toCheck) || toCheck.length === 0) {
                return res.status(400).json({ error: 'entitlements array required' });
              }

              const result = await getEntitlements(email);
              const has = toCheck.filter((e: string) => result.entitlements.includes(e));
              const missing = toCheck.filter((e: string) => !result.entitlements.includes(e));

              const passed = mode === 'all'
                ? missing.length === 0
                : has.length > 0;

              res.json({
                email,
                mode,
                passed,
                has,
                missing,
                total: result.entitlements.length,
              });
            } catch (error) {
              console.error('[EntitlementsPlugin] Check entitlements error:', error);
              res.status(500).json({ error: 'Failed to check entitlements' });
            }
          },
        });

        // Refresh entitlements (bypass cache)
        registry.addRoute({
          method: 'post',
          path: `${apiPrefix}/:email/refresh`,
          pluginId: 'entitlements',
          handler: async (req: Request, res: Response) => {
            try {
              const email = decodeURIComponent(req.params.email);
              const result = await refreshEntitlements(email);
              log('Entitlements refreshed', { email, count: result.entitlements.length });
              res.json(result);
            } catch (error) {
              console.error('[EntitlementsPlugin] Refresh entitlements error:', error);
              res.status(500).json({ error: 'Failed to refresh entitlements' });
            }
          },
        });

        // Write endpoints (grant/revoke) - only if enabled and source is writable
        if (enableWriteApi && !config.source.readonly) {
          // Grant entitlement
          registry.addRoute({
            method: 'post',
            path: `${apiPrefix}/:email`,
            pluginId: 'entitlements',
            handler: async (req: Request, res: Response) => {
              try {
                const email = decodeURIComponent(req.params.email);
                const { entitlement } = req.body;

                if (!entitlement) {
                  return res.status(400).json({ error: 'entitlement required' });
                }

                const authReq = req as AuthenticatedRequest;
                const grantedBy = authReq.auth?.user?.email || 'system';

                await grantEntitlement(email, entitlement, grantedBy);
                log('Entitlement granted', { email, entitlement, grantedBy });

                res.status(201).json({ email, entitlement, granted: true });
              } catch (error) {
                console.error('[EntitlementsPlugin] Grant entitlement error:', error);
                res.status(500).json({ error: 'Failed to grant entitlement' });
              }
            },
          });

          // Revoke entitlement
          registry.addRoute({
            method: 'delete',
            path: `${apiPrefix}/:email/:entitlement`,
            pluginId: 'entitlements',
            handler: async (req: Request, res: Response) => {
              try {
                const email = decodeURIComponent(req.params.email);
                const entitlement = decodeURIComponent(req.params.entitlement);

                await revokeEntitlement(email, entitlement);
                log('Entitlement revoked', { email, entitlement });

                res.status(204).send();
              } catch (error) {
                console.error('[EntitlementsPlugin] Revoke entitlement error:', error);
                res.status(500).json({ error: 'Failed to revoke entitlement' });
              }
            },
          });
        }
      }

      // Register UI menu item
      registry.addMenuItem({
        pluginId: 'entitlements',
        id: 'entitlements:sidebar',
        label: 'Entitlements',
        icon: 'local_offer',
        route: '/entitlements',
        order: 35, // After Users (30)
      });

      log('Entitlements plugin started');
    },

    async onStop(): Promise<void> {
      log('Stopping entitlements plugin');

      // Shutdown sources
      if (primarySource) {
        await primarySource.shutdown();
      }
      for (const source of additionalSources) {
        await source.shutdown();
      }

      primarySource = null;
      additionalSources = [];
      pluginConfig = null;
      cacheInstance = null;

      log('Entitlements plugin stopped');
    },
  };
}

// ========================================
// Helper Functions
// ========================================

/**
 * Get the primary entitlement source
 */
export function getEntitlementSource(): EntitlementSource | null {
  return primarySource;
}

/**
 * Check if the primary source is readonly
 */
export function isSourceReadonly(): boolean {
  return primarySource?.readonly ?? true;
}

/**
 * Get entitlements for an email (cache-first)
 */
export async function getEntitlements(email: string): Promise<EntitlementResult> {
  if (!primarySource) {
    throw new Error('Entitlements plugin not initialized');
  }

  const normalizedEmail = email.toLowerCase();
  const cacheKey = `entitlements:user:${normalizedEmail}`;

  // Try cache first
  if (cacheEnabled && cacheInstance) {
    try {
      const cached = await cacheInstance.get<CachedEntitlements>(cacheKey);
      if (cached && new Date(cached.expiresAt) > new Date()) {
        // Call onFetch callback
        if (pluginConfig?.callbacks?.onFetch) {
          await pluginConfig.callbacks.onFetch(normalizedEmail, cached.entitlements, 'cache');
        }

        return {
          identifier: normalizedEmail,
          entitlements: cached.entitlements,
          source: 'cache',
          cachedAt: cached.cachedAt,
          expiresAt: cached.expiresAt,
          bySource: cached.bySource,
        };
      }
    } catch (error) {
      console.error('[EntitlementsPlugin] Cache get error:', error);
    }
  }

  // Fetch from sources
  return fetchFromSources(normalizedEmail);
}

/**
 * Fetch entitlements from all sources and cache the result
 */
async function fetchFromSources(email: string): Promise<EntitlementResult> {
  if (!primarySource) {
    throw new Error('Entitlements plugin not initialized');
  }

  const bySource: Record<string, string[]> = {};

  // Fetch from primary source
  const primaryEntitlements = await primarySource.getEntitlements(email);
  bySource[primarySource.name] = primaryEntitlements;

  // Fetch from additional sources in parallel
  const additionalResults = await Promise.allSettled(
    additionalSources.map(async (source) => {
      const ents = await source.getEntitlements(email);
      return { name: source.name, entitlements: ents };
    })
  );

  for (const result of additionalResults) {
    if (result.status === 'fulfilled') {
      bySource[result.value.name] = result.value.entitlements;
    } else {
      console.error('[EntitlementsPlugin] Source fetch failed:', result.reason);
    }
  }

  // Merge entitlements (union of all sources, deduplicated)
  const allEntitlements = [...new Set(Object.values(bySource).flat())].sort();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + cacheTtl * 1000);

  const result: EntitlementResult = {
    identifier: email,
    entitlements: allEntitlements,
    source: primarySource.name,
    cachedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    bySource,
  };

  // Cache the result
  if (cacheEnabled && cacheInstance) {
    try {
      const cached: CachedEntitlements = {
        email,
        entitlements: allEntitlements,
        bySource,
        cachedAt: result.cachedAt!,
        expiresAt: result.expiresAt!,
        version: cacheVersion,
      };
      await cacheInstance.set(`entitlements:user:${email}`, cached, cacheTtl);
    } catch (error) {
      console.error('[EntitlementsPlugin] Cache set error:', error);
    }
  }

  // Call onFetch callback
  if (pluginConfig?.callbacks?.onFetch) {
    await pluginConfig.callbacks.onFetch(email, allEntitlements, primarySource.name);
  }

  return result;
}

/**
 * Refresh entitlements (bypass cache)
 */
export async function refreshEntitlements(email: string): Promise<EntitlementResult> {
  await invalidateEntitlementCache(email);
  return fetchFromSources(email.toLowerCase());
}

/**
 * Check if user has a specific entitlement
 */
export async function hasEntitlement(email: string, entitlement: string): Promise<boolean> {
  const result = await getEntitlements(email);
  return result.entitlements.includes(entitlement);
}

/**
 * Check if user has any of the specified entitlements
 */
export async function hasAnyEntitlement(email: string, entitlements: string[]): Promise<boolean> {
  const result = await getEntitlements(email);
  return entitlements.some((e) => result.entitlements.includes(e));
}

/**
 * Check if user has all of the specified entitlements
 */
export async function hasAllEntitlements(email: string, entitlements: string[]): Promise<boolean> {
  const result = await getEntitlements(email);
  return entitlements.every((e) => result.entitlements.includes(e));
}

/**
 * Grant an entitlement to a user
 * @throws Error if source is read-only
 */
export async function grantEntitlement(
  email: string,
  entitlement: string,
  grantedBy?: string
): Promise<void> {
  if (!primarySource) {
    throw new Error('Entitlements plugin not initialized');
  }

  if (primarySource.readonly || !primarySource.addEntitlement) {
    throw new Error('Primary entitlement source is read-only');
  }

  await primarySource.addEntitlement(email, entitlement, grantedBy);

  // Invalidate cache
  await invalidateEntitlementCache(email);

  // Call onGrant callback
  if (pluginConfig?.callbacks?.onGrant) {
    await pluginConfig.callbacks.onGrant(email, entitlement, grantedBy);
  }
}

/**
 * Revoke an entitlement from a user
 * @throws Error if source is read-only
 */
export async function revokeEntitlement(email: string, entitlement: string): Promise<void> {
  if (!primarySource) {
    throw new Error('Entitlements plugin not initialized');
  }

  if (primarySource.readonly || !primarySource.removeEntitlement) {
    throw new Error('Primary entitlement source is read-only');
  }

  await primarySource.removeEntitlement(email, entitlement);

  // Invalidate cache
  await invalidateEntitlementCache(email);

  // Call onRevoke callback
  if (pluginConfig?.callbacks?.onRevoke) {
    await pluginConfig.callbacks.onRevoke(email, entitlement);
  }
}

/**
 * Set all entitlements for a user (replaces existing)
 * Used by sync services to bulk-update user entitlements from external sources
 * @throws Error if source is read-only or doesn't support setEntitlements
 */
export async function setEntitlements(email: string, entitlements: string[]): Promise<void> {
  if (!primarySource) {
    throw new Error('Entitlements plugin not initialized');
  }

  if (primarySource.readonly) {
    throw new Error('Primary entitlement source is read-only');
  }

  if (!primarySource.setEntitlements) {
    throw new Error('Primary entitlement source does not support setEntitlements');
  }

  await primarySource.setEntitlements(email, entitlements);

  // Invalidate cache
  await invalidateEntitlementCache(email);
}

/**
 * Get all available entitlement definitions
 */
export async function getAvailableEntitlements(): Promise<EntitlementDefinition[]> {
  if (!primarySource) {
    throw new Error('Entitlements plugin not initialized');
  }

  const allDefinitions: EntitlementDefinition[] = [];

  // Get from primary source
  if (primarySource.getAllAvailable) {
    const defs = await primarySource.getAllAvailable();
    allDefinitions.push(...defs);
  }

  // Get from additional sources
  for (const source of additionalSources) {
    if (source.getAllAvailable) {
      try {
        const defs = await source.getAllAvailable();
        // Add source prefix to avoid collisions
        allDefinitions.push(
          ...defs.map((d) => ({
            ...d,
            id: `${source.name}:${d.id}`,
            category: d.category || source.name,
          }))
        );
      } catch (error) {
        console.error(`[EntitlementsPlugin] Failed to get available from ${source.name}:`, error);
      }
    }
  }

  return allDefinitions;
}

/**
 * Get entitlement statistics from the primary source
 */
export async function getEntitlementStats(): Promise<EntitlementStats> {
  if (!primarySource) {
    throw new Error('Entitlements plugin not initialized');
  }

  // If source has getStats method, use it
  if (primarySource.getStats) {
    return primarySource.getStats();
  }

  // Fallback: return zeros if source doesn't support stats
  return {
    usersWithEntitlements: 0,
    totalEntitlements: 0,
  };
}

/**
 * Invalidate cache for an email
 */
export async function invalidateEntitlementCache(email: string): Promise<void> {
  if (!cacheEnabled || !cacheInstance) return;

  const normalizedEmail = email.toLowerCase();
  try {
    await cacheInstance.delete(`entitlements:user:${normalizedEmail}`);
  } catch (error) {
    console.error('[EntitlementsPlugin] Cache delete error:', error);
  }
}

/**
 * Store a mapping from external ID to email (for webhook invalidation)
 */
export async function storeExternalIdMapping(
  source: string,
  externalId: string,
  email: string
): Promise<void> {
  if (!cacheEnabled || !cacheInstance) return;

  try {
    await cacheInstance.set(
      `entitlements:mapping:${source}:${externalId}`,
      email.toLowerCase(),
      cacheMappingTtl
    );
  } catch (error) {
    console.error('[EntitlementsPlugin] Store mapping error:', error);
  }
}

/**
 * Invalidate cache by external ID (for webhook handling)
 */
export async function invalidateByExternalId(source: string, externalId: string): Promise<void> {
  if (!cacheEnabled || !cacheInstance) return;

  try {
    const email = await cacheInstance.get<string>(`entitlements:mapping:${source}:${externalId}`);
    if (email) {
      await invalidateEntitlementCache(email);
    }
  } catch (error) {
    console.error('[EntitlementsPlugin] Invalidate by external ID error:', error);
  }
}

// ========================================
// Middleware Helpers
// ========================================

/**
 * Express middleware to require a specific entitlement
 */
export function requireEntitlement(entitlement: string): RequestHandler {
  return async (req, res, next) => {
    const authReq = req as AuthenticatedRequest;
    const email = authReq.auth?.user?.email;

    if (!email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const has = await hasEntitlement(email, entitlement);
    if (!has) {
      return res.status(403).json({
        error: 'Insufficient entitlements',
        required: entitlement,
      });
    }

    next();
  };
}

/**
 * Express middleware to require any of the specified entitlements
 */
export function requireAnyEntitlement(entitlements: string[]): RequestHandler {
  return async (req, res, next) => {
    const authReq = req as AuthenticatedRequest;
    const email = authReq.auth?.user?.email;

    if (!email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const has = await hasAnyEntitlement(email, entitlements);
    if (!has) {
      return res.status(403).json({
        error: 'Insufficient entitlements',
        required: entitlements,
        mode: 'any',
      });
    }

    next();
  };
}

/**
 * Express middleware to require all of the specified entitlements
 */
export function requireAllEntitlements(entitlements: string[]): RequestHandler {
  return async (req, res, next) => {
    const authReq = req as AuthenticatedRequest;
    const email = authReq.auth?.user?.email;

    if (!email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const has = await hasAllEntitlements(email, entitlements);
    if (!has) {
      return res.status(403).json({
        error: 'Insufficient entitlements',
        required: entitlements,
        mode: 'all',
      });
    }

    next();
  };
}
