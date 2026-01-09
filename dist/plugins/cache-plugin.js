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
// Global registry of cache instances by name
const instances = new Map();
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
export function getCache(name = 'default') {
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
export function hasCache(name = 'default') {
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
export function createCachePlugin(config, instanceName = 'default') {
    let client = null;
    const prefix = config.keyPrefix ?? '';
    const defaultTtl = config.defaultTtl ?? 3600;
    const pluginId = `cache:${instanceName}`;
    const prefixKey = (key) => `${prefix}${key}`;
    const unprefixKey = (key) => prefix && key.startsWith(prefix) ? key.slice(prefix.length) : key;
    const createInstance = async () => {
        // Dynamic import of ioredis
        const { default: Redis } = await import('ioredis');
        const options = {
            maxRetriesPerRequest: config.maxRetries ?? 3,
            retryStrategy: (times) => {
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
            }
            else {
                console.error(`[cache:${instanceName}] Error:`, err.message);
            }
        });
        client.on('connect', () => {
            if (config.onConnect) {
                config.onConnect();
            }
        });
        const instance = {
            async get(key) {
                if (!client)
                    throw new Error('Cache client not initialized');
                const value = await client.get(prefixKey(key));
                if (value === null)
                    return null;
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            },
            async getRaw(key) {
                if (!client)
                    throw new Error('Cache client not initialized');
                return client.get(prefixKey(key));
            },
            async set(key, value, ttlSeconds) {
                if (!client)
                    throw new Error('Cache client not initialized');
                const ttl = ttlSeconds ?? defaultTtl;
                const serialized = typeof value === 'string' ? value : JSON.stringify(value);
                await client.setex(prefixKey(key), ttl, serialized);
            },
            async setRaw(key, value, ttlSeconds) {
                if (!client)
                    throw new Error('Cache client not initialized');
                const ttl = ttlSeconds ?? defaultTtl;
                await client.setex(prefixKey(key), ttl, value);
            },
            async delete(key) {
                if (!client)
                    throw new Error('Cache client not initialized');
                const count = await client.del(prefixKey(key));
                return count > 0;
            },
            async deletePattern(pattern) {
                if (!client)
                    throw new Error('Cache client not initialized');
                const keys = await client.keys(prefixKey(pattern));
                if (keys.length === 0)
                    return 0;
                return client.del(...keys);
            },
            async exists(key) {
                if (!client)
                    throw new Error('Cache client not initialized');
                const count = await client.exists(prefixKey(key));
                return count > 0;
            },
            async expire(key, ttlSeconds) {
                if (!client)
                    throw new Error('Cache client not initialized');
                const result = await client.expire(prefixKey(key), ttlSeconds);
                return result === 1;
            },
            async ttl(key) {
                if (!client)
                    throw new Error('Cache client not initialized');
                return client.ttl(prefixKey(key));
            },
            async incr(key, delta = 1) {
                if (!client)
                    throw new Error('Cache client not initialized');
                if (delta === 1) {
                    return client.incr(prefixKey(key));
                }
                return client.incrby(prefixKey(key), delta);
            },
            async keys(pattern) {
                if (!client)
                    throw new Error('Cache client not initialized');
                const keys = await client.keys(prefixKey(pattern));
                return keys.map(unprefixKey);
            },
            async scanKeys(pattern, options) {
                if (!client)
                    throw new Error('Cache client not initialized');
                const results = [];
                const stream = client.scanStream({
                    match: prefixKey(pattern),
                    count: options?.count ?? 100,
                });
                return new Promise((resolve, reject) => {
                    stream.on('data', (keys) => {
                        for (const key of keys) {
                            results.push(unprefixKey(key));
                        }
                    });
                    stream.on('end', () => resolve(results));
                    stream.on('error', (err) => reject(err));
                });
            },
            async flush() {
                if (!client)
                    throw new Error('Cache client not initialized');
                if (!prefix) {
                    // Without prefix, this would flush the entire database - dangerous!
                    throw new Error('Cannot flush without a keyPrefix configured');
                }
                const keys = await client.keys(`${prefix}*`);
                if (keys.length === 0)
                    return 0;
                return client.del(...keys);
            },
            async getStats() {
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
                }
                catch {
                    return {
                        connected: client.status === 'ready',
                        keyCount: 0,
                    };
                }
            },
            getClient() {
                if (!client)
                    throw new Error('Cache client not initialized');
                return client;
            },
            async close() {
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
        name: `Redis Cache (${instanceName})`,
        version: '1.0.0',
        async onStart(_pluginConfig, registry) {
            const logger = registry.getLogger(pluginId);
            // Create and register the instance
            const instance = await createInstance();
            instances.set(instanceName, instance);
            // Test connection
            try {
                // Ping to verify connection
                await instance.getClient().ping();
                logger.debug(`Cache "${instanceName}" connected`);
            }
            catch (err) {
                logger.error(`Cache "${instanceName}" connection failed: ${err instanceof Error ? err.message : String(err)}`);
                throw err;
            }
            // Register health check if enabled
            if (config.healthCheck !== false) {
                registry.registerHealthCheck({
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
                        }
                        catch (err) {
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
        async onStop() {
            const instance = instances.get(instanceName);
            if (instance) {
                await instance.close();
                instances.delete(instanceName);
            }
        },
    };
}
//# sourceMappingURL=cache-plugin.js.map