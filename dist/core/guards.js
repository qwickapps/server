/**
 * Route Guards for @qwickapps/server
 *
 * Provides authentication middleware for protecting routes.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
// Session cookie configuration
const SESSION_COOKIE_NAME = 'cpanel_session';
const DEFAULT_SESSION_DURATION_HOURS = 8;
/**
 * Create a signed session token with expiration
 */
function createSessionToken(secret, durationHours) {
    const expiresAt = Date.now() + durationHours * 60 * 60 * 1000;
    const payload = `cpanel:${expiresAt}`;
    const signature = createHmac('sha256', secret).update(payload).digest('hex');
    return `${payload}:${signature}`;
}
/**
 * Verify a session token and check expiration
 */
function verifySessionToken(token, secret) {
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
    }
    catch {
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
function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader)
        return cookies;
    cookieHeader.split(';').forEach((cookie) => {
        const [name, ...rest] = cookie.trim().split('=');
        if (name && rest.length > 0) {
            cookies[name] = rest.join('=');
        }
    });
    return cookies;
}
/**
 * Create a route guard middleware from configuration
 */
export function createRouteGuard(config) {
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
            throw new Error(`Unknown guard type: ${config.type}`);
    }
}
/**
 * Create basic auth guard middleware
 *
 * This guard supports session cookies to prevent repeated login prompts.
 * After successful Basic Auth, a signed session cookie is set that allows
 * subsequent requests to proceed without re-prompting for credentials.
 */
function createBasicAuthGuard(config) {
    const expectedAuth = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`;
    const realm = config.realm || 'Protected';
    const excludePaths = config.excludePaths || [];
    const sessionDurationHours = config.sessionDurationHours ?? DEFAULT_SESSION_DURATION_HOURS;
    // Use password as HMAC secret for session tokens
    const sessionSecret = config.password;
    return (req, res, next) => {
        // Check if path is excluded
        if (excludePaths.some(path => req.path.startsWith(path))) {
            return next();
        }
        // Check for valid session cookie first
        const cookies = parseCookies(req.headers.cookie);
        const sessionToken = cookies[SESSION_COOKIE_NAME];
        if (sessionToken && verifySessionToken(sessionToken, sessionSecret)) {
            return next();
        }
        // Check Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader === expectedAuth) {
            // Set session cookie on successful auth
            const token = createSessionToken(sessionSecret, sessionDurationHours);
            const maxAge = sessionDurationHours * 60 * 60; // seconds
            // Add Secure flag when running over HTTPS
            const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
            const secureFlag = isSecure ? ' Secure;' : '';
            res.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict;${secureFlag} Max-Age=${maxAge}`);
            return next();
        }
        // No valid session or auth header - prompt for credentials
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
function createSupabaseGuard(config) {
    const excludePaths = config.excludePaths || [];
    return async (req, res, next) => {
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
            req.user = user;
            next();
        }
        catch (error) {
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
function createAuth0Guard(config) {
    // Lazy-load express-openid-connect to avoid requiring it when not used
    let authMiddleware = null;
    return async (req, res, next) => {
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
            }
            catch (error) {
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
        authMiddleware(req, res, next);
    };
}
/**
 * Helper to check if a request is authenticated (for use in handlers)
 */
export function isAuthenticated(req) {
    // Check for Auth0 session
    if (req.oidc?.isAuthenticated?.()) {
        return true;
    }
    // Check for Supabase user
    if (req.user) {
        return true;
    }
    return false;
}
/**
 * Get the authenticated user from the request
 */
export function getAuthenticatedUser(req) {
    // Check for Auth0 user
    if (req.oidc?.user) {
        return req.oidc.user;
    }
    // Check for Supabase user
    if (req.user) {
        return req.user;
    }
    return null;
}
//# sourceMappingURL=guards.js.map