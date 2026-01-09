/**
 * Rate Limit Middleware
 *
 * Express middleware for automatic rate limiting.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { getRateLimitService } from './rate-limit-service.js';
/**
 * Default key generator
 * Uses user ID if authenticated, otherwise IP address
 */
function defaultKeyGenerator(req) {
    const authReq = req;
    const userId = authReq.auth?.user?.id;
    if (userId) {
        return `user:${userId}`;
    }
    // Fall back to IP address
    const ip = req.ip ||
        req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'unknown';
    return `ip:${ip}`;
}
/**
 * Default handler when rate limit is exceeded
 */
function defaultHandler(_req, res, _next, status) {
    res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${status.retryAfter} seconds.`,
        retryAfter: status.retryAfter,
    });
}
/**
 * Set standard rate limit headers on response
 */
function setRateLimitHeaders(res, status) {
    // Standard rate limit headers (IETF draft)
    res.setHeader('RateLimit-Limit', status.limit.toString());
    res.setHeader('RateLimit-Remaining', status.remaining.toString());
    res.setHeader('RateLimit-Reset', status.resetAt.toString());
    // Retry-After header (RFC 7231)
    if (status.limited) {
        res.setHeader('Retry-After', status.retryAfter.toString());
    }
}
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
export function rateLimitMiddleware(options = {}) {
    const { windowMs, max, keyGenerator = defaultKeyGenerator, skip, handler = defaultHandler, strategy, headers = true, keyPrefix = '', } = options;
    return async (req, res, next) => {
        try {
            // Check if should skip
            if (skip) {
                const shouldSkip = await skip(req);
                if (shouldSkip) {
                    next();
                    return;
                }
            }
            // Generate the rate limit key
            let key = await keyGenerator(req);
            if (keyPrefix) {
                key = `${keyPrefix}:${key}`;
            }
            // Resolve max requests (can be dynamic)
            let maxRequests;
            if (typeof max === 'function') {
                maxRequests = await max(req);
            }
            else {
                maxRequests = max;
            }
            // Get the rate limit service
            const service = getRateLimitService();
            // Check and increment the rate limit
            const status = await service.incrementLimit(key, {
                windowMs,
                maxRequests,
                strategy,
            });
            // Set headers if enabled
            if (headers) {
                setRateLimitHeaders(res, status);
            }
            // If rate limited, call handler
            if (status.limited) {
                handler(req, res, next, status);
                return;
            }
            // Continue to next middleware
            next();
        }
        catch (error) {
            // On error, log and allow request (fail open)
            console.error('[RateLimitMiddleware] Error:', error);
            next();
        }
    };
}
/**
 * Create a rate limit middleware that only checks without incrementing
 * Useful for displaying rate limit status without counting the request
 */
export function rateLimitStatusMiddleware(options = {}) {
    const { windowMs, max, keyGenerator = defaultKeyGenerator, strategy, headers = true, keyPrefix = '', } = options;
    return async (req, res, next) => {
        try {
            // Generate the rate limit key
            let key = await keyGenerator(req);
            if (keyPrefix) {
                key = `${keyPrefix}:${key}`;
            }
            // Resolve max requests (can be dynamic)
            let maxRequests;
            if (typeof max === 'function') {
                maxRequests = await max(req);
            }
            else {
                maxRequests = max;
            }
            // Get the rate limit service
            const service = getRateLimitService();
            // Check without incrementing
            const status = await service.checkLimit(key, {
                windowMs,
                maxRequests,
                strategy,
                increment: false,
            });
            // Set headers if enabled
            if (headers) {
                setRateLimitHeaders(res, status);
            }
            // Always continue (this middleware doesn't block)
            next();
        }
        catch (error) {
            // On error, log and continue
            console.error('[RateLimitStatusMiddleware] Error:', error);
            next();
        }
    };
}
//# sourceMappingURL=middleware.js.map