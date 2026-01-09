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
import type { Strategy } from '../types.js';
/**
 * Create the fixed window strategy
 */
export declare function createFixedWindowStrategy(): Strategy;
//# sourceMappingURL=fixed-window.d.ts.map