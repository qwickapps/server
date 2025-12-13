/**
 * Supabase Auth Adapter
 *
 * Provides Supabase authentication using JWT validation.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response, RequestHandler } from 'express';
import type { AuthAdapter, AuthenticatedUser, SupabaseAdapterConfig } from '../types.js';

/**
 * Create a Supabase authentication adapter
 */
export function supabaseAdapter(config: SupabaseAdapterConfig): AuthAdapter {
  // Cache for validated users (short TTL to avoid stale data)
  const userCache = new Map<string, { user: AuthenticatedUser; expires: number }>();
  const CACHE_TTL = 60 * 1000; // 1 minute

  return {
    name: 'supabase',

    initialize(): RequestHandler {
      // Supabase validation happens per-request, no initialization needed
      return (_req, _res, next) => next();
    },

    isAuthenticated(req: Request): boolean {
      // Check if we already validated this request
      if ((req as any)._supabaseUser) {
        return true;
      }

      const authHeader = req.headers.authorization;
      return !!authHeader && authHeader.startsWith('Bearer ');
    },

    async getUser(req: Request): Promise<AuthenticatedUser | null> {
      // Return cached user if available
      if ((req as any)._supabaseUser) {
        return (req as any)._supabaseUser;
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }

      const token = authHeader.substring(7);

      // Check token cache
      const cached = userCache.get(token);
      if (cached && cached.expires > Date.now()) {
        (req as any)._supabaseUser = cached.user;
        return cached.user;
      }

      try {
        // Validate the JWT with Supabase
        const response = await fetch(`${config.url}/auth/v1/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: config.anonKey,
          },
        });

        if (!response.ok) {
          return null;
        }

        const supabaseUser = (await response.json()) as {
          id: string;
          email: string;
          email_confirmed_at?: string;
          user_metadata?: {
            full_name?: string;
            name?: string;
            avatar_url?: string;
          };
          app_metadata?: {
            roles?: string[];
          };
        };

        const user: AuthenticatedUser = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
          picture: supabaseUser.user_metadata?.avatar_url,
          emailVerified: !!supabaseUser.email_confirmed_at,
          roles: supabaseUser.app_metadata?.roles || [],
          raw: supabaseUser,
        };

        // Cache the validated user
        userCache.set(token, { user, expires: Date.now() + CACHE_TTL });
        (req as any)._supabaseUser = user;

        // Cleanup old cache entries periodically
        if (userCache.size > 1000) {
          const now = Date.now();
          for (const [key, value] of userCache) {
            if (value.expires < now) {
              userCache.delete(key);
            }
          }
        }

        return user;
      } catch (error) {
        console.error('[SupabaseAdapter] Token validation error:', error);
        return null;
      }
    },

    hasRoles(req: Request, roles: string[]): boolean {
      const user = (req as any)._supabaseUser as AuthenticatedUser | undefined;
      if (!user?.roles) return false;
      return roles.every((role) => user.roles?.includes(role));
    },

    getAccessToken(req: Request): string | null {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }
      return authHeader.substring(7);
    },

    onUnauthorized(_req: Request, res: Response): void {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header. Expected: Bearer <token>',
      });
    },

    async shutdown(): Promise<void> {
      userCache.clear();
    },
  };
}
