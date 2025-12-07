/**
 * Route Guards for @qwickapps/server
 *
 * Provides authentication middleware for protecting routes.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type {
  RouteGuardConfig,
  BasicAuthGuardConfig,
  SupabaseAuthGuardConfig,
  Auth0GuardConfig,
} from './types.js';

/**
 * Create a route guard middleware from configuration
 */
export function createRouteGuard(config: RouteGuardConfig): RequestHandler {
  switch (config.type) {
    case 'none':
      return (_req, _res, next) => next();
    case 'basic':
      return createBasicAuthGuard(config);
    case 'supabase':
      return createSupabaseGuard(config);
    case 'auth0':
      return createAuth0Guard(config);
    default:
      throw new Error(`Unknown guard type: ${(config as any).type}`);
  }
}

/**
 * Create basic auth guard middleware
 */
function createBasicAuthGuard(config: BasicAuthGuardConfig): RequestHandler {
  const expectedAuth = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`;
  const realm = config.realm || 'Protected';
  const excludePaths = config.excludePaths || [];

  return (req: Request, res: Response, next: NextFunction) => {
    // Check if path is excluded
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (authHeader === expectedAuth) {
      return next();
    }

    res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required.',
    });
  };
}

/**
 * Create Supabase auth guard middleware
 *
 * Validates JWT tokens from Supabase Auth
 */
function createSupabaseGuard(config: SupabaseAuthGuardConfig): RequestHandler {
  const excludePaths = config.excludePaths || [];

  return async (req: Request, res: Response, next: NextFunction) => {
    // Check if path is excluded
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header. Expected: Bearer <token>',
      });
    }

    const token = authHeader.substring(7);

    try {
      // Validate the JWT with Supabase
      const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: config.supabaseAnonKey,
        },
      });

      if (!response.ok) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token.',
        });
      }

      const user = await response.json();
      (req as any).user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Failed to validate token.',
      });
    }
  };
}

/**
 * Create Auth0 guard middleware
 *
 * Uses express-openid-connect for Auth0 authentication
 */
function createAuth0Guard(config: Auth0GuardConfig): RequestHandler {
  // Lazy-load express-openid-connect to avoid requiring it when not used
  let authMiddleware: RequestHandler | null = null;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Lazy initialize the middleware
    if (!authMiddleware) {
      try {
        const { auth } = await import('express-openid-connect');
        authMiddleware = auth({
          authRequired: true,
          auth0Logout: true,
          secret: config.secret,
          baseURL: config.baseUrl,
          clientID: config.clientId,
          issuerBaseURL: `https://${config.domain}`,
          clientSecret: config.clientSecret,
          idpLogout: true,
          routes: {
            login: config.routes?.login || '/login',
            logout: config.routes?.logout || '/logout',
            callback: config.routes?.callback || '/callback',
          },
        });
      } catch (error) {
        return res.status(500).json({
          error: 'Configuration Error',
          message: 'Auth0 is not properly configured. Install express-openid-connect package.',
        });
      }
    }

    // Check if path is excluded
    const excludePaths = config.excludePaths || [];
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Apply Auth0 middleware
    authMiddleware!(req, res, next);
  };
}

/**
 * Helper to check if a request is authenticated (for use in handlers)
 */
export function isAuthenticated(req: Request): boolean {
  // Check for Auth0 session
  if ((req as any).oidc?.isAuthenticated?.()) {
    return true;
  }
  // Check for Supabase user
  if ((req as any).user) {
    return true;
  }
  return false;
}

/**
 * Get the authenticated user from the request
 */
export function getAuthenticatedUser(req: Request): any | null {
  // Check for Auth0 user
  if ((req as any).oidc?.user) {
    return (req as any).oidc.user;
  }
  // Check for Supabase user
  if ((req as any).user) {
    return (req as any).user;
  }
  return null;
}
