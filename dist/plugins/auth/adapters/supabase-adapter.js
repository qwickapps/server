/**
 * Supabase Auth Adapter
 *
 * Provides Supabase authentication using JWT validation.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Create a Supabase authentication adapter
 */
export function supabaseAdapter(config) {
    // Cache for validated users (short TTL to avoid stale data)
    const userCache = new Map();
    const CACHE_TTL = 60 * 1000; // 1 minute
    return {
        name: 'supabase',
        initialize() {
            // Supabase validation happens per-request, no initialization needed
            return (_req, _res, next) => next();
        },
        isAuthenticated(req) {
            // Check if we already validated this request
            if (req._supabaseUser) {
                return true;
            }
            const authHeader = req.headers.authorization;
            return !!authHeader && authHeader.startsWith('Bearer ');
        },
        async getUser(req) {
            // Return cached user if available
            if (req._supabaseUser) {
                return req._supabaseUser;
            }
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return null;
            }
            const token = authHeader.substring(7);
            // Check token cache
            const cached = userCache.get(token);
            if (cached && cached.expires > Date.now()) {
                req._supabaseUser = cached.user;
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
                const supabaseUser = (await response.json());
                const user = {
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
                req._supabaseUser = user;
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
            }
            catch (error) {
                console.error('[SupabaseAdapter] Token validation error:', error);
                return null;
            }
        },
        hasRoles(req, roles) {
            const user = req._supabaseUser;
            if (!user?.roles)
                return false;
            return roles.every((role) => user.roles?.includes(role));
        },
        getAccessToken(req) {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return null;
            }
            return authHeader.substring(7);
        },
        onUnauthorized(_req, res) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Missing or invalid authorization header. Expected: Bearer <token>',
            });
        },
        async shutdown() {
            userCache.clear();
        },
    };
}
//# sourceMappingURL=supabase-adapter.js.map