/**
 * Rate Limit Strategies
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

export { createSlidingWindowStrategy } from './sliding-window.js';
export { createFixedWindowStrategy } from './fixed-window.js';
export { createTokenBucketStrategy } from './token-bucket.js';

import type { Strategy, RateLimitStrategy } from '../types.js';
import { createSlidingWindowStrategy } from './sliding-window.js';
import { createFixedWindowStrategy } from './fixed-window.js';
import { createTokenBucketStrategy } from './token-bucket.js';

/**
 * Get a strategy by name
 */
export function getStrategy(name: RateLimitStrategy): Strategy {
  switch (name) {
    case 'sliding-window':
      return createSlidingWindowStrategy();
    case 'fixed-window':
      return createFixedWindowStrategy();
    case 'token-bucket':
      return createTokenBucketStrategy();
    default:
      throw new Error(`Unknown rate limit strategy: ${name}`);
  }
}
