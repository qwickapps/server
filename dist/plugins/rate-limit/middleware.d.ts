/**
 * Rate Limit Middleware
 *
 * Express middleware for automatic rate limiting.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { RequestHandler } from 'express';
import type { RateLimitMiddlewareOptions } from './types.js';
/**
 * Create rate limit middleware
 *
 * @param options Middleware configuration
 * @returns Express middleware function
 *
 * @example
 * ```ts
 * // Basic usage
 * app.use('/api', rateLimitMiddleware());
 *
 * // Custom configuration
 * app.post('/api/chat', rateLimitMiddleware({
 *   windowMs: 60000,
 *   max: 50,
 *   keyGenerator: (req) => `chat:${req.user.id}`,
 * }));
 *
 * // Tiered limits
 * app.use(rateLimitMiddleware({
 *   max: (req) => req.user?.tier === 'premium' ? 1000 : 50,
 * }));
 * ```
 */
export declare function rateLimitMiddleware(options?: RateLimitMiddlewareOptions): RequestHandler;
/**
 * Create a rate limit middleware that only checks without incrementing
 * Useful for displaying rate limit status without counting the request
 */
export declare function rateLimitStatusMiddleware(options?: RateLimitMiddlewareOptions): RequestHandler;
//# sourceMappingURL=middleware.d.ts.map