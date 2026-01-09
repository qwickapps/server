/**
 * Route Guards for @qwickapps/server
 *
 * Provides authentication middleware for protecting routes.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Request, RequestHandler } from 'express';
import type { RouteGuardConfig } from './types.js';
/**
 * Create a route guard middleware from configuration
 */
export declare function createRouteGuard(config: RouteGuardConfig): RequestHandler;
/**
 * Helper to check if a request is authenticated (for use in handlers)
 */
export declare function isAuthenticated(req: Request): boolean;
/**
 * Get the authenticated user from the request
 */
export declare function getAuthenticatedUser(req: Request): any | null;
//# sourceMappingURL=guards.d.ts.map