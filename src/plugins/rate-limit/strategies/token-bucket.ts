/**
 * Token Bucket Rate Limit Strategy
 *
 * Implements a token bucket algorithm that allows bursts while maintaining
 * a long-term rate limit.
 *
 * How it works:
 * - Bucket starts full with `maxRequests` tokens
 * - Each request consumes 1 token
 * - Tokens refill at a constant rate (maxRequests / windowMs)
 * - If no tokens available, request is rate limited
 *
 * Pros:
 * - Allows short bursts of traffic
 * - Smooth long-term rate limiting
 *
 * Cons:
 * - More complex state management
 * - Can allow more requests than fixed/sliding in short bursts
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
 * Calculate tokens to refill based on time elapsed
 */
function calculateRefill(
  lastRefill: number,
  maxTokens: number,
  refillRatePerMs: number
): { tokens: number; newLastRefill: number } {
  const now = Date.now();
  const elapsed = now - lastRefill;
  const tokensToAdd = elapsed * refillRatePerMs;

  return {
    tokens: Math.min(maxTokens, tokensToAdd),
    newLastRefill: now,
  };
}

/**
 * Create the token bucket strategy
 */
export function createTokenBucketStrategy(): Strategy {
  return {
    name: 'token-bucket',

    async check(
      key: string,
      options: StrategyOptions,
      context: StrategyContext
    ): Promise<LimitStatus> {
      const { maxRequests, windowMs, increment = true } = options;
      const { store, cache, userId, tenantId, ipAddress } = context;

      const now = Date.now();
      // Refill rate: how many tokens per millisecond
      const refillRatePerMs = maxRequests / windowMs;

      // Try cache first
      let cached = await cache.get(key);
      let tokensRemaining = maxRequests; // Start with full bucket
      let lastRefill = now;

      if (cached && cached.tokensRemaining !== undefined && cached.lastRefill !== undefined) {
        // Cache hit - calculate current tokens with refill
        const refill = calculateRefill(cached.lastRefill, maxRequests, refillRatePerMs);
        tokensRemaining = Math.min(maxRequests, (cached.tokensRemaining || 0) + refill.tokens);
        lastRefill = refill.newLastRefill;
      } else {
        // Cache miss - check store
        const stored = await store.get(key, userId);
        if (stored && stored.tokensRemaining !== undefined && stored.lastRefill) {
          const refill = calculateRefill(
            stored.lastRefill.getTime(),
            maxRequests,
            refillRatePerMs
          );
          tokensRemaining = Math.min(maxRequests, (stored.tokensRemaining || 0) + refill.tokens);
          lastRefill = refill.newLastRefill;
        }
        // If no stored data, start with full bucket
      }

      // Check if limited (less than 1 full token)
      const limited = tokensRemaining < 1;

      // Calculate when next token will be available
      const timeUntilNextToken = limited ? Math.ceil((1 - tokensRemaining) / refillRatePerMs) : 0;
      const resetAt = Math.ceil((now + timeUntilNextToken) / 1000);
      const retryAfter = Math.max(0, Math.ceil(timeUntilNextToken / 1000));

      // Calculate remaining (floor to show integer tokens)
      const remaining = Math.max(0, Math.floor(tokensRemaining) - (increment && !limited ? 1 : 0));

      // Consume token if requested and not limited
      if (increment && !limited) {
        const newTokens = tokensRemaining - 1;

        // Update store with new token count
        // We use a special increment that sets tokens instead of incrementing count
        const updated = await store.increment(key, {
          maxRequests,
          windowMs,
          strategy: 'token-bucket',
          userId,
          tenantId,
          ipAddress,
          amount: -1, // Signal to set tokens, not increment count
        });

        // Update cache
        const newCached: CachedLimit = {
          count: Math.floor(maxRequests - newTokens), // Count as consumed tokens
          maxRequests,
          windowStart: now,
          windowEnd: now + windowMs,
          strategy: 'token-bucket',
          tokensRemaining: newTokens,
          lastRefill,
        };
        await cache.set(key, newCached, windowMs);

        return {
          limited: false,
          current: Math.floor(maxRequests - newTokens),
          limit: maxRequests,
          remaining: Math.floor(newTokens),
          resetAt,
          retryAfter: 0,
        };
      }

      // Return status without consuming
      return {
        limited,
        current: Math.floor(maxRequests - tokensRemaining),
        limit: maxRequests,
        remaining,
        resetAt,
        retryAfter,
      };
    },
  };
}
