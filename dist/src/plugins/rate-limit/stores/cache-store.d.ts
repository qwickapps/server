/**
 * Rate Limit Cache Store
 *
 * Provides a caching layer for rate limits using either Redis (via cache plugin)
 * or an in-memory fallback with LRU eviction.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { RateLimitCache, RateLimitCacheConfig } from '../types.js';
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
export declare function createRateLimitCache(config?: RateLimitCacheConfig): RateLimitCache;
/**
 * Create a no-op cache (for testing or when caching is disabled)
 */
export declare function createNoOpCache(): RateLimitCache;
//# sourceMappingURL=cache-store.d.ts.map