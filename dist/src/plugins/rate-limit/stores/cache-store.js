/**
 * Rate Limit Cache Store
 *
 * Provides a caching layer for rate limits using either Redis (via cache plugin)
 * or an in-memory fallback with LRU eviction.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { hasCache, getCache } from '../../cache-plugin.js';
/**
 * Simple LRU Cache implementation for in-memory fallback
 */
class LRUCache {
    constructor(maxSize) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
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
    set(key, value, ttlMs) {
        // Remove oldest entries if at capacity
        while (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
            else {
                break;
            }
        }
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
        });
    }
    delete(key) {
        return this.cache.delete(key);
    }
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (entry.expiresAt <= Date.now()) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
}
/**
 * Create a Redis-based cache (uses existing cache plugin)
 */
function createRedisCache(config) {
    const instanceName = config.redisInstance || 'default';
    const keyPrefix = config.keyPrefix || 'ratelimit:';
    const defaultTtlMs = config.defaultTtlMs || 60000;
    const prefixKey = (key) => `${keyPrefix}${key}`;
    return {
        name: 'redis',
        async get(key) {
            if (!hasCache(instanceName))
                return null;
            try {
                const cache = getCache(instanceName);
                const value = await cache.get(prefixKey(key));
                return value;
            }
            catch {
                return null;
            }
        },
        async set(key, value, ttlMs) {
            if (!hasCache(instanceName))
                return;
            try {
                const cache = getCache(instanceName);
                const ttlSeconds = Math.ceil((ttlMs || defaultTtlMs) / 1000);
                await cache.set(prefixKey(key), value, ttlSeconds);
            }
            catch {
                // Ignore cache errors - we'll fall back to store
            }
        },
        async increment(key, amount = 1) {
            if (!hasCache(instanceName))
                return null;
            try {
                const cache = getCache(instanceName);
                // Get current value and increment
                const current = await cache.get(prefixKey(key));
                if (current) {
                    current.count += amount;
                    const ttlSeconds = Math.ceil((current.windowEnd - Date.now()) / 1000);
                    if (ttlSeconds > 0) {
                        await cache.set(prefixKey(key), current, ttlSeconds);
                    }
                    return current.count;
                }
                return null;
            }
            catch {
                return null;
            }
        },
        async delete(key) {
            if (!hasCache(instanceName))
                return false;
            try {
                const cache = getCache(instanceName);
                return cache.delete(prefixKey(key));
            }
            catch {
                return false;
            }
        },
        isAvailable() {
            return hasCache(instanceName);
        },
        async shutdown() {
            // Redis cache is managed by cache plugin
        },
    };
}
/**
 * Create an in-memory cache with LRU eviction
 */
function createMemoryCache(config) {
    const maxEntries = config.maxMemoryEntries || 10000;
    const keyPrefix = config.keyPrefix || 'ratelimit:';
    const defaultTtlMs = config.defaultTtlMs || 60000;
    const lru = new LRUCache(maxEntries);
    const prefixKey = (key) => `${keyPrefix}${key}`;
    return {
        name: 'memory',
        async get(key) {
            return lru.get(prefixKey(key));
        },
        async set(key, value, ttlMs) {
            lru.set(prefixKey(key), value, ttlMs || defaultTtlMs);
        },
        async increment(key, amount = 1) {
            const current = lru.get(prefixKey(key));
            if (current) {
                current.count += amount;
                const ttlMs = current.windowEnd - Date.now();
                if (ttlMs > 0) {
                    lru.set(prefixKey(key), current, ttlMs);
                }
                return current.count;
            }
            return null;
        },
        async delete(key) {
            return lru.delete(prefixKey(key));
        },
        isAvailable() {
            return true; // Memory cache is always available
        },
        async shutdown() {
            // Nothing to do for memory cache
        },
    };
}
/**
 * Create a rate limit cache based on configuration
 *
 * @param config Cache configuration
 * @returns RateLimitCache implementation
 *
 * @example
 * ```ts
 * // Auto-detect (Redis if available, memory fallback)
 * const cache = createRateLimitCache({ type: 'auto' });
 *
 * // Force Redis
 * const redisCache = createRateLimitCache({ type: 'redis', redisInstance: 'default' });
 *
 * // Force in-memory
 * const memoryCache = createRateLimitCache({ type: 'memory', maxMemoryEntries: 5000 });
 * ```
 */
export function createRateLimitCache(config = {}) {
    const cacheType = config.type || 'auto';
    if (cacheType === 'redis') {
        return createRedisCache(config);
    }
    if (cacheType === 'memory') {
        return createMemoryCache(config);
    }
    // Auto: Use Redis if available, fall back to memory
    const redisCache = createRedisCache(config);
    if (redisCache.isAvailable()) {
        return redisCache;
    }
    console.warn('[RateLimitCache] Redis not available, using in-memory cache. ' +
        'Rate limits will not sync across server instances.');
    return createMemoryCache(config);
}
/**
 * Create a no-op cache (for testing or when caching is disabled)
 */
export function createNoOpCache() {
    return {
        name: 'noop',
        async get() { return null; },
        async set() { },
        async increment() { return null; },
        async delete() { return false; },
        isAvailable() { return false; },
        async shutdown() { },
    };
}
//# sourceMappingURL=cache-store.js.map