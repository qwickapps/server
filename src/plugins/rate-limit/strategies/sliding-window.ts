/**
 * Sliding Window Rate Limit Strategy
 *
 * Implements a sliding window algorithm that provides smooth rate limiting
 * without the "burst at boundary" problem of fixed windows.
 *
 * The algorithm works by:
 * 1. Tracking request timestamps within a sliding window
 * 2. On each request, counting requests in the current window
 * 3. Old requests "slide out" as time passes
 *
 * For performance, we approximate using weighted window counting:
 * - current_window_count + (previous_window_count * overlap_percentage)
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
 * Calculate the sliding window count using weighted approximation
 */
function calculateSlidingCount(
  currentCount: number,
  previousCount: number,
  windowMs: number,
  windowStart: number
): number {
  const now = Date.now();
  const elapsed = now - windowStart;
  const overlap = Math.max(0, windowMs - elapsed) / windowMs;

  // Weighted count: all of current window + portion of previous that overlaps
  return Math.floor(currentCount + previousCount * overlap);
}

/**
 * Create the sliding window strategy
 */
export function createSlidingWindowStrategy(): Strategy {
  return {
    name: 'sliding-window',

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
      let previousCount = 0;

      if (cached && cached.windowEnd > now) {
        // Cache hit and window is still valid
        currentCount = cached.count;

        // For sliding window, we also need previous window's count
        // This is stored in the cache with a special key
        const prevCached = await cache.get(`${key}:prev`);
        if (prevCached) {
          previousCount = prevCached.count;
        }
      } else {
        // Cache miss or expired - check store
        const stored = await store.get(key, userId);
        if (stored && stored.windowEnd.getTime() > now) {
          currentCount = stored.count;
        }
      }

      // Calculate sliding window count
      const slidingCount = calculateSlidingCount(
        currentCount,
        previousCount,
        windowMs,
        windowStart
      );

      // Check if limited
      const limited = slidingCount >= maxRequests;
      const remaining = Math.max(0, maxRequests - slidingCount - (increment && !limited ? 1 : 0));
      const resetAt = Math.ceil(windowEnd / 1000);
      const retryAfter = Math.max(0, Math.ceil((windowEnd - now) / 1000));

      // Increment if requested and not limited
      if (increment && !limited) {
        // Check if we're in a new window - if so, save old count as previous
        if (cached && cached.windowStart !== windowStart && cached.windowStart > 0) {
          // Window rolled over - save old window's data as previous
          const prevCached: CachedLimit = {
            count: cached.count,
            maxRequests,
            windowStart: cached.windowStart,
            windowEnd: cached.windowEnd,
            strategy: 'sliding-window',
          };
          // Save previous window for overlap calculation (keep for 2x window duration)
          await cache.set(`${key}:prev`, prevCached, windowMs * 2);
        }

        // Increment in store
        const updated = await store.increment(key, {
          maxRequests,
          windowMs,
          strategy: 'sliding-window',
          userId,
          tenantId,
          ipAddress,
          amount: 1,
        });

        // Update cache with current window
        const newCached: CachedLimit = {
          count: updated.count,
          maxRequests,
          windowStart,
          windowEnd,
          strategy: 'sliding-window',
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
        current: slidingCount,
        limit: maxRequests,
        remaining,
        resetAt,
        retryAfter,
      };
    },
  };
}
