/**
 * Bearer Token Authentication Middleware
 *
 * Middleware for authenticating API requests using Bearer tokens (API keys).
 * Verifies the token, checks expiration and active status, and attaches
 * the authenticated key info to the request.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response, NextFunction } from 'express';
import type { ApiKey, ApiKeyScope } from '../types.js';
import { getApiKeysStore } from '../api-keys-plugin.js';
import { incrementLimit, isLimited } from '../../rate-limit/rate-limit-service.js';

/**
 * Extended Express Request with API key authentication info
 */
export interface ApiKeyAuthenticatedRequest extends Request {
  apiKey?: {
    id: string;
    user_id: string;
    scopes: ApiKeyScope[];
    key_type: 'm2m' | 'pat';
  };
}

/**
 * Options for bearer token authentication middleware
 */
export interface BearerTokenAuthOptions {
  /** Required scopes (all must be present) */
  requiredScopes?: ApiKeyScope[];
  /** Allow only specific key types */
  allowedKeyTypes?: ('m2m' | 'pat')[];
  /** Custom error handler */
  onUnauthorized?: (req: Request, res: Response, reason: string) => void;
}

/**
 * Extract Bearer token from Authorization header
 *
 * @param req Express request
 * @returns Bearer token or null if not found
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Check for "Bearer <token>" format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Check if API key has all required scopes
 *
 * @param keyScopes Scopes granted to the API key
 * @param requiredScopes Scopes required for the endpoint
 * @returns True if key has all required scopes
 */
function hasRequiredScopes(keyScopes: ApiKeyScope[], requiredScopes: ApiKeyScope[]): boolean {
  return requiredScopes.every(required => keyScopes.includes(required));
}

/**
 * Default unauthorized handler
 */
function defaultUnauthorizedHandler(req: Request, res: Response, reason: string): void {
  res.status(401).json({
    error: 'Unauthorized',
    message: reason,
  });
}

/**
 * Get rate limit identifier for API key authentication
 * Uses IP address as the identifier
 */
function getRateLimitIdentifier(req: Request): string {
  const ip = req.ip ||
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  return `api-key-auth:${ip}`;
}

/**
 * Check if rate limit has been exceeded
 * Uses the existing rate-limit plugin with specific limits for API key auth
 */
async function checkRateLimit(identifier: string): Promise<boolean> {
  try {
    // Check rate limit: 100 requests per 15 minutes
    return await isLimited(identifier, {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000, // 15 minutes
      strategy: 'sliding-window',
    });
  } catch (error) {
    // If rate limit service not available, allow the request
    // (fail open - let other security measures handle it)
    console.warn('[bearerTokenAuth] Rate limit service unavailable:', error);
    return false;
  }
}

/**
 * Record a failed authentication attempt
 * Increments the rate limit counter
 */
async function recordFailedAttempt(identifier: string): Promise<void> {
  try {
    await incrementLimit(identifier, {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000, // 15 minutes
      strategy: 'sliding-window',
    });
  } catch (error) {
    // Non-critical - log and continue
    console.warn('[bearerTokenAuth] Failed to record attempt:', error);
  }
}

/**
 * Bearer Token Authentication Middleware
 *
 * Validates API keys sent as Bearer tokens in the Authorization header.
 * Attaches authenticated key info to the request for downstream handlers.
 *
 * @param options Configuration options
 * @returns Express middleware function
 *
 * @example
 * ```ts
 * import { bearerTokenAuth } from '@qwickapps/server';
 *
 * // Require authentication
 * app.get('/api/data', bearerTokenAuth(), (req, res) => {
 *   const { apiKey } = req as ApiKeyAuthenticatedRequest;
 *   res.json({ user_id: apiKey?.user_id });
 * });
 *
 * // Require specific scopes
 * app.post('/api/data', bearerTokenAuth({
 *   requiredScopes: ['write'],
 * }), (req, res) => {
 *   // Handler code
 * });
 *
 * // Allow only M2M keys
 * app.post('/api/admin', bearerTokenAuth({
 *   allowedKeyTypes: ['m2m'],
 *   requiredScopes: ['admin'],
 * }), (req, res) => {
 *   // Handler code
 * });
 * ```
 */
export function bearerTokenAuth(options: BearerTokenAuthOptions = {}) {
  const {
    requiredScopes = [],
    allowedKeyTypes,
    onUnauthorized = defaultUnauthorizedHandler,
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check rate limit first
      const rateLimitId = getRateLimitIdentifier(req);
      if (await checkRateLimit(rateLimitId)) {
        res.status(429).json({
          error: 'Too Many Requests',
          message: 'Too many authentication attempts. Please try again later.',
        });
        return;
      }

      // Extract token from Authorization header
      const token = extractBearerToken(req);

      if (!token) {
        recordFailedAttempt(rateLimitId);
        onUnauthorized(req, res, 'Missing or invalid Authorization header');
        return;
      }

      // Get store instance
      const store = getApiKeysStore();
      if (!store) {
        console.error('[bearerTokenAuth] API Keys plugin not initialized');
        res.status(500).json({ error: 'Authentication service unavailable' });
        return;
      }

      // Verify the token
      const apiKey = await store.verify(token);

      if (!apiKey) {
        recordFailedAttempt(rateLimitId);
        onUnauthorized(req, res, 'Invalid, expired, or inactive API key');
        return;
      }

      // Check key type if restrictions apply
      if (allowedKeyTypes && !allowedKeyTypes.includes(apiKey.key_type)) {
        onUnauthorized(req, res, `This endpoint requires ${allowedKeyTypes.join(' or ')} keys`);
        return;
      }

      // Check scopes if required
      if (requiredScopes.length > 0 && !hasRequiredScopes(apiKey.scopes, requiredScopes)) {
        onUnauthorized(req, res, `Insufficient scopes. Required: ${requiredScopes.join(', ')}`);
        return;
      }

      // Record usage (non-blocking)
      store.recordUsage(apiKey.id).catch(err => {
        console.error('[bearerTokenAuth] Failed to record key usage:', err);
      });

      // Attach authenticated key info to request
      (req as ApiKeyAuthenticatedRequest).apiKey = {
        id: apiKey.id,
        user_id: apiKey.user_id,
        scopes: apiKey.scopes,
        key_type: apiKey.key_type,
      };

      next();
    } catch (error) {
      console.error('[bearerTokenAuth] Authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  };
}

/**
 * Helper type guard for API key authenticated requests
 */
export function isApiKeyAuthenticated(req: Request): req is ApiKeyAuthenticatedRequest {
  return 'apiKey' in req && (req as ApiKeyAuthenticatedRequest).apiKey !== undefined;
}
