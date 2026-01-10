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
import type { ApiKeyScope } from '../types.js';
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
export declare function bearerTokenAuth(options?: BearerTokenAuthOptions): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Helper type guard for API key authenticated requests
 */
export declare function isApiKeyAuthenticated(req: Request): req is ApiKeyAuthenticatedRequest;
//# sourceMappingURL=bearer-token-auth.d.ts.map