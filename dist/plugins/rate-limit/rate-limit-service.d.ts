/**
 * Rate Limit Service
 *
 * Core service that coordinates between cache and store,
 * selects strategies, and provides the programmatic API.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { RateLimitStore, RateLimitCache, RateLimitStrategy, LimitStatus, CheckLimitOptions } from './types.js';
/**
 * Service configuration
 */
export interface RateLimitServiceConfig {
    store: RateLimitStore;
    cache: RateLimitCache;
    defaults?: {
        windowMs?: number;
        maxRequests?: number;
        strategy?: RateLimitStrategy;
    };
}
/**
 * Rate Limit Service
 *
 * Provides the core rate limiting functionality with caching.
 */
export declare class RateLimitService {
    private store;
    private cache;
    private defaults;
    constructor(config: RateLimitServiceConfig);
    /**
     * Check if a key is rate limited
     */
    isLimited(key: string, options?: CheckLimitOptions): Promise<boolean>;
    /**
     * Check rate limit status without incrementing
     */
    checkLimit(key: string, options?: CheckLimitOptions): Promise<LimitStatus>;
    /**
     * Increment the rate limit counter and return status
     */
    incrementLimit(key: string, options?: CheckLimitOptions): Promise<LimitStatus>;
    /**
     * Get remaining requests for a key
     */
    getRemainingRequests(key: string, options?: CheckLimitOptions): Promise<number>;
    /**
     * Get full limit status for a key
     */
    getLimitStatus(key: string, options?: CheckLimitOptions): Promise<LimitStatus>;
    /**
     * Clear a rate limit (e.g., after successful CAPTCHA)
     */
    clearLimit(key: string, userId?: string): Promise<void>;
    /**
     * Get the current defaults
     */
    getDefaults(): {
        windowMs: number;
        maxRequests: number;
        strategy: RateLimitStrategy;
    };
    /**
     * Update the default settings at runtime
     */
    setDefaults(updates: Partial<{
        windowMs: number;
        maxRequests: number;
        strategy: RateLimitStrategy;
    }>): void;
    /**
     * Run cleanup of expired limits
     */
    cleanup(): Promise<number>;
}
/**
 * Set the current rate limit service instance
 * (Called by the plugin on startup)
 */
export declare function setRateLimitService(service: RateLimitService | null): void;
/**
 * Get the current rate limit service instance
 */
export declare function getRateLimitService(): RateLimitService;
/**
 * Check if a key is currently rate limited
 */
export declare function isLimited(key: string, options?: CheckLimitOptions): Promise<boolean>;
/**
 * Check rate limit status without incrementing counter
 */
export declare function checkLimit(key: string, options?: CheckLimitOptions): Promise<LimitStatus>;
/**
 * Increment the rate limit counter and return status
 */
export declare function incrementLimit(key: string, options?: CheckLimitOptions): Promise<LimitStatus>;
/**
 * Get remaining requests for a key
 */
export declare function getRemainingRequests(key: string, options?: CheckLimitOptions): Promise<number>;
/**
 * Get full limit status for a key
 */
export declare function getLimitStatus(key: string, options?: CheckLimitOptions): Promise<LimitStatus>;
/**
 * Clear a rate limit (e.g., after successful CAPTCHA)
 */
export declare function clearLimit(key: string, userId?: string): Promise<void>;
//# sourceMappingURL=rate-limit-service.d.ts.map