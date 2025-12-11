/**
 * Auth0 Adapter
 *
 * Provides Auth0 authentication using express-openid-connect.
 * Enhanced with RBAC support, domain whitelisting, and token exposure.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response, RequestHandler } from 'express';
import type { AuthAdapter, AuthenticatedUser, Auth0AdapterConfig } from '../types.js';

/**
 * Extract user roles from Auth0 claims
 */
function extractUserRoles(req: Request, domain: string): string[] {
  const oidc = (req as any).oidc;
  const user = oidc?.user;

  if (!user) return [];

  // Check various common locations for roles
  const roles: string[] = [];

  // Standard RBAC claim
  if (Array.isArray(user['https://roles'])) {
    roles.push(...user['https://roles']);
  }

  // Namespaced roles (common pattern)
  const namespace = domain ? `https://${domain}/` : '';
  if (namespace && Array.isArray(user[`${namespace}roles`])) {
    roles.push(...user[`${namespace}roles`]);
  }

  // Auth0 authorization extension
  if (Array.isArray(user.roles)) {
    roles.push(...user.roles);
  }

  // Custom claims
  if (Array.isArray(user['custom:roles'])) {
    roles.push(...user['custom:roles']);
  }

  return [...new Set(roles)]; // Deduplicate
}

/**
 * Create an Auth0 authentication adapter
 */
export function auth0Adapter(config: Auth0AdapterConfig): AuthAdapter {
  let authMiddleware: RequestHandler | null = null;
  let initializationError: Error | null = null;

  const adapter: AuthAdapter = {
    name: 'auth0',

    initialize(): RequestHandler {
      // Return a middleware that lazily initializes Auth0
      return async (req: Request, res: Response, next) => {
        // Skip if already initialized with error
        if (initializationError) {
          return res.status(500).json({
            error: 'Auth Configuration Error',
            message: 'Auth0 is not properly configured.',
          });
        }

        // Lazy initialize the Auth0 middleware
        if (!authMiddleware) {
          try {
            const { auth } = await import('express-openid-connect');

            const authConfig: Record<string, unknown> = {
              authRequired: false, // We handle auth requirement ourselves
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
            };

            // Add audience if specified (for API access tokens)
            if (config.audience) {
              authConfig.authorizationParams = {
                audience: config.audience,
                scope: (config.scopes || ['openid', 'profile', 'email']).join(' '),
              };
            }

            // Enable access token fetching if needed
            if (config.exposeAccessToken && config.audience) {
              authConfig.afterCallback = (
                _req: Request,
                _res: Response,
                session: Record<string, unknown>
              ) => {
                // Access token is automatically stored in session
                return session;
              };
            }

            authMiddleware = auth(authConfig);
          } catch (error) {
            initializationError =
              error instanceof Error ? error : new Error('Failed to initialize Auth0');
            console.error('[Auth0Adapter] Initialization error:', error);
            return res.status(500).json({
              error: 'Auth Configuration Error',
              message:
                'Auth0 is not properly configured. Install express-openid-connect package.',
            });
          }
        }

        // Apply the Auth0 middleware
        authMiddleware!(req, res, next);
      };
    },

    isAuthenticated(req: Request): boolean {
      const oidc = (req as any).oidc;
      if (!oidc?.isAuthenticated()) {
        return false;
      }

      // Check domain whitelist if configured
      if (config.allowedDomains && config.allowedDomains.length > 0) {
        const email = oidc.user?.email;
        if (!email) return false;

        const domain = email.split('@')[1];
        if (!config.allowedDomains.includes(domain) && !config.allowedDomains.includes(`@${domain}`)) {
          return false;
        }
      }

      // Check role whitelist if configured
      if (config.allowedRoles && config.allowedRoles.length > 0) {
        const userRoles = extractUserRoles(req, config.domain);
        const hasRole = config.allowedRoles.some((role) => userRoles.includes(role));
        if (!hasRole) {
          return false;
        }
      }

      return true;
    },

    getUser(req: Request): AuthenticatedUser | null {
      const oidc = (req as any).oidc;

      if (!adapter.isAuthenticated(req)) {
        return null;
      }

      const user = oidc.user;
      if (!user) return null;

      return {
        id: user.sub,
        email: user.email,
        name: user.name || user.nickname,
        picture: user.picture,
        emailVerified: user.email_verified,
        roles: extractUserRoles(req, config.domain),
        raw: user,
      };
    },

    hasRoles(req: Request, roles: string[]): boolean {
      const userRoles = extractUserRoles(req, config.domain);
      return roles.every((role) => userRoles.includes(role));
    },

    getAccessToken(req: Request): string | null {
      if (!config.exposeAccessToken) {
        return null;
      }

      const oidc = (req as any).oidc;
      return oidc?.accessToken?.access_token || null;
    },

    onUnauthorized(req: Request, res: Response): void {
      // Check if it's an API request
      const isApiRequest =
        req.headers.accept?.includes('application/json') || req.path.startsWith('/api/');

      if (isApiRequest) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
          loginUrl: config.routes?.login || '/login',
        });
      } else {
        // Redirect to login for browser requests
        const loginPath = config.routes?.login || '/login';
        const returnTo = encodeURIComponent(req.originalUrl);
        res.redirect(`${loginPath}?returnTo=${returnTo}`);
      }
    },
  };

  return adapter;
}
