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
import type { Plugin } from '../core/plugin-registry.js';
type Redis = import('ioredis').default;
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
    scanKeys(pattern: string, options?: {
        count?: number;
    }): Promise<string[]>;
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
export declare function getCache(name?: string): CacheInstance;
/**
 * Check if a cache instance is registered
 *
 * @param name - Instance name (default: 'default')
 * @returns true if the instance exists
 */
export declare function hasCache(name?: string): boolean;
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
export declare function createCachePlugin(config: CachePluginConfig, instanceName?: string): Plugin;
export {};
//# sourceMappingURL=cache-plugin.d.ts.map