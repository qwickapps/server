/**
 * Fixed Window Rate Limit Strategy
 *
 * Implements a simple fixed window algorithm where requests are counted
 * within discrete time windows. When a new window starts, the count resets.
 *
 * Pros:
 * - Simple to implement and understand
 * - Low memory overhead
 *
 * Cons:
 * - Burst at boundary: allows 2x requests if timed at window edge
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type {
  Strategy,
  StrategyOptions,
  StrategyContext,
  LimitStatus,
  CachedLimit,
} from '../types.js';

/**
 * Create the fixed window strategy
 */
export function createFixedWindowStrategy(): Strategy {
  return {
    name: 'fixed-window',

    async check(
      key: string,
      options: StrategyOptions,
      context: StrategyContext
    ): Promise<LimitStatus> {
      const { maxRequests, windowMs, increment = true } = options;
      const { store, cache, userId, tenantId, ipAddress } = context;

      const now = Date.now();
      const windowStart = now - (now % windowMs); // Align to window boundary
      const windowEnd = windowStart + windowMs;

      // Try cache first
      let cached = await cache.get(key);
      let currentCount = 0;

      if (cached && cached.windowStart === windowStart) {
        // Cache hit and same window
        currentCount = cached.count;
      } else if (cached && cached.windowEnd <= now) {
        // Window expired - reset count
        currentCount = 0;
      } else {
        // Cache miss - check store
        const stored = await store.get(key, userId);
        if (stored) {
          const storedWindowStart = stored.windowStart.getTime();
          if (storedWindowStart === windowStart) {
            currentCount = stored.count;
          }
          // If different window, count is 0 (new window)
        }
      }

      // Check if limited
      const limited = currentCount >= maxRequests;
      const remaining = Math.max(0, maxRequests - currentCount - (increment && !limited ? 1 : 0));
      const resetAt = Math.ceil(windowEnd / 1000);
      const retryAfter = Math.max(0, Math.ceil((windowEnd - now) / 1000));

      // Increment if requested and not limited
      if (increment && !limited) {
        // Increment in store
        const updated = await store.increment(key, {
          maxRequests,
          windowMs,
          strategy: 'fixed-window',
          userId,
          tenantId,
          ipAddress,
          amount: 1,
        });

        // Update cache
        const newCached: CachedLimit = {
          count: updated.count,
          maxRequests,
          windowStart,
          windowEnd,
          strategy: 'fixed-window',
        };
        await cache.set(key, newCached, windowMs);

        return {
          limited: false,
          current: updated.count,
          limit: maxRequests,
          remaining: Math.max(0, maxRequests - updated.count),
          resetAt,
          retryAfter,
        };
      }

      // Return status without incrementing
      return {
        limited,
        current: currentCount,
        limit: maxRequests,
        remaining,
        resetAt,
        retryAfter,
      };
    },
  };
}
