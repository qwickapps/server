/**
 * Rate Limit Plugin Environment Configuration
 *
 * Factory function for configuring rate limiting via environment variables.
 *
 * Environment Variables:
 * - RATE_LIMIT_ENABLED: Enable rate limiting (default: true)
 * - RATE_LIMIT_STRATEGY: Strategy to use: sliding-window, fixed-window, token-bucket (default: sliding-window)
 * - RATE_LIMIT_WINDOW_MS: Window size in milliseconds (default: 60000 = 1 minute)
 * - RATE_LIMIT_MAX_REQUESTS: Maximum requests per window (default: 100)
 * - RATE_LIMIT_CACHE_TYPE: Cache type: redis, memory, auto (default: auto)
 * - RATE_LIMIT_CLEANUP_ENABLED: Enable cleanup job (default: true)
 * - RATE_LIMIT_CLEANUP_INTERVAL_MS: Cleanup interval in ms (default: 300000 = 5 minutes)
 * - RATE_LIMIT_API_ENABLED: Enable status API endpoints (default: true)
 * - RATE_LIMIT_API_PREFIX: API route prefix (default: /rate-limit)
 * - RATE_LIMIT_DEBUG: Enable debug logging (default: false)
 *
 * PostgreSQL Store (via postgres-plugin):
 * - RATE_LIMIT_TABLE_NAME: Table name (default: rate_limits)
 * - RATE_LIMIT_ENABLE_RLS: Enable Row-Level Security (default: true)
 * - RATE_LIMIT_AUTO_CREATE_TABLES: Auto-create tables (default: true)
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type { RateLimitPluginConfig, RateLimitStrategy, RateLimitCacheConfig } from './types.js';
import { createRateLimitPlugin } from './rate-limit-plugin.js';
import { postgresRateLimitStore } from './stores/postgres-store.js';
import { getPostgres, hasPostgres } from '../postgres-plugin.js';

// ═══════════════════════════════════════════════════════════════════════════
// Module State
// ═══════════════════════════════════════════════════════════════════════════

interface RateLimitConfigStatus {
  state: 'disabled' | 'enabled' | 'error';
  strategy: RateLimitStrategy | null;
  error?: string;
  config?: Record<string, string | number | boolean>;
}

let currentStatus: RateLimitConfigStatus = {
  state: 'disabled',
  strategy: null,
};

// ═══════════════════════════════════════════════════════════════════════════
// Environment Variable Helpers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get an environment variable, treating empty strings as undefined
 */
function getEnv(key: string): string | undefined {
  const value = process.env[key];
  if (value === undefined || value === null || value.trim() === '') {
    return undefined;
  }
  return value.trim();
}

/**
 * Parse a boolean environment variable
 */
function getEnvBool(key: string, defaultValue: boolean): boolean {
  const value = getEnv(key);
  if (value === undefined) {
    return defaultValue;
  }
  const lower = value.toLowerCase();
  if (['true', '1', 'yes'].includes(lower)) {
    return true;
  }
  if (['false', '0', 'no'].includes(lower)) {
    return false;
  }
  return defaultValue;
}

/**
 * Parse an integer environment variable
 */
function getEnvInt(key: string, defaultValue: number): number {
  const value = getEnv(key);
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// ═══════════════════════════════════════════════════════════════════════════
// Factory Options
// ═══════════════════════════════════════════════════════════════════════════

export interface RateLimitEnvPluginOptions {
  /**
   * Override the default store. If not provided, uses postgres-plugin.
   */
  store?: RateLimitPluginConfig['store'];

  /**
   * Debug mode override
   */
  debug?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// Factory Function
// ═══════════════════════════════════════════════════════════════════════════

const VALID_STRATEGIES: RateLimitStrategy[] = ['sliding-window', 'fixed-window', 'token-bucket'];
const VALID_CACHE_TYPES: RateLimitCacheConfig['type'][] = ['redis', 'memory', 'auto'];

/**
 * Create a rate limit plugin configured from environment variables.
 *
 * The plugin state depends on environment configuration:
 * - **disabled**: RATE_LIMIT_ENABLED=false - no rate limiting is applied
 * - **enabled**: Valid configuration - rate limiting is active
 * - **error**: Invalid configuration or missing postgres - plugin is disabled with error details
 *
 * @example
 * ```typescript
 * // Zero-config setup - reads everything from env vars
 * // Requires postgres-plugin to be registered first
 * const rateLimitPlugin = createRateLimitPluginFromEnv();
 *
 * // With custom store
 * const rateLimitPlugin = createRateLimitPluginFromEnv({
 *   store: myCustomStore,
 * });
 * ```
 *
 * @param options - Optional overrides
 * @returns A Plugin instance
 */
export function createRateLimitPluginFromEnv(options?: RateLimitEnvPluginOptions): Plugin {
  const enabled = getEnvBool('RATE_LIMIT_ENABLED', true);

  // Check if disabled
  if (!enabled) {
    currentStatus = {
      state: 'disabled',
      strategy: null,
    };
    return createDisabledPlugin();
  }

  // Parse strategy
  const strategyName = getEnv('RATE_LIMIT_STRATEGY')?.toLowerCase() || 'sliding-window';
  if (!VALID_STRATEGIES.includes(strategyName as RateLimitStrategy)) {
    const error = `Invalid RATE_LIMIT_STRATEGY: "${strategyName}". Valid options: ${VALID_STRATEGIES.join(', ')}`;
    currentStatus = {
      state: 'error',
      strategy: null,
      error,
    };
    return createErrorPlugin(error);
  }
  const strategy = strategyName as RateLimitStrategy;

  // Parse cache type
  const cacheTypeName = getEnv('RATE_LIMIT_CACHE_TYPE')?.toLowerCase() || 'auto';
  if (!VALID_CACHE_TYPES.includes(cacheTypeName as RateLimitCacheConfig['type'])) {
    const error = `Invalid RATE_LIMIT_CACHE_TYPE: "${cacheTypeName}". Valid options: ${VALID_CACHE_TYPES.join(', ')}`;
    currentStatus = {
      state: 'error',
      strategy: null,
      error,
    };
    return createErrorPlugin(error);
  }
  const cacheType = cacheTypeName as RateLimitCacheConfig['type'];

  // Parse other config
  const windowMs = getEnvInt('RATE_LIMIT_WINDOW_MS', 60000);
  const maxRequests = getEnvInt('RATE_LIMIT_MAX_REQUESTS', 100);
  const cleanupEnabled = getEnvBool('RATE_LIMIT_CLEANUP_ENABLED', true);
  const cleanupIntervalMs = getEnvInt('RATE_LIMIT_CLEANUP_INTERVAL_MS', 300000);
  const apiEnabled = getEnvBool('RATE_LIMIT_API_ENABLED', true);
  const apiPrefix = getEnv('RATE_LIMIT_API_PREFIX') || '/rate-limit';
  const debug = options?.debug ?? getEnvBool('RATE_LIMIT_DEBUG', false);

  // PostgreSQL store config
  const tableName = getEnv('RATE_LIMIT_TABLE_NAME') || 'rate_limits';
  const enableRLS = getEnvBool('RATE_LIMIT_ENABLE_RLS', true);
  const autoCreateTables = getEnvBool('RATE_LIMIT_AUTO_CREATE_TABLES', true);

  // Build config
  const config: Omit<RateLimitPluginConfig, 'store'> = {
    defaults: {
      windowMs,
      maxRequests,
      strategy,
    },
    cache: {
      type: cacheType,
    },
    cleanup: {
      enabled: cleanupEnabled,
      intervalMs: cleanupIntervalMs,
    },
    api: {
      enabled: apiEnabled,
      prefix: apiPrefix,
    },
    debug,
  };

  // Update status
  currentStatus = {
    state: 'enabled',
    strategy,
    config: {
      strategy,
      windowMs,
      maxRequests,
      cacheType: cacheType as string,
      cleanupEnabled,
      cleanupIntervalMs,
      apiEnabled,
      apiPrefix,
      tableName,
      enableRLS,
      autoCreateTables,
    },
  };

  // Return a plugin that will initialize store on start
  return createDeferredPlugin(config, options?.store, {
    tableName,
    enableRLS,
    autoCreateTables,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Status API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get current rate limit plugin status
 */
export function getRateLimitConfigStatus(): RateLimitConfigStatus {
  return { ...currentStatus };
}

/**
 * Register config API routes
 */
function registerConfigRoutes(registry: PluginRegistry): void {
  // GET /rate-limit/config/status - Get current rate limit status
  registry.addRoute({
    method: 'get',
    path: '/rate-limit/config/status',
    pluginId: 'rate-limit',
    handler: (_req: Request, res: Response) => {
      res.json(getRateLimitConfigStatus());
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Plugin Factories
// ═══════════════════════════════════════════════════════════════════════════

interface PostgresStoreOptions {
  tableName: string;
  enableRLS: boolean;
  autoCreateTables: boolean;
}

/**
 * Create a deferred plugin that initializes the store on start
 * This allows the postgres-plugin to be initialized first
 */
function createDeferredPlugin(
  config: Omit<RateLimitPluginConfig, 'store'>,
  customStore: RateLimitPluginConfig['store'] | undefined,
  pgOptions: PostgresStoreOptions
): Plugin {
  return {
    id: 'rate-limit',
    name: 'Rate Limit Plugin',
    version: '1.0.0',

    async onStart(pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      const logger = registry.getLogger('rate-limit');

      // Get or create store
      let store = customStore;
      if (!store) {
        // Check if postgres plugin is available
        if (!hasPostgres()) {
          const error = 'Rate limit plugin requires postgres-plugin to be registered and started first';
          logger.error(error);
          currentStatus = {
            state: 'error',
            strategy: null,
            error,
          };
          // Register config routes so admin can see the error
          registerConfigRoutes(registry);
          return;
        }

        // Create postgres store
        store = postgresRateLimitStore({
          pool: () => getPostgres().getPool(),
          tableName: pgOptions.tableName,
          enableRLS: pgOptions.enableRLS,
          autoCreateTables: pgOptions.autoCreateTables,
        });
      }

      // Create the actual plugin and delegate
      const actualPlugin = createRateLimitPlugin({
        ...config,
        store,
      });

      // Call its onStart
      await actualPlugin.onStart?.(pluginConfig, registry);

      // Register config routes
      registerConfigRoutes(registry);

      logger.info('Rate limit plugin started from env config', {
        strategy: config.defaults!.strategy,
        windowMs: config.defaults!.windowMs,
        maxRequests: config.defaults!.maxRequests,
      });
    },

    async onStop(): Promise<void> {
      // The actual plugin handles cleanup
    },
  };
}

/**
 * Create a disabled plugin (no rate limiting)
 */
function createDisabledPlugin(): Plugin {
  return {
    id: 'rate-limit',
    name: 'Rate Limit Plugin (Disabled)',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      const logger = registry.getLogger('rate-limit');
      logger.info('Rate limit plugin disabled - RATE_LIMIT_ENABLED=false');

      // Register status routes even when disabled
      registerConfigRoutes(registry);
    },

    async onStop(): Promise<void> {
      // Nothing to cleanup
    },
  };
}

/**
 * Create an error plugin (rate limiting disabled due to configuration error)
 */
function createErrorPlugin(error: string): Plugin {
  return {
    id: 'rate-limit',
    name: 'Rate Limit Plugin (Error)',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      const logger = registry.getLogger('rate-limit');
      logger.error(`Rate limit plugin error: ${error}`);

      // Register status routes so admin can see the error
      registerConfigRoutes(registry);
    },

    async onStop(): Promise<void> {
      // Nothing to cleanup
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Exports for Testing
// ═══════════════════════════════════════════════════════════════════════════

export const __testing = {
  getEnv,
  getEnvBool,
  getEnvInt,
  VALID_STRATEGIES,
  VALID_CACHE_TYPES,
};
