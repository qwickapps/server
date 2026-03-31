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
// Keys for storing data on the request object
const REQUEST_USER_KEY = '_supertokensUser';
const REQUEST_RES_KEY = '_supertokensRes';
const REQUEST_SESSION_KEY = '_supertokensSession';
/**
 * Create a Supertokens authentication adapter
 *
 * Uses EmailPassword and ThirdParty recipes (Supertokens v20+)
 */
export function supertokensAdapter(config) {
    // Track initialization state
    let initialized = false;
    let initializationError = null;
    return {
        name: 'supertokens',
        initialize() {
            // Return middleware that lazily initializes Supertokens
            const initMiddleware = async (req, res, next) => {
                // Store response on request for later use in getUser()
                req[REQUEST_RES_KEY] = res;
                // Skip if already initialized with error — let auth-checking middleware
                // decide whether to block the request based on authRequired config.
                // Returning 500 here blocks ALL routes (including /auth/config/status)
                // even when authRequired is false.
                if (initializationError) {
                    return next();
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
                        const recipeList = [];
                        // Add EmailPassword recipe if enabled (default: true)
                        if (config.enableEmailPassword !== false) {
                            recipeList.push(EmailPassword.default.init());
                        }
                        // Add Passwordless (magic link) recipe if enabled
                        if (config.enablePasswordless) {
                            const Passwordless = await import('supertokens-node/recipe/passwordless');
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const passwordlessConfig = {
                                contactMethod: 'EMAIL',
                                flowType: 'MAGIC_LINK',
                            };
                            // Override email delivery with Resend if API key is provided
                            if (config.resendApiKey) {
                                const resendApiKey = config.resendApiKey;
                                const fromEmail = config.resendFromEmail || 'noreply@faabzi.com';
                                const appName = config.appName;
                                passwordlessConfig.emailDelivery = {
                                    service: {
                                        sendEmail: async ({ email, urlWithLinkCode }) => {
                                            try {
                                                await fetch('https://api.resend.com/emails', {
                                                    method: 'POST',
                                                    headers: {
                                                        Authorization: `Bearer ${resendApiKey}`,
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        from: fromEmail,
                                                        to: email,
                                                        subject: `Sign in to ${appName}`,
                                                        html: `<p>Click the link below to sign in to ${appName}.</p><p>This link expires in 15 minutes.</p><p><a href="${urlWithLinkCode}" style="display:inline-block;padding:12px 24px;background-color:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Sign in</a></p><p>Or copy this URL: ${urlWithLinkCode}</p><p>If you did not request this, you can safely ignore this email.</p>`,
                                                    }),
                                                });
                                            }
                                            catch (err) {
                                                console.error('[SupertokensAdapter] Failed to send magic link email via Resend:', err);
                                                throw err;
                                            }
                                        },
                                    },
                                };
                            }
                            recipeList.push(Passwordless.default.init(passwordlessConfig));
                        }
                        // Add ThirdParty recipe if any social providers configured
                        if (config.socialProviders) {
                            // Build provider configurations using Supertokens ProviderInput type
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const providers = [];
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
                                recipeList.push(ThirdParty.default.init({
                                    signInAndUpFeature: {
                                        providers,
                                    },
                                }));
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
                    }
                    catch (error) {
                        initializationError =
                            error instanceof Error ? error : new Error('Failed to initialize Supertokens');
                        console.error('[SupertokensAdapter] Initialization error:', error);
                        // Let the auth-checking middleware decide whether to block this request.
                        // Non-auth routes (e.g. /auth/config/status) must remain accessible
                        // so the UI can display the configuration error state.
                        return next();
                    }
                }
                next();
            };
            // Supertokens middleware for handling auth routes
            const supertokensMiddleware = async (req, res, next) => {
                if (!initialized) {
                    return next();
                }
                try {
                    const { middleware } = await import('supertokens-node/framework/express');
                    middleware()(req, res, next);
                }
                catch {
                    next();
                }
            };
            return [initMiddleware, supertokensMiddleware];
        },
        isAuthenticated(req) {
            const extReq = req;
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
        async getUser(req) {
            const extReq = req;
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
                const roles = accessTokenPayload?.roles || [];
                // Map Supertokens user to AuthenticatedUser
                const user = {
                    id: userId,
                    email: userInfo.emails?.[0] ?? '',
                    name: accessTokenPayload?.name ||
                        userInfo.thirdParty?.[0]?.userId ||
                        userInfo.emails?.[0]?.split('@')[0],
                    picture: accessTokenPayload?.picture,
                    emailVerified: userInfo.emails?.[0] ? true : false,
                    roles,
                    raw: {
                        ...userInfo,
                        sessionHandle: session.getHandle(),
                        accessTokenPayload,
                    },
                };
                // Cache on request object
                extReq[REQUEST_USER_KEY] = user;
                return user;
            }
            catch (error) {
                console.error('[SupertokensAdapter] Error getting user:', error);
                return null;
            }
        },
        hasRoles(req, roles) {
            const extReq = req;
            const user = extReq[REQUEST_USER_KEY];
            if (!user?.roles)
                return false;
            return roles.every((role) => user.roles?.includes(role));
        },
        getAccessToken(_req) {
            // Supertokens uses session cookies, not access tokens
            // Return null as per the design decision
            return null;
        },
        onUnauthorized(_req, res) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required. Please sign in.',
                hint: 'Use the /auth endpoints to authenticate',
            });
        },
        async shutdown() {
            // Supertokens doesn't require explicit cleanup
            initialized = false;
            initializationError = null;
        },
    };
}
//# sourceMappingURL=supertokens-adapter.js.map