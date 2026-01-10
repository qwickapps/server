/**
 * Auth Plugin
 *
 * Pluggable authentication plugin for @qwickapps/server.
 * Supports multiple adapters (Auth0, Supabase, Basic) with fallback chain.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Request, RequestHandler } from 'express';
import type { Plugin } from '../../core/plugin-registry.js';
import type { AuthPluginConfig, AuthenticatedUser } from './types.js';
/**
 * Create the Auth plugin
 */
export declare function createAuthPlugin(config: AuthPluginConfig): Plugin;
/**
 * Check if the current request is authenticated
 */
export declare function isAuthenticated(req: Request): boolean;
/**
 * Get the authenticated user from the request
 */
export declare function getAuthenticatedUser(req: Request): AuthenticatedUser | null;
/**
 * Get the access token from the request
 */
export declare function getAccessToken(req: Request): string | null;
/**
 * Middleware to require authentication
 */
export declare function requireAuth(): RequestHandler;
/**
 * Middleware to require specific roles
 */
export declare function requireRoles(...roles: string[]): RequestHandler;
/**
 * Middleware to require any of the specified roles
 */
export declare function requireAnyRole(...roles: string[]): RequestHandler;
//# sourceMappingURL=auth-plugin.d.ts.map