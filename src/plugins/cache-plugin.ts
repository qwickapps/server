/**
 * Cache Plugin
 *
 * Provides caching capabilities with Redis or in-memory storage.
 * Supports Redis via 'ioredis' library or zero-dependency in-memory LRU cache.
 *
 * ## Features
 * - Dual-mode: Redis (persistent, distributed) or Memory (fast, local)
 * - Connection management with automatic reconnection (Redis)
 * - LRU eviction with TTL expiration (Memory)
 * - Key prefixing for multi-tenant/multi-app scenarios
 * - TTL-based caching with get/set operations
 * - Automatic health checks
 * - Multiple named instances support
 * - Graceful shutdown
 *
 * ## Usage (Redis)
 *
 * ```typescript
 * import { createGateway, createCachePlugin, getCache } from '@qwickapps/server';
 *
 * const gateway = createGateway({
 *   // ... config
 *   plugins: [
 *     createCachePlugin({
 *       type: 'redis',
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
 * ## Usage (In-Memory)
 *
 * ```typescript
 * // Zero external dependencies - perfect for demos and testing
 * createCachePlugin({
 *   type: 'memory',
 *   keyPrefix: 'demo:',
 *   defaultTtl: 3600,
 *   maxMemoryEntries: 5000,
 * })
 * ```
 *
 * ## Multiple Caches
 *
 * ```typescript
 * // Register multiple caches with different names
 * createCachePlugin({ url: primaryUrl, keyPrefix: 'session:' }, 'sessions');
 * createCachePlugin({ type: 'memory', keyPrefix: 'cache:' }, 'content');
 *
 * // Access by name
 * const sessions = getCache('sessions');
 * const content = getCache('content');
 * ```
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../core/plugin-registry.js';

// Dynamic import for ioredis (optional peer dependency)
type Redis = import('ioredis').default;
type RedisOptions = import('ioredis').RedisOptions;

/**
 * Configuration for the cache plugin
 */
export interface CachePluginConfig {
  /** Cache type: 'redis' or 'memory' (default: 'redis' if url provided, 'memory' otherwise) */
  type?: 'redis' | 'memory';

  /** Redis connection URL (required for type='redis', e.g., redis://localhost:6379) */
  url?: string;

  /** Key prefix for all cache operations (default: '') */
  keyPrefix?: string;

  /** Default TTL in seconds for set operations (default: 3600 = 1 hour) */
  defaultTtl?: number;

  /** Maximum number of entries for memory cache (default: 10000, only used for type='memory') */
  maxMemoryEntries?: number;

  /** Maximum number of retry attempts (default: 3, only used for type='redis') */
  maxRetries?: number;

  /** Retry delay in milliseconds (default: 1000, only used for type='redis') */
  retryDelayMs?: number;

  /** Connection timeout in milliseconds (default: 5000, only used for type='redis') */
  connectTimeoutMs?: number;

  /** Command timeout in milliseconds (default: 5000, only used for type='redis') */
  commandTimeoutMs?: number;

  /** Register a health check for this cache (default: true) */
  healthCheck?: boolean;

  /** Name for the health check (default: 'redis' or 'memory') */
  healthCheckName?: string;

  /** Health check interval in milliseconds (default: 30000) */
  healthCheckInterval?: number;

  /** Called when connection is ready (only used for type='redis') */
  onConnect?: () => void;

  /** Called on connection errors (only used for type='redis') */
  onError?: (error: Error) => void;

  /** Enable lazy connect - don't connect until first command (default: false, only used for type='redis') */
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
   * @deprecated Use scanKeys() for production - keys() blocks Redis on large datasets
   */
  keys(pattern: string): Promise<string[]>;

  /**
   * Scan keys matching a pattern using cursor-based iteration (non-blocking)
   * @param pattern - Pattern to match (prefix is applied automatically)
   * @param options - Optional scan configuration
   * @param options.count - Hint for how many keys to return per iteration (default: 100)
   * @returns Array of matching keys (without prefix)
   */
  scanKeys(pattern: string, options?: { count?: number }): Promise<string[]>;

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

/**
 * Simple LRU Cache implementation for in-memory fallback
 */
class LRUCache<T> {
  private cache = new Map<string, { value: T; expiresAt: number }>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check expiration
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    // Remove oldest entries if at capacity
    while (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      } else {
        break;
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  keys(pattern: string): string[] {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const result: string[] = [];
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        const entry = this.cache.get(key);
        if (entry && entry.expiresAt > Date.now()) {
          result.push(key);
        }
      }
    }
    return result;
  }

  size(): number {
    // Clean up expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= Date.now()) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
  }
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
 * @returns A plugin
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
): Plugin {
  // Determine cache type
  const cacheType = config.type || (config.url ? 'redis' : 'memory');

  let client: Redis | null = null;
  let lru: LRUCache<string> | null = null;
  const prefix = config.keyPrefix ?? '';
  const defaultTtl = config.defaultTtl ?? 3600;
  const pluginId = `cache:${instanceName}`;

  const prefixKey = (key: string): string => `${prefix}${key}`;
  const unprefixKey = (key: string): string =>
    prefix && key.startsWith(prefix) ? key.slice(prefix.length) : key;

  const createMemoryInstance = (): CacheInstance => {
    const maxEntries = config.maxMemoryEntries || 10000;
    lru = new LRUCache<string>(maxEntries);

    return {
      async get<T = unknown>(key: string): Promise<T | null> {
        if (!lru) throw new Error('Cache not initialized');
        const value = lru.get(prefixKey(key));
        if (value === null) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as unknown as T;
        }
      },

      async getRaw(key: string): Promise<string | null> {
        if (!lru) throw new Error('Cache not initialized');
        return lru.get(prefixKey(key));
      },

      async set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        if (!lru) throw new Error('Cache not initialized');
        const ttl = (ttlSeconds ?? defaultTtl) * 1000; // Convert to ms
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        lru.set(prefixKey(key), serialized, ttl);
      },

      async setRaw(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (!lru) throw new Error('Cache not initialized');
        const ttl = (ttlSeconds ?? defaultTtl) * 1000;
        lru.set(prefixKey(key), value, ttl);
      },

      async delete(key: string): Promise<boolean> {
        if (!lru) throw new Error('Cache not initialized');
        return lru.delete(prefixKey(key));
      },

      async deletePattern(pattern: string): Promise<number> {
        if (!lru) throw new Error('Cache not initialized');
        const keys = lru.keys(prefixKey(pattern));
        keys.forEach(k => lru!.delete(k));
        return keys.length;
      },

      async exists(key: string): Promise<boolean> {
        if (!lru) throw new Error('Cache not initialized');
        return lru.has(prefixKey(key));
      },

      async expire(key: string, ttlSeconds: number): Promise<boolean> {
        if (!lru) throw new Error('Cache not initialized');
        const value = lru.get(prefixKey(key));
        if (value === null) return false;
        lru.set(prefixKey(key), value, ttlSeconds * 1000);
        return true;
      },

      async ttl(key: string): Promise<number> {
        if (!lru) throw new Error('Cache not initialized');
        // Memory cache doesn't track TTL separately
        return lru.has(prefixKey(key)) ? -1 : -2;
      },

      async incr(key: string, delta = 1): Promise<number> {
        if (!lru) throw new Error('Cache not initialized');
        const current = lru.get(prefixKey(key));
        const value = current ? parseInt(current, 10) + delta : delta;
        lru.set(prefixKey(key), value.toString(), defaultTtl * 1000);
        return value;
      },

      async keys(pattern: string): Promise<string[]> {
        if (!lru) throw new Error('Cache not initialized');
        return lru.keys(prefixKey(pattern)).map(unprefixKey);
      },

      async scanKeys(pattern: string): Promise<string[]> {
        // Memory cache can use same implementation as keys()
        return this.keys(pattern);
      },

      async flush(): Promise<number> {
        if (!lru) throw new Error('Cache not initialized');
        if (!prefix) {
          throw new Error('Cannot flush without a keyPrefix configured');
        }
        const keys = lru.keys(`${prefix}*`);
        keys.forEach(k => lru!.delete(k));
        return keys.length;
      },

      async getStats(): Promise<{ connected: boolean; keyCount: number; usedMemory?: string }> {
        if (!lru) {
          return { connected: false, keyCount: 0 };
        }
        return {
          connected: true,
          keyCount: lru.size(),
          usedMemory: undefined,
        };
      },

      getClient(): Redis {
        throw new Error('Memory cache does not have a Redis client');
      },

      async close(): Promise<void> {
        if (lru) {
          lru.clear();
          lru = null;
        }
      },
    };
  };

  const createRedisInstance = async (): Promise<CacheInstance> => {
    // Validate Redis URL is provided
    if (!config.url) {
      throw new Error('Redis URL is required for Redis cache type');
    }

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

      async scanKeys(pattern: string, options?: { count?: number }): Promise<string[]> {
        if (!client) throw new Error('Cache client not initialized');
        const results: string[] = [];
        const stream = client.scanStream({
          match: prefixKey(pattern),
          count: options?.count ?? 100,
        });

        return new Promise((resolve, reject) => {
          stream.on('data', (keys: string[]) => {
            for (const key of keys) {
              results.push(unprefixKey(key));
            }
          });
          stream.on('end', () => resolve(results));
          stream.on('error', (err) => reject(err));
        });
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
    id: pluginId,
    name: `${cacheType === 'memory' ? 'Memory' : 'Redis'} Cache (${instanceName})`,
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      const logger = registry.getLogger(pluginId);

      // Create and register the instance based on type
      const instance = cacheType === 'memory'
        ? createMemoryInstance()
        : await createRedisInstance();
      instances.set(instanceName, instance);

      // Test connection (skip for memory, test for Redis)
      if (cacheType === 'redis') {
        try {
          await instance.getClient().ping();
          logger.debug(`Cache "${instanceName}" connected`);
        } catch (err) {
          logger.error(`Cache "${instanceName}" connection failed: ${err instanceof Error ? err.message : String(err)}`);
          throw err;
        }
      } else {
        logger.debug(`Cache "${instanceName}" initialized (in-memory)`);
      }

      // Register health check if enabled
      if (config.healthCheck !== false) {
        registry.registerHealthCheck({
          name: config.healthCheckName ?? (cacheType === 'memory' ? 'memory-cache' : 'redis'),
          type: 'custom',
          interval: config.healthCheckInterval ?? 30000,
          timeout: 5000,
          check: async () => {
            const start = Date.now();
            try {
              if (cacheType === 'redis') {
                await instance.getClient().ping();
              }
              const stats = await instance.getStats();
              return {
                healthy: true,
                latency: Date.now() - start,
                details: {
                  type: cacheType,
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

      // Register maintenance routes (only for default instance to avoid conflicts)
      if (instanceName === 'default') {
        // GET /stats - Cache statistics
        registry.addRoute({
          method: 'get',
          path: '/stats',
          pluginId: 'cache',
          handler: async (_req: Request, res: Response) => {
            try {
              const stats = await instance.getStats();
              return res.json(stats);
            } catch (error) {
              logger.error('Failed to get cache stats', { error });
              return res.status(500).json({
                error: 'Failed to get cache stats',
                message: error instanceof Error ? error.message : String(error),
              });
            }
          },
        });

        // POST /flush - Clear cache
        registry.addRoute({
          method: 'post',
          path: '/flush',
          pluginId: 'cache',
          handler: async (_req: Request, res: Response) => {
            try {
              const deletedCount = await instance.flush();
              logger.info(`Flushed cache: ${deletedCount} keys deleted`);
              return res.json({
                success: true,
                message: `Cache flushed successfully`,
                deletedCount,
              });
            } catch (error) {
              logger.error('Failed to flush cache', { error });
              return res.status(500).json({
                error: 'Failed to flush cache',
                message: error instanceof Error ? error.message : String(error),
              });
            }
          },
        });

        // Register maintenance widget
        registry.addWidget({
          id: 'cache-maintenance',
          title: 'Cache Management',
          component: 'CacheMaintenanceWidget',
          type: 'maintenance',
          priority: 60,
          showByDefault: true,
          pluginId: 'cache',
        });
      }
    },

    async onStop(): Promise<void> {
      const instance = instances.get(instanceName);
      if (instance) {
        await instance.close();
        instances.delete(instanceName);
      }
    },
  };
}
