/**
 * Cache Plugin
 *
 * Provides Redis caching capabilities with connection pooling and health checks.
 * Wraps the 'ioredis' library with a simple, reusable interface.
 *
 * ## Features
 * - Connection management with automatic reconnection
 * - Key prefixing for multi-tenant/multi-app scenarios
 * - TTL-based caching with setex/get operations
 * - Automatic health checks
 * - Multiple named instances support
 * - Graceful shutdown
 *
 * ## Usage
 *
 * ```typescript
 * import { createGateway, createCachePlugin, getCache } from '@qwickapps/server';
 *
 * const gateway = createGateway({
 *   // ... config
 *   plugins: [
 *     createCachePlugin({
 *       url: process.env.REDIS_URL,
 *       keyPrefix: 'myapp:',
 *     }),
 *   ],
 * });
 *
 * // In your service code:
 * const cache = getCache();
 * await cache.set('user:123', userData, 3600); // Cache for 1 hour
 * const user = await cache.get<User>('user:123');
 * ```
 *
 * ## Multiple Caches
 *
 * ```typescript
 * // Register multiple caches with different names
 * createCachePlugin({ url: primaryUrl, keyPrefix: 'session:' }, 'sessions');
 * createCachePlugin({ url: cacheUrl, keyPrefix: 'cache:' }, 'content');
 *
 * // Access by name
 * const sessions = getCache('sessions');
 * const content = getCache('content');
 * ```
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { ControlPanelPlugin, PluginContext } from '../core/types.js';

// Dynamic import for ioredis (optional peer dependency)
type Redis = import('ioredis').default;
type RedisOptions = import('ioredis').RedisOptions;

/**
 * Configuration for the cache plugin
 */
export interface CachePluginConfig {
  /** Redis connection URL (e.g., redis://localhost:6379) */
  url: string;

  /** Key prefix for all cache operations (default: '') */
  keyPrefix?: string;

  /** Default TTL in seconds for set operations (default: 3600 = 1 hour) */
  defaultTtl?: number;

  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;

  /** Retry delay in milliseconds (default: 1000) */
  retryDelayMs?: number;

  /** Connection timeout in milliseconds (default: 5000) */
  connectTimeoutMs?: number;

  /** Command timeout in milliseconds (default: 5000) */
  commandTimeoutMs?: number;

  /** Register a health check for this cache (default: true) */
  healthCheck?: boolean;

  /** Name for the health check (default: 'redis') */
  healthCheckName?: string;

  /** Health check interval in milliseconds (default: 30000) */
  healthCheckInterval?: number;

  /** Called when connection is ready */
  onConnect?: () => void;

  /** Called on connection errors */
  onError?: (error: Error) => void;

  /** Enable lazy connect - don't connect until first command (default: false) */
  lazyConnect?: boolean;
}

/**
 * Cache instance returned by the plugin
 */
export interface CacheInstance {
  /**
   * Get a value from cache
   * @param key - Cache key (prefix is applied automatically)
   * @returns Parsed JSON value or null if not found
   */
  get<T = unknown>(key: string): Promise<T | null>;

  /**
   * Get a raw string value from cache
   * @param key - Cache key (prefix is applied automatically)
   * @returns Raw string value or null if not found
   */
  getRaw(key: string): Promise<string | null>;

  /**
   * Set a value in cache with TTL
   * @param key - Cache key (prefix is applied automatically)
   * @param value - Value to cache (will be JSON stringified)
   * @param ttlSeconds - Time to live in seconds (uses defaultTtl if not specified)
   */
  set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Set a raw string value in cache with TTL
   * @param key - Cache key (prefix is applied automatically)
   * @param value - Raw string value to cache
   * @param ttlSeconds - Time to live in seconds (uses defaultTtl if not specified)
   */
  setRaw(key: string, value: string, ttlSeconds?: number): Promise<void>;

  /**
   * Delete a key from cache
   * @param key - Cache key (prefix is applied automatically)
   * @returns true if key was deleted, false if it didn't exist
   */
  delete(key: string): Promise<boolean>;

  /**
   * Delete multiple keys matching a pattern
   * @param pattern - Pattern to match (prefix is applied automatically)
   * @returns Number of keys deleted
   */
  deletePattern(pattern: string): Promise<number>;

  /**
   * Check if a key exists in cache
   * @param key - Cache key (prefix is applied automatically)
   * @returns true if key exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Set expiration time on a key
   * @param key - Cache key (prefix is applied automatically)
   * @param ttlSeconds - Time to live in seconds
   * @returns true if timeout was set, false if key doesn't exist
   */
  expire(key: string, ttlSeconds: number): Promise<boolean>;

  /**
   * Get remaining TTL for a key
   * @param key - Cache key (prefix is applied automatically)
   * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  ttl(key: string): Promise<number>;

  /**
   * Increment a numeric value
   * @param key - Cache key (prefix is applied automatically)
   * @param delta - Amount to increment by (default: 1)
   * @returns New value after increment
   */
  incr(key: string, delta?: number): Promise<number>;

  /**
   * Get all keys matching a pattern
   * @param pattern - Pattern to match (prefix is applied automatically)
   * @returns Array of matching keys (without prefix)
   */
  keys(pattern: string): Promise<string[]>;

  /**
   * Flush all keys with the configured prefix
   * @returns Number of keys deleted
   */
  flush(): Promise<number>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<{
    connected: boolean;
    keyCount: number;
    usedMemory?: string;
  }>;

  /**
   * Get the underlying Redis client (for advanced use cases)
   */
  getClient(): Redis;

  /**
   * Close the connection
   */
  close(): Promise<void>;
}

// Global registry of cache instances by name
const instances = new Map<string, CacheInstance>();

/**
 * Get a cache instance by name
 *
 * @param name - Instance name (default: 'default')
 * @returns The cache instance
 * @throws Error if the instance is not registered
 *
 * @example
 * ```typescript
 * const cache = getCache();
 * const user = await cache.get<User>('user:123');
 * ```
 */
export function getCache(name = 'default'): CacheInstance {
  const instance = instances.get(name);
  if (!instance) {
    throw new Error(`Cache instance "${name}" not found. Did you register the cache plugin?`);
  }
  return instance;
}

/**
 * Check if a cache instance is registered
 *
 * @param name - Instance name (default: 'default')
 * @returns true if the instance exists
 */
export function hasCache(name = 'default'): boolean {
  return instances.has(name);
}

/**
 * Create a cache plugin
 *
 * @param config - Cache configuration
 * @param instanceName - Name for this cache instance (default: 'default')
 * @returns A control panel plugin
 *
 * @example
 * ```typescript
 * createCachePlugin({
 *   url: process.env.REDIS_URL,
 *   keyPrefix: 'myapp:',
 *   defaultTtl: 3600,
 *   healthCheck: true,
 * });
 * ```
 */
export function createCachePlugin(
  config: CachePluginConfig,
  instanceName = 'default'
): ControlPanelPlugin {
  let client: Redis | null = null;
  const prefix = config.keyPrefix ?? '';
  const defaultTtl = config.defaultTtl ?? 3600;

  const prefixKey = (key: string): string => `${prefix}${key}`;
  const unprefixKey = (key: string): string =>
    prefix && key.startsWith(prefix) ? key.slice(prefix.length) : key;

  const createInstance = async (): Promise<CacheInstance> => {
    // Dynamic import of ioredis
    const { default: Redis } = await import('ioredis');

    const options: RedisOptions = {
      maxRetriesPerRequest: config.maxRetries ?? 3,
      retryStrategy: (times: number) => {
        const maxRetries = config.maxRetries ?? 3;
        if (times > maxRetries) {
          console.error(`[cache:${instanceName}] Connection failed after ${maxRetries} retries`);
          return null; // Stop retrying
        }
        return config.retryDelayMs ?? 1000;
      },
      connectTimeout: config.connectTimeoutMs ?? 5000,
      commandTimeout: config.commandTimeoutMs ?? 5000,
      lazyConnect: config.lazyConnect ?? false,
    };

    client = new Redis(config.url, options);

    // Handle events
    client.on('error', (err) => {
      if (config.onError) {
        config.onError(err);
      } else {
        console.error(`[cache:${instanceName}] Error:`, err.message);
      }
    });

    client.on('connect', () => {
      if (config.onConnect) {
        config.onConnect();
      }
    });

    const instance: CacheInstance = {
      async get<T = unknown>(key: string): Promise<T | null> {
        if (!client) throw new Error('Cache client not initialized');
        const value = await client.get(prefixKey(key));
        if (value === null) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as unknown as T;
        }
      },

      async getRaw(key: string): Promise<string | null> {
        if (!client) throw new Error('Cache client not initialized');
        return client.get(prefixKey(key));
      },

      async set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        if (!client) throw new Error('Cache client not initialized');
        const ttl = ttlSeconds ?? defaultTtl;
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        await client.setex(prefixKey(key), ttl, serialized);
      },

      async setRaw(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (!client) throw new Error('Cache client not initialized');
        const ttl = ttlSeconds ?? defaultTtl;
        await client.setex(prefixKey(key), ttl, value);
      },

      async delete(key: string): Promise<boolean> {
        if (!client) throw new Error('Cache client not initialized');
        const count = await client.del(prefixKey(key));
        return count > 0;
      },

      async deletePattern(pattern: string): Promise<number> {
        if (!client) throw new Error('Cache client not initialized');
        const keys = await client.keys(prefixKey(pattern));
        if (keys.length === 0) return 0;
        return client.del(...keys);
      },

      async exists(key: string): Promise<boolean> {
        if (!client) throw new Error('Cache client not initialized');
        const count = await client.exists(prefixKey(key));
        return count > 0;
      },

      async expire(key: string, ttlSeconds: number): Promise<boolean> {
        if (!client) throw new Error('Cache client not initialized');
        const result = await client.expire(prefixKey(key), ttlSeconds);
        return result === 1;
      },

      async ttl(key: string): Promise<number> {
        if (!client) throw new Error('Cache client not initialized');
        return client.ttl(prefixKey(key));
      },

      async incr(key: string, delta = 1): Promise<number> {
        if (!client) throw new Error('Cache client not initialized');
        if (delta === 1) {
          return client.incr(prefixKey(key));
        }
        return client.incrby(prefixKey(key), delta);
      },

      async keys(pattern: string): Promise<string[]> {
        if (!client) throw new Error('Cache client not initialized');
        const keys = await client.keys(prefixKey(pattern));
        return keys.map(unprefixKey);
      },

      async flush(): Promise<number> {
        if (!client) throw new Error('Cache client not initialized');
        if (!prefix) {
          // Without prefix, this would flush the entire database - dangerous!
          throw new Error('Cannot flush without a keyPrefix configured');
        }
        const keys = await client.keys(`${prefix}*`);
        if (keys.length === 0) return 0;
        return client.del(...keys);
      },

      async getStats(): Promise<{ connected: boolean; keyCount: number; usedMemory?: string }> {
        if (!client) {
          return { connected: false, keyCount: 0 };
        }
        try {
          const info = await client.info('memory');
          const memoryMatch = info.match(/used_memory_human:(\S+)/);
          const usedMemory = memoryMatch ? memoryMatch[1] : undefined;

          const keys = prefix
            ? await client.keys(`${prefix}*`)
            : await client.dbsize();
          const keyCount = typeof keys === 'number' ? keys : keys.length;

          return {
            connected: client.status === 'ready',
            keyCount,
            usedMemory,
          };
        } catch {
          return {
            connected: client.status === 'ready',
            keyCount: 0,
          };
        }
      },

      getClient(): Redis {
        if (!client) throw new Error('Cache client not initialized');
        return client;
      },

      async close(): Promise<void> {
        if (client) {
          await client.quit();
          client = null;
        }
      },
    };

    return instance;
  };

  return {
    name: `cache:${instanceName}`,
    order: 5, // Initialize early, before other plugins that may need cache

    async onInit(context: PluginContext): Promise<void> {
      const { registerHealthCheck, logger } = context;

      // Create and register the instance
      const instance = await createInstance();
      instances.set(instanceName, instance);

      // Test connection
      try {
        // Ping to verify connection
        await instance.getClient().ping();
        logger.debug(`Cache "${instanceName}" connected`);
      } catch (err) {
        logger.error(`Cache "${instanceName}" connection failed: ${err instanceof Error ? err.message : String(err)}`);
        throw err;
      }

      // Register health check if enabled
      if (config.healthCheck !== false) {
        registerHealthCheck({
          name: config.healthCheckName ?? 'redis',
          type: 'custom',
          interval: config.healthCheckInterval ?? 30000,
          timeout: 5000,
          check: async () => {
            const start = Date.now();
            try {
              await instance.getClient().ping();
              const stats = await instance.getStats();
              return {
                healthy: true,
                latency: Date.now() - start,
                details: {
                  connected: stats.connected,
                  keyCount: stats.keyCount,
                  usedMemory: stats.usedMemory,
                },
              };
            } catch (err) {
              return {
                healthy: false,
                latency: Date.now() - start,
                details: {
                  error: err instanceof Error ? err.message : String(err),
                },
              };
            }
          },
        });
      }
    },

    async onShutdown(): Promise<void> {
      const instance = instances.get(instanceName);
      if (instance) {
        await instance.close();
        instances.delete(instanceName);
      }
    },
  };
}
