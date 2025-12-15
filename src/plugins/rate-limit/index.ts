/**
 * Rate Limit Plugin
 *
 * Provides rate limiting capabilities for @qwickapps/server.
 *
 * ## Features
 * - Multiple strategies: sliding window, fixed window, token bucket
 * - PostgreSQL persistence with RLS for multi-tenant isolation
 * - Redis caching with in-memory fallback
 * - Express middleware for automatic enforcement
 * - Programmatic API for custom rate limiting
 * - Auto-cleanup of expired limits
 *
 * ## Usage
 *
 * ```typescript
 * import {
 *   createGateway,
 *   createRateLimitPlugin,
 *   postgresRateLimitStore,
 *   rateLimitMiddleware,
 *   isLimited,
 *   clearLimit,
 *   getPostgres,
 * } from '@qwickapps/server';
 *
 * // Create the gateway with rate limit plugin
 * const gateway = createGateway({
 *   plugins: [
 *     createRateLimitPlugin({
 *       store: postgresRateLimitStore({
 *         pool: () => getPostgres().getPool(),
 *       }),
 *       defaults: {
 *         windowMs: 60000,    // 1 minute
 *         maxRequests: 100,   // 100 requests per window
 *         strategy: 'sliding-window',
 *       },
 *     }),
 *   ],
 * });
 *
 * // Use middleware
 * app.use('/api', rateLimitMiddleware());
 *
 * // Per-route configuration
 * app.post('/api/chat', rateLimitMiddleware({
 *   windowMs: 60000,
 *   max: 50,
 *   keyGenerator: (req) => `chat:${req.user.id}`,
 * }));
 *
 * // Programmatic API
 * const limited = await isLimited('user:123:api');
 * if (limited) {
 *   // Handle rate limit
 * }
 *
 * // Clear limit (e.g., after CAPTCHA)
 * await clearLimit('user:123:api');
 * ```
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

// Plugin
export { createRateLimitPlugin } from './rate-limit-plugin.js';
export { createRateLimitPluginFromEnv, getRateLimitConfigStatus } from './env-config.js';
export type { RateLimitEnvPluginOptions } from './env-config.js';

// Stores
export { postgresRateLimitStore } from './stores/postgres-store.js';
export { createRateLimitCache, createNoOpCache } from './stores/cache-store.js';

// Strategies
export {
  createSlidingWindowStrategy,
  createFixedWindowStrategy,
  createTokenBucketStrategy,
  getStrategy,
} from './strategies/index.js';

// Middleware
export { rateLimitMiddleware, rateLimitStatusMiddleware } from './middleware.js';

// Service and programmatic API
export {
  RateLimitService,
  getRateLimitService,
  isLimited,
  checkLimit,
  incrementLimit,
  getRemainingRequests,
  getLimitStatus,
  clearLimit,
} from './rate-limit-service.js';

// Cleanup
export { createCleanupJob } from './cleanup.js';
export type { CleanupJob, CleanupJobConfig } from './cleanup.js';

// Types
export type {
  // Strategy types
  RateLimitStrategy,
  LimitStatus,
  Strategy,
  StrategyOptions,
  StrategyContext,

  // Store types
  StoredLimit,
  IncrementOptions,
  RateLimitStore,
  PostgresRateLimitStoreConfig,

  // Cache types
  CachedLimit,
  RateLimitCache,
  RateLimitCacheConfig,

  // Middleware types
  RateLimitMiddlewareOptions,

  // Plugin types
  RateLimitPluginConfig,
  CheckLimitOptions,
} from './types.js';
