/**
 * Supertokens Auth Adapter
 *
 * Provides Supertokens authentication using EmailPassword and ThirdParty recipes.
 * Supports email/password and social logins (Google, Apple, GitHub).
 *
 * Note: Requires supertokens-node v20+
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response, RequestHandler } from 'express';
import type { AuthAdapter, AuthenticatedUser, SupertokensAdapterConfig } from '../types.js';

// Keys for storing data on the request object
const REQUEST_USER_KEY = '_supertokensUser';
const REQUEST_RES_KEY = '_supertokensRes';
const REQUEST_SESSION_KEY = '_supertokensSession';

// Type for extended request with our custom properties
interface SupertokensExtendedRequest extends Request {
  [REQUEST_USER_KEY]?: AuthenticatedUser;
  [REQUEST_RES_KEY]?: Response;
  [REQUEST_SESSION_KEY]?: unknown;
}

/**
 * Create a Supertokens authentication adapter
 *
 * Uses EmailPassword and ThirdParty recipes (Supertokens v20+)
 */
export function supertokensAdapter(config: SupertokensAdapterConfig): AuthAdapter {
  // Track initialization state
  let initialized = false;
  let initializationError: Error | null = null;

  return {
    name: 'supertokens',

    initialize(): RequestHandler[] {
      // Return middleware that lazily initializes Supertokens
      const initMiddleware: RequestHandler = async (
        req: Request,
        res: Response,
        next: (err?: unknown) => void
      ) => {
        // Store response on request for later use in getUser()
        (req as SupertokensExtendedRequest)[REQUEST_RES_KEY] = res;

        // Skip if already initialized with error
        if (initializationError) {
          return res.status(500).json({
            error: 'Auth Configuration Error',
            message:
              'Supertokens is not properly configured. Install supertokens-node package: npm install supertokens-node',
            details: initializationError.message,
          });
        }

        // Lazy initialize Supertokens
        if (!initialized) {
          try {
            const supertokens = await import('supertokens-node');
            const Session = await import('supertokens-node/recipe/session');
            const EmailPassword = await import('supertokens-node/recipe/emailpassword');
            const ThirdParty = await import('supertokens-node/recipe/thirdparty');

            // Build recipe list - using any[] for Supertokens internal types
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const recipeList: any[] = [];

            // Add EmailPassword recipe if enabled (default: true)
            if (config.enableEmailPassword !== false) {
              recipeList.push(EmailPassword.default.init());
            }

            // Add ThirdParty recipe if any social providers configured
            if (config.socialProviders) {
              // Build provider configurations using Supertokens ProviderInput type
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const providers: any[] = [];

              if (config.socialProviders.google) {
                providers.push({
                  config: {
                    thirdPartyId: 'google',
                    clients: [
                      {
                        clientId: config.socialProviders.google.clientId,
                        clientSecret: config.socialProviders.google.clientSecret,
                      },
                    ],
                  },
                });
              }

              if (config.socialProviders.apple) {
                // Apple requires keyId, teamId, and privateKey in additionalConfig
                providers.push({
                  config: {
                    thirdPartyId: 'apple',
                    clients: [
                      {
                        clientId: config.socialProviders.apple.clientId,
                        clientSecret: config.socialProviders.apple.clientSecret,
                        additionalConfig: {
                          keyId: config.socialProviders.apple.keyId,
                          teamId: config.socialProviders.apple.teamId,
                        },
                      },
                    ],
                  },
                });
              }

              if (config.socialProviders.github) {
                providers.push({
                  config: {
                    thirdPartyId: 'github',
                    clients: [
                      {
                        clientId: config.socialProviders.github.clientId,
                        clientSecret: config.socialProviders.github.clientSecret,
                      },
                    ],
                  },
                });
              }

              if (providers.length > 0) {
                recipeList.push(
                  ThirdParty.default.init({
                    signInAndUpFeature: {
                      providers,
                    },
                  })
                );
              }
            }

            // Always add Session recipe
            recipeList.push(Session.default.init());

            // Initialize Supertokens
            supertokens.default.init({
              framework: 'express',
              supertokens: {
                connectionURI: config.connectionUri,
                apiKey: config.apiKey,
              },
              appInfo: {
                appName: config.appName,
                apiDomain: config.apiDomain,
                websiteDomain: config.websiteDomain,
                apiBasePath: config.apiBasePath ?? '/auth',
                websiteBasePath: config.websiteBasePath ?? '/auth',
              },
              recipeList,
            });

            initialized = true;
          } catch (error) {
            initializationError =
              error instanceof Error ? error : new Error('Failed to initialize Supertokens');
            console.error('[SupertokensAdapter] Initialization error:', error);
            return res.status(500).json({
              error: 'Auth Configuration Error',
              message:
                'Supertokens is not properly configured. Install supertokens-node package: npm install supertokens-node',
              details: initializationError.message,
            });
          }
        }

        next();
      };

      // Supertokens middleware for handling auth routes
      const supertokensMiddleware: RequestHandler = async (req, res, next) => {
        if (!initialized) {
          return next();
        }

        try {
          const { middleware } = await import('supertokens-node/framework/express');
          middleware()(req, res, next);
        } catch {
          next();
        }
      };

      return [initMiddleware, supertokensMiddleware];
    },

    isAuthenticated(req: Request): boolean {
      const extReq = req as SupertokensExtendedRequest;

      // Check if we already validated this request
      if (extReq[REQUEST_USER_KEY]) {
        return true;
      }

      // Check if session was already retrieved
      if (extReq[REQUEST_SESSION_KEY]) {
        return true;
      }

      // For synchronous check, we can only check if session cookies exist
      // Full validation happens in getUser()
      // Supertokens uses cookies, so we check for session tokens
      const cookies = req.cookies || {};
      const accessToken = cookies.sAccessToken;
      const refreshToken = cookies.sRefreshToken;

      // Also check for Authorization header (for API clients)
      const authHeader = req.headers.authorization;
      const hasBearerToken = authHeader?.startsWith('Bearer ');

      return !!(accessToken || refreshToken || hasBearerToken);
    },

    async getUser(req: Request): Promise<AuthenticatedUser | null> {
      const extReq = req as SupertokensExtendedRequest;

      // Return cached user if available
      const cachedUser = extReq[REQUEST_USER_KEY];
      if (cachedUser) {
        return cachedUser;
      }

      if (!initialized) {
        return null;
      }

      // Get response object stored during middleware
      const res = extReq[REQUEST_RES_KEY];
      if (!res) {
        console.error('[SupertokensAdapter] Response object not found on request');
        return null;
      }

      try {
        const Session = await import('supertokens-node/recipe/session');
        const supertokens = await import('supertokens-node');

        // Get session - sessionRequired: false means it won't throw if no session
        const session = await Session.default.getSession(req, res, {
          sessionRequired: false,
        });

        if (!session) {
          return null;
        }

        // Cache session for isAuthenticated check
        extReq[REQUEST_SESSION_KEY] = session;

        const userId = session.getUserId();

        // Get user info from Supertokens
        const userInfo = await supertokens.default.getUser(userId);

        if (!userInfo) {
          return null;
        }

        // Get roles from session access token payload if available
        const accessTokenPayload = session.getAccessTokenPayload();
        const roles: string[] = accessTokenPayload?.roles || [];

        // Map Supertokens user to AuthenticatedUser
        const user: AuthenticatedUser = {
          id: userId,
          email: userInfo.emails?.[0] ?? '',
          name:
            accessTokenPayload?.name ||
            userInfo.thirdParty?.[0]?.userId ||
            userInfo.emails?.[0]?.split('@')[0],
          picture: accessTokenPayload?.picture,
          emailVerified: userInfo.emails?.[0] ? true : false,
          roles,
          raw: {
            ...userInfo,
            sessionHandle: session.getHandle(),
            accessTokenPayload,
          } as Record<string, unknown>,
        };

        // Cache on request object
        extReq[REQUEST_USER_KEY] = user;

        return user;
      } catch (error) {
        console.error('[SupertokensAdapter] Error getting user:', error);
        return null;
      }
    },

    hasRoles(req: Request, roles: string[]): boolean {
      const extReq = req as SupertokensExtendedRequest;
      const user = extReq[REQUEST_USER_KEY];
      if (!user?.roles) return false;
      return roles.every((role) => user.roles?.includes(role));
    },

    getAccessToken(_req: Request): string | null {
      // Supertokens uses session cookies, not access tokens
      // Return null as per the design decision
      return null;
    },

    onUnauthorized(_req: Request, res: Response): void {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please sign in.',
        hint: 'Use the /auth endpoints to authenticate',
      });
    },

    async shutdown(): Promise<void> {
      // Supertokens doesn't require explicit cleanup
      initialized = false;
      initializationError = null;
    },
  };
}
