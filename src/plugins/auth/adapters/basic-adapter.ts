/**
 * Basic Auth Adapter
 *
 * Provides HTTP Basic authentication for simple use cases.
 * Supports both Authorization header and session cookies.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request, Response, RequestHandler } from 'express';
import type { AuthAdapter, AuthenticatedUser, BasicAdapterConfig } from '../types.js';

// Session cookie configuration
const SESSION_COOKIE_NAME = 'cpanel_session';

/**
 * Verify a session token and check expiration
 */
function verifySessionToken(token: string, secret: string): boolean {
  const parts = token.split(':');
  if (parts.length !== 3 || parts[0] !== 'cpanel') {
    return false;
  }

  const [prefix, expiresAt, signature] = parts;
  const payload = `${prefix}:${expiresAt}`;

  // Verify signature
  const expectedSignature = createHmac('sha256', secret).update(payload).digest('hex');
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return false;
    }
  } catch {
    return false;
  }

  // Check expiration
  const expires = parseInt(expiresAt, 10);
  if (isNaN(expires) || Date.now() > expires) {
    return false;
  }

  return true;
}

/**
 * Parse cookies from Cookie header
 */
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name && rest.length > 0) {
      cookies[name] = rest.join('=');
    }
  });

  return cookies;
}

/**
 * Create a Basic authentication adapter
 */
export function basicAdapter(config: BasicAdapterConfig): AuthAdapter {
  const expectedAuth = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`;
  const realm = config.realm || 'Protected';
  const sessionSecret = config.password; // Use password as session secret

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
      // Check for valid session cookie first
      const cookies = parseCookies(req.headers.cookie);
      const sessionToken = cookies[SESSION_COOKIE_NAME];
      if (sessionToken && verifySessionToken(sessionToken, sessionSecret)) {
        return true;
      }

      // Fall back to Authorization header
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
