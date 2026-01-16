/**
 * Auth Plugin
 *
 * Pluggable authentication plugin for @qwickapps/server.
 * Supports multiple adapters (Auth0, Supabase, Basic) with fallback chain.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Store the plugin instance for helper access
let currentAdapter = null;
let fallbackAdapters = [];
/**
 * Create the Auth plugin
 */
export function createAuthPlugin(config) {
    const excludePaths = config.excludePaths || [];
    const authRequired = config.authRequired !== false;
    const debug = config.debug || false;
    function log(message, data) {
        if (debug) {
            console.log(`[AuthPlugin] ${message}`, data || '');
        }
    }
    return {
        id: 'auth',
        name: 'Auth Plugin',
        version: '1.0.0',
        type: 'system',
        async onStart(_pluginConfig, registry) {
            const app = registry.getApp();
            const router = registry.getRouter();
            // Store adapters for helper access
            currentAdapter = config.adapter;
            fallbackAdapters = config.fallback || [];
            log('Initializing auth plugin', {
                adapter: config.adapter.name,
                fallback: fallbackAdapters.map((a) => a.name),
                excludePaths,
                authRequired,
            });
            // Initialize the primary adapter
            const primaryMiddleware = config.adapter.initialize();
            if (Array.isArray(primaryMiddleware)) {
                primaryMiddleware.forEach((mw) => app.use(mw));
            }
            else {
                app.use(primaryMiddleware);
            }
            // Initialize fallback adapters
            for (const fallback of fallbackAdapters) {
                const fallbackMiddleware = fallback.initialize();
                if (Array.isArray(fallbackMiddleware)) {
                    fallbackMiddleware.forEach((mw) => app.use(mw));
                }
                else {
                    app.use(fallbackMiddleware);
                }
            }
            // Add the auth checking middleware to router (not app)
            // This ensures it processes requests to /api/* routes
            router.use(createAuthMiddleware());
            // Register auth status route
            registry.addRoute({
                method: 'get',
                path: '/auth/status',
                handler: (_req, res) => {
                    const authReq = _req;
                    res.json({
                        authenticated: authReq.auth?.isAuthenticated || false,
                        user: authReq.auth?.user
                            ? {
                                id: authReq.auth.user.id,
                                email: authReq.auth.user.email,
                                name: authReq.auth.user.name,
                                picture: authReq.auth.user.picture,
                                roles: authReq.auth.user.roles,
                            }
                            : null,
                        adapter: authReq.auth?.adapter,
                    });
                },
                pluginId: 'auth',
            });
            log('Auth plugin initialized');
        },
        async onStop() {
            log('Shutting down auth plugin');
            // Cleanup adapters
            if (currentAdapter?.shutdown) {
                await currentAdapter.shutdown();
            }
            for (const fallback of fallbackAdapters) {
                if (fallback.shutdown) {
                    await fallback.shutdown();
                }
            }
            currentAdapter = null;
            fallbackAdapters = [];
        },
    };
    /**
     * Create the auth checking middleware
     */
    function createAuthMiddleware() {
        return async (req, res, next) => {
            const authReq = req;
            // Initialize auth object
            authReq.auth = {
                isAuthenticated: false,
                user: null,
                adapter: 'none',
            };
            // Check if path is excluded
            const isExcluded = excludePaths.some((path) => {
                if (path.endsWith('*')) {
                    return req.path.startsWith(path.slice(0, -1));
                }
                return req.path === path || req.path.startsWith(path + '/');
            });
            if (isExcluded) {
                log('Path excluded from auth', { path: req.path });
                return next();
            }
            // Try primary adapter
            let authenticated = false;
            let user = null;
            let activeAdapter = config.adapter;
            if (config.adapter.isAuthenticated(req)) {
                user = await Promise.resolve(config.adapter.getUser(req));
                if (user) {
                    authenticated = true;
                    log('Authenticated via primary adapter', { adapter: config.adapter.name });
                }
            }
            // Try fallback adapters if primary didn't authenticate
            if (!authenticated && fallbackAdapters.length > 0) {
                for (const fallback of fallbackAdapters) {
                    if (fallback.isAuthenticated(req)) {
                        user = await Promise.resolve(fallback.getUser(req));
                        if (user) {
                            authenticated = true;
                            activeAdapter = fallback;
                            log('Authenticated via fallback adapter', { adapter: fallback.name });
                            break;
                        }
                    }
                }
            }
            // Set auth info on request
            authReq.auth = {
                isAuthenticated: authenticated,
                user,
                adapter: activeAdapter.name,
                accessToken: activeAdapter.getAccessToken?.(req) || undefined,
            };
            // Call onAuthenticated callback if provided and user is authenticated
            if (authenticated && user && config.onAuthenticated) {
                try {
                    await config.onAuthenticated(user);
                    log('onAuthenticated callback completed', { userId: user.id, email: user.email });
                }
                catch (error) {
                    // Log error but don't fail the request - auth succeeded, sync is optional
                    console.error('[AuthPlugin] onAuthenticated callback error:', {
                        userId: user.id,
                        email: user.email,
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
            // Check if auth is required but user is not authenticated
            if (authRequired && !authenticated) {
                log('Auth required but not authenticated', { path: req.path });
                // Use custom handler if provided
                if (config.onUnauthorized) {
                    return config.onUnauthorized(req, res);
                }
                // Use adapter's unauthorized handler
                if (activeAdapter.onUnauthorized) {
                    return activeAdapter.onUnauthorized(req, res);
                }
                // Default unauthorized response
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required',
                });
            }
            next();
        };
    }
}
/**
 * Check if the current request is authenticated
 */
export function isAuthenticated(req) {
    const authReq = req;
    return authReq.auth?.isAuthenticated || false;
}
/**
 * Get the authenticated user from the request
 */
export function getAuthenticatedUser(req) {
    const authReq = req;
    return authReq.auth?.user || null;
}
/**
 * Get the access token from the request
 */
export function getAccessToken(req) {
    const authReq = req;
    return authReq.auth?.accessToken || null;
}
/**
 * Middleware to require authentication
 */
export function requireAuth() {
    return (req, res, next) => {
        if (!isAuthenticated(req)) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }
        next();
    };
}
/**
 * Middleware to require specific roles
 */
export function requireRoles(...roles) {
    return (req, res, next) => {
        const user = getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }
        const userRoles = user.roles || [];
        const hasAllRoles = roles.every((role) => userRoles.includes(role));
        if (!hasAllRoles) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `Required roles: ${roles.join(', ')}`,
            });
        }
        next();
    };
}
/**
 * Middleware to require any of the specified roles
 */
export function requireAnyRole(...roles) {
    return (req, res, next) => {
        const user = getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }
        const userRoles = user.roles || [];
        const hasAnyRole = roles.some((role) => userRoles.includes(role));
        if (!hasAnyRole) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `Required one of roles: ${roles.join(', ')}`,
            });
        }
        next();
    };
}
//# sourceMappingURL=auth-plugin.js.map