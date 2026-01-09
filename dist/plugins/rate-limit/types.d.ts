/**
 * Rate Limit Plugin Types
 *
 * Type definitions for the rate limiting plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Request, Response, NextFunction } from 'express';
export type RateLimitStrategy = 'sliding-window' | 'fixed-window' | 'token-bucket';
/**
 * Result from a rate limit check
 */
export interface LimitStatus {
    /** Whether the limit has been exceeded */
    limited: boolean;
    /** Current request count in window */
    current: number;
    /** Maximum requests allowed */
    limit: number;
    /** Remaining requests in window */
    remaining: number;
    /** When the current window resets (Unix timestamp in seconds) */
    resetAt: number;
    /** Seconds until reset (for Retry-After header) */
    retryAfter: number;
}
/**
 * Strategy interface - all strategies must implement this
 */
export interface Strategy {
    name: RateLimitStrategy;
    /**
     * Check if the key is rate limited and optionally increment counter
     */
    check(key: string, options: StrategyOptions, context: StrategyContext): Promise<LimitStatus>;
}
export interface StrategyOptions {
    maxRequests: number;
    windowMs: number;
    /** Whether to increment the counter (default: true) */
    increment?: boolean;
}
export interface StrategyContext {
    store: RateLimitStore;
    cache: RateLimitCache;
    userId?: string;
    tenantId?: string;
    ipAddress?: string;
}
/**
 * Stored rate limit record
 */
export interface StoredLimit {
    id: string;
    key: string;
    count: number;
    maxRequests: number;
    windowMs: number;
    windowStart: Date;
    windowEnd: Date;
    strategy: RateLimitStrategy;
    userId?: string;
    tenantId?: string;
    ipAddress?: string;
    /** Token bucket: remaining tokens */
    tokensRemaining?: number;
    /** Token bucket: last refill time */
    lastRefill?: Date;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Options for incrementing a rate limit
 */
export interface IncrementOptions {
    maxRequests: number;
    windowMs: number;
    strategy: RateLimitStrategy;
    userId?: string;
    tenantId?: string;
    ipAddress?: string;
    /** Amount to increment by (default: 1) */
    amount?: number;
}
/**
 * Rate limit store interface - implementations handle persistence
 */
export interface RateLimitStore {
    /** Store name for logging */
    name: string;
    /** Initialize store (create tables, indexes, RLS) */
    initialize(): Promise<void>;
    /** Get current limit status for a key */
    get(key: string, userId?: string): Promise<StoredLimit | null>;
    /** Increment counter for a key, returns updated record */
    increment(key: string, options: IncrementOptions): Promise<StoredLimit>;
    /** Clear a specific limit */
    clear(key: string, userId?: string): Promise<boolean>;
    /** Clean up expired limits, returns count of deleted records */
    cleanup(): Promise<number>;
    /** Shutdown store */
    shutdown(): Promise<void>;
}
/**
 * PostgreSQL store configuration
 */
export interface PostgresRateLimitStoreConfig {
    /**
     * PostgreSQL pool instance or function that returns one.
     * Use a function for lazy initialization.
     */
    pool: unknown | (() => unknown);
    /** Table name (default: 'rate_limits') */
    tableName?: string;
    /** Schema name (default: 'public') */
    schema?: string;
    /** Auto-create tables on initialize (default: true) */
    autoCreateTables?: boolean;
    /** Enable RLS policies (default: true) */
    enableRLS?: boolean;
}
/**
 * Cached rate limit entry
 */
export interface CachedLimit {
    count: number;
    maxRequests: number;
    windowStart: number;
    windowEnd: number;
    strategy: RateLimitStrategy;
    /** Token bucket specific */
    tokensRemaining?: number;
    lastRefill?: number;
}
/**
 * Rate limit cache interface
 */
export interface RateLimitCache {
    /** Cache name for logging */
    name: string;
    /** Get cached limit for a key */
    get(key: string): Promise<CachedLimit | null>;
    /** Set cached limit with TTL */
    set(key: string, value: CachedLimit, ttlMs: number): Promise<void>;
    /** Atomic increment of count, returns new count */
    increment(key: string, amount?: number): Promise<number | null>;
    /** Delete a cached entry */
    delete(key: string): Promise<boolean>;
    /** Check if cache is available */
    isAvailable(): boolean;
    /** Shutdown cache */
    shutdown(): Promise<void>;
}
/**
 * Cache store configuration
 */
export interface RateLimitCacheConfig {
    /**
     * Cache type:
     * - 'redis': Use Redis via cache plugin
     * - 'memory': Use in-memory cache
     * - 'auto': Use Redis if available, fall back to memory
     */
    type?: 'redis' | 'memory' | 'auto';
    /** Redis cache instance name (default: 'default') */
    redisInstance?: string;
    /** Default TTL in milliseconds (default: 60000) */
    defaultTtlMs?: number;
    /** Max in-memory entries (default: 10000) */
    maxMemoryEntries?: number;
    /** Key prefix for cache entries (default: 'ratelimit:') */
    keyPrefix?: string;
}
/**
 * Express middleware options
 */
export interface RateLimitMiddlewareOptions {
    /** Time window in milliseconds (default: 60000 = 1 min) */
    windowMs?: number;
    /** Max requests per window (static or dynamic) */
    max?: number | ((req: Request) => number | Promise<number>);
    /** Generate the rate limit key from request */
    keyGenerator?: (req: Request) => string | Promise<string>;
    /** Skip rate limiting for certain requests */
    skip?: (req: Request) => boolean | Promise<boolean>;
    /** Custom handler when limit is exceeded */
    handler?: (req: Request, res: Response, next: NextFunction, status: LimitStatus) => void;
    /** Strategy to use (default: 'sliding-window') */
    strategy?: RateLimitStrategy;
    /** Include standard rate limit headers (default: true) */
    headers?: boolean;
    /** Key prefix for this middleware instance */
    keyPrefix?: string;
}
/**
 * Rate limit plugin configuration
 */
export interface RateLimitPluginConfig {
    /**
     * PostgreSQL store configuration (required for persistence)
     */
    store: RateLimitStore;
    /**
     * Default limits applied when not specified per-route
     */
    defaults?: {
        /** Time window in milliseconds (default: 60000 = 1 min) */
        windowMs?: number;
        /** Max requests per window (default: 100) */
        maxRequests?: number;
        /** Strategy to use (default: 'sliding-window') */
        strategy?: RateLimitStrategy;
    };
    /**
     * Cache configuration
     */
    cache?: RateLimitCacheConfig;
    /**
     * Auto-cleanup configuration
     */
    cleanup?: {
        /** Enable auto-cleanup of expired limits (default: true) */
        enabled?: boolean;
        /** Cleanup interval in milliseconds (default: 300000 = 5 min) */
        intervalMs?: number;
    };
    /**
     * API routes configuration
     */
    api?: {
        /** Enable status API endpoints (default: true) */
        enabled?: boolean;
        /** Route prefix (default: '/rate-limit') */
        prefix?: string;
    };
    /**
     * UI configuration
     */
    ui?: {
        /** Enable UI menu item and config page (default: true) */
        enabled?: boolean;
    };
    /** Enable debug logging (default: false) */
    debug?: boolean;
}
/**
 * Options for checking a rate limit programmatically
 */
export interface CheckLimitOptions {
    /** Max requests (uses plugin default if not specified) */
    maxRequests?: number;
    /** Window in milliseconds (uses plugin default if not specified) */
    windowMs?: number;
    /** Strategy (uses plugin default if not specified) */
    strategy?: RateLimitStrategy;
    /** User ID for scoped limits */
    userId?: string;
    /** Tenant ID for scoped limits */
    tenantId?: string;
    /** IP address for scoped limits */
    ipAddress?: string;
    /** Whether to increment counter (default: true) */
    increment?: boolean;
}
//# sourceMappingURL=types.d.ts.map