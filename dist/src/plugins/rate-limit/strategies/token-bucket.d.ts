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
import type { Strategy } from '../types.js';
/**
 * Create the token bucket strategy
 */
export declare function createTokenBucketStrategy(): Strategy;
//# sourceMappingURL=token-bucket.d.ts.map