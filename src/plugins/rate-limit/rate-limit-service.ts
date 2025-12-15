/**
 * Rate Limit Service
 *
 * Core service that coordinates between cache and store,
 * selects strategies, and provides the programmatic API.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type {
  RateLimitStore,
  RateLimitCache,
  RateLimitStrategy,
  LimitStatus,
  CheckLimitOptions,
  StrategyContext,
} from './types.js';
import { getStrategy } from './strategies/index.js';

/**
 * Default configuration values
 */
const DEFAULTS = {
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  strategy: 'sliding-window' as RateLimitStrategy,
};

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
export class RateLimitService {
  private store: RateLimitStore;
  private cache: RateLimitCache;
  private defaults: Required<NonNullable<RateLimitServiceConfig['defaults']>>;

  constructor(config: RateLimitServiceConfig) {
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
  async isLimited(key: string, options?: CheckLimitOptions): Promise<boolean> {
    const status = await this.checkLimit(key, { ...options, increment: false });
    return status.limited;
  }

  /**
   * Check rate limit status without incrementing
   */
  async checkLimit(key: string, options?: CheckLimitOptions): Promise<LimitStatus> {
    const {
      maxRequests = this.defaults.maxRequests,
      windowMs = this.defaults.windowMs,
      strategy: strategyName = this.defaults.strategy,
      userId,
      tenantId,
      ipAddress,
      increment = false,
    } = options || {};

    const strategy = getStrategy(strategyName);
    const context: StrategyContext = {
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
  async incrementLimit(key: string, options?: CheckLimitOptions): Promise<LimitStatus> {
    return this.checkLimit(key, { ...options, increment: true });
  }

  /**
   * Get remaining requests for a key
   */
  async getRemainingRequests(key: string, options?: CheckLimitOptions): Promise<number> {
    const status = await this.checkLimit(key, { ...options, increment: false });
    return status.remaining;
  }

  /**
   * Get full limit status for a key
   */
  async getLimitStatus(key: string, options?: CheckLimitOptions): Promise<LimitStatus> {
    return this.checkLimit(key, { ...options, increment: false });
  }

  /**
   * Clear a rate limit (e.g., after successful CAPTCHA)
   */
  async clearLimit(key: string, userId?: string): Promise<void> {
    // Clear from both cache and store
    await Promise.all([
      this.cache.delete(key),
      this.store.clear(key, userId),
    ]);
  }

  /**
   * Get the current defaults
   */
  getDefaults(): { windowMs: number; maxRequests: number; strategy: RateLimitStrategy } {
    return { ...this.defaults };
  }

  /**
   * Update the default settings at runtime
   */
  setDefaults(updates: Partial<{ windowMs: number; maxRequests: number; strategy: RateLimitStrategy }>): void {
    if (updates.windowMs !== undefined && updates.windowMs > 0) {
      this.defaults.windowMs = updates.windowMs;
    }
    if (updates.maxRequests !== undefined && updates.maxRequests > 0) {
      this.defaults.maxRequests = updates.maxRequests;
    }
    if (updates.strategy !== undefined) {
      // Validate strategy
      const validStrategies: RateLimitStrategy[] = ['sliding-window', 'fixed-window', 'token-bucket'];
      if (validStrategies.includes(updates.strategy)) {
        this.defaults.strategy = updates.strategy;
      }
    }
  }

  /**
   * Run cleanup of expired limits
   */
  async cleanup(): Promise<number> {
    return this.store.cleanup();
  }
}

// Global service instance for helper functions
let currentService: RateLimitService | null = null;

/**
 * Set the current rate limit service instance
 * (Called by the plugin on startup)
 */
export function setRateLimitService(service: RateLimitService | null): void {
  currentService = service;
}

/**
 * Get the current rate limit service instance
 */
export function getRateLimitService(): RateLimitService {
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
export async function isLimited(key: string, options?: CheckLimitOptions): Promise<boolean> {
  return getRateLimitService().isLimited(key, options);
}

/**
 * Check rate limit status without incrementing counter
 */
export async function checkLimit(key: string, options?: CheckLimitOptions): Promise<LimitStatus> {
  return getRateLimitService().checkLimit(key, options);
}

/**
 * Increment the rate limit counter and return status
 */
export async function incrementLimit(key: string, options?: CheckLimitOptions): Promise<LimitStatus> {
  return getRateLimitService().incrementLimit(key, options);
}

/**
 * Get remaining requests for a key
 */
export async function getRemainingRequests(key: string, options?: CheckLimitOptions): Promise<number> {
  return getRateLimitService().getRemainingRequests(key, options);
}

/**
 * Get full limit status for a key
 */
export async function getLimitStatus(key: string, options?: CheckLimitOptions): Promise<LimitStatus> {
  return getRateLimitService().getLimitStatus(key, options);
}

/**
 * Clear a rate limit (e.g., after successful CAPTCHA)
 */
export async function clearLimit(key: string, userId?: string): Promise<void> {
  return getRateLimitService().clearLimit(key, userId);
}
