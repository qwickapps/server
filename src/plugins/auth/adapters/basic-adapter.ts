/**
 * Basic Auth Adapter
 *
 * Provides HTTP Basic authentication for simple use cases.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response, RequestHandler } from 'express';
import type { AuthAdapter, AuthenticatedUser, BasicAdapterConfig } from '../types.js';

/**
 * Create a Basic authentication adapter
 */
export function basicAdapter(config: BasicAdapterConfig): AuthAdapter {
  const expectedAuth = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`;
  const realm = config.realm || 'Protected';

  // Create a static user for basic auth
  const staticUser: AuthenticatedUser = {
    id: 'basic-auth-user',
    email: `${config.username}@localhost`,
    name: config.username,
    roles: ['admin'], // Basic auth users typically have full access
  };

  return {
    name: 'basic',

    initialize(): RequestHandler {
      // Basic auth doesn't need initialization middleware
      // Just return a pass-through middleware
      return (_req, _res, next) => next();
    },

    isAuthenticated(req: Request): boolean {
      const authHeader = req.headers.authorization;
      return authHeader === expectedAuth;
    },

    getUser(req: Request): AuthenticatedUser | null {
      if (!this.isAuthenticated(req)) {
        return null;
      }
      return staticUser;
    },

    hasRoles(_req: Request, roles: string[]): boolean {
      // Basic auth user has 'admin' role
      return roles.every((role) => staticUser.roles?.includes(role));
    },

    onUnauthorized(_req: Request, res: Response): void {
      res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
    },
  };
}
