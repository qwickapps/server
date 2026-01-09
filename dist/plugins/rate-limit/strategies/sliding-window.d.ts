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
import type { Strategy } from '../types.js';
/**
 * Create the sliding window strategy
 */
export declare function createSlidingWindowStrategy(): Strategy;
//# sourceMappingURL=sliding-window.d.ts.map