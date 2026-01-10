/**
 * Rate Limit Strategies
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export { createSlidingWindowStrategy } from './sliding-window.js';
export { createFixedWindowStrategy } from './fixed-window.js';
export { createTokenBucketStrategy } from './token-bucket.js';
import type { Strategy, RateLimitStrategy } from '../types.js';
/**
 * Get a strategy by name
 */
export declare function getStrategy(name: RateLimitStrategy): Strategy;
//# sourceMappingURL=index.d.ts.map