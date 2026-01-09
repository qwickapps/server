/**
 * Rate Limit Service
 *
 * Core service that coordinates between cache and store,
 * selects strategies, and provides the programmatic API.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { getStrategy } from './strategies/index.js';
/**
 * Default configuration values
 */
const DEFAULTS = {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    strategy: 'sliding-window',
};
/**
 * Rate Limit Service
 *
 * Provides the core rate limiting functionality with caching.
 */
export class RateLimitService {
    constructor(config) {
        this.store = config.store;
        this.cache = config.cache;
        this.defaults = {
            windowMs: config.defaults?.windowMs ?? DEFAULTS.windowMs,
            maxRequests: config.defaults?.maxRequests ?? DEFAULTS.maxRequests,
            strategy: config.defaults?.strategy ?? DEFAULTS.strategy,
        };
    }
    /**
     * Check if a key is rate limited
     */
    async isLimited(key, options) {
        const status = await this.checkLimit(key, { ...options, increment: false });
        return status.limited;
    }
    /**
     * Check rate limit status without incrementing
     */
    async checkLimit(key, options) {
        const { maxRequests = this.defaults.maxRequests, windowMs = this.defaults.windowMs, strategy: strategyName = this.defaults.strategy, userId, tenantId, ipAddress, increment = false, } = options || {};
        const strategy = getStrategy(strategyName);
        const context = {
            store: this.store,
            cache: this.cache,
            userId,
            tenantId,
            ipAddress,
        };
        return strategy.check(key, { maxRequests, windowMs, increment }, context);
    }
    /**
     * Increment the rate limit counter and return status
     */
    async incrementLimit(key, options) {
        return this.checkLimit(key, { ...options, increment: true });
    }
    /**
     * Get remaining requests for a key
     */
    async getRemainingRequests(key, options) {
        const status = await this.checkLimit(key, { ...options, increment: false });
        return status.remaining;
    }
    /**
     * Get full limit status for a key
     */
    async getLimitStatus(key, options) {
        return this.checkLimit(key, { ...options, increment: false });
    }
    /**
     * Clear a rate limit (e.g., after successful CAPTCHA)
     */
    async clearLimit(key, userId) {
        // Clear from both cache and store
        await Promise.all([
            this.cache.delete(key),
            this.store.clear(key, userId),
        ]);
    }
    /**
     * Get the current defaults
     */
    getDefaults() {
        return { ...this.defaults };
    }
    /**
     * Update the default settings at runtime
     */
    setDefaults(updates) {
        if (updates.windowMs !== undefined && updates.windowMs > 0) {
            this.defaults.windowMs = updates.windowMs;
        }
        if (updates.maxRequests !== undefined && updates.maxRequests > 0) {
            this.defaults.maxRequests = updates.maxRequests;
        }
        if (updates.strategy !== undefined) {
            // Validate strategy
            const validStrategies = ['sliding-window', 'fixed-window', 'token-bucket'];
            if (validStrategies.includes(updates.strategy)) {
                this.defaults.strategy = updates.strategy;
            }
        }
    }
    /**
     * Run cleanup of expired limits
     */
    async cleanup() {
        return this.store.cleanup();
    }
}
// Global service instance for helper functions
let currentService = null;
/**
 * Set the current rate limit service instance
 * (Called by the plugin on startup)
 */
export function setRateLimitService(service) {
    currentService = service;
}
/**
 * Get the current rate limit service instance
 */
export function getRateLimitService() {
    if (!currentService) {
        throw new Error('Rate limit plugin not initialized. Did you register the rate limit plugin?');
    }
    return currentService;
}
// ============================================
// Programmatic API (convenience functions)
// ============================================
/**
 * Check if a key is currently rate limited
 */
export async function isLimited(key, options) {
    return getRateLimitService().isLimited(key, options);
}
/**
 * Check rate limit status without incrementing counter
 */
export async function checkLimit(key, options) {
    return getRateLimitService().checkLimit(key, options);
}
/**
 * Increment the rate limit counter and return status
 */
export async function incrementLimit(key, options) {
    return getRateLimitService().incrementLimit(key, options);
}
/**
 * Get remaining requests for a key
 */
export async function getRemainingRequests(key, options) {
    return getRateLimitService().getRemainingRequests(key, options);
}
/**
 * Get full limit status for a key
 */
export async function getLimitStatus(key, options) {
    return getRateLimitService().getLimitStatus(key, options);
}
/**
 * Clear a rate limit (e.g., after successful CAPTCHA)
 */
export async function clearLimit(key, userId) {
    return getRateLimitService().clearLimit(key, userId);
}
//# sourceMappingURL=rate-limit-service.js.map