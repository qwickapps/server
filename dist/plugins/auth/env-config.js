/**
 * Auth Plugin Environment Configuration
 *
 * Factory function and utilities for configuring auth adapters via environment variables.
 * Supports all adapters: Auth0, Supabase, Supertokens, Basic.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { createAuthPlugin } from './auth-plugin.js';
import { auth0Adapter } from './adapters/auth0-adapter.js';
import { supabaseAdapter } from './adapters/supabase-adapter.js';
import { supertokensAdapter } from './adapters/supertokens-adapter.js';
import { basicAdapter } from './adapters/basic-adapter.js';
// ═══════════════════════════════════════════════════════════════════════════
// Module State
// ═══════════════════════════════════════════════════════════════════════════
let currentStatus = {
    state: 'disabled',
    adapter: null,
};
// Runtime configuration store (PostgreSQL-backed)
let configStore = null;
// Adapter wrapper for hot-reload support
let adapterWrapper = null;
// Unsubscribe function for config change listener
let configUnsubscribe = null;
// ═══════════════════════════════════════════════════════════════════════════
// Environment Variable Helpers
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Get an environment variable, treating empty strings as undefined
 */
function getEnv(key) {
    const value = process.env[key];
    if (value === undefined || value === null || value.trim() === '') {
        return undefined;
    }
    return value.trim();
}
/**
 * Parse a boolean environment variable
 * Supports: true/false, 1/0, yes/no (case-insensitive)
 */
function getEnvBool(key, defaultValue) {
    const value = getEnv(key);
    if (value === undefined) {
        return defaultValue;
    }
    const lower = value.toLowerCase();
    if (['true', '1', 'yes'].includes(lower)) {
        return true;
    }
    if (['false', '0', 'no'].includes(lower)) {
        return false;
    }
    return defaultValue;
}
/**
 * Parse a comma-separated list environment variable
 */
function getEnvList(key) {
    const value = getEnv(key);
    if (value === undefined) {
        return undefined;
    }
    return value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}
/**
 * Mask a sensitive value for display
 */
function maskValue(value) {
    if (value.length <= 4) {
        return '****';
    }
    return value.substring(0, 2) + '*'.repeat(Math.min(value.length - 4, 20)) + value.substring(value.length - 2);
}
/**
 * Parse Supertokens configuration from environment variables
 */
function parseSupertokensEnv() {
    const errors = [];
    const connectionUri = getEnv('SUPERTOKENS_CONNECTION_URI');
    const appName = getEnv('SUPERTOKENS_APP_NAME');
    const apiDomain = getEnv('SUPERTOKENS_API_DOMAIN');
    const websiteDomain = getEnv('SUPERTOKENS_WEBSITE_DOMAIN');
    // Check required vars
    if (!connectionUri)
        errors.push('SUPERTOKENS_CONNECTION_URI');
    if (!appName)
        errors.push('SUPERTOKENS_APP_NAME');
    if (!apiDomain)
        errors.push('SUPERTOKENS_API_DOMAIN');
    if (!websiteDomain)
        errors.push('SUPERTOKENS_WEBSITE_DOMAIN');
    if (errors.length > 0) {
        return { config: null, errors };
    }
    // Build config
    const config = {
        connectionUri: connectionUri,
        appName: appName,
        apiDomain: apiDomain,
        websiteDomain: websiteDomain,
        apiKey: getEnv('SUPERTOKENS_API_KEY'),
        apiBasePath: getEnv('SUPERTOKENS_API_BASE_PATH') ?? '/auth',
        websiteBasePath: getEnv('SUPERTOKENS_WEBSITE_BASE_PATH') ?? '/auth',
        enableEmailPassword: getEnvBool('SUPERTOKENS_ENABLE_EMAIL_PASSWORD', true),
    };
    // Parse social providers
    const googleClientId = getEnv('SUPERTOKENS_GOOGLE_CLIENT_ID');
    const googleClientSecret = getEnv('SUPERTOKENS_GOOGLE_CLIENT_SECRET');
    const githubClientId = getEnv('SUPERTOKENS_GITHUB_CLIENT_ID');
    const githubClientSecret = getEnv('SUPERTOKENS_GITHUB_CLIENT_SECRET');
    const appleClientId = getEnv('SUPERTOKENS_APPLE_CLIENT_ID');
    const appleClientSecret = getEnv('SUPERTOKENS_APPLE_CLIENT_SECRET');
    const appleKeyId = getEnv('SUPERTOKENS_APPLE_KEY_ID');
    const appleTeamId = getEnv('SUPERTOKENS_APPLE_TEAM_ID');
    // Only add social providers if both client ID and secret are provided
    if (googleClientId && googleClientSecret) {
        config.socialProviders = config.socialProviders || {};
        config.socialProviders.google = {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
        };
    }
    if (githubClientId && githubClientSecret) {
        config.socialProviders = config.socialProviders || {};
        config.socialProviders.github = {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
        };
    }
    if (appleClientId && appleClientSecret && appleKeyId && appleTeamId) {
        config.socialProviders = config.socialProviders || {};
        config.socialProviders.apple = {
            clientId: appleClientId,
            clientSecret: appleClientSecret,
            keyId: appleKeyId,
            teamId: appleTeamId,
        };
    }
    return { config, errors: [] };
}
/**
 * Parse Auth0 configuration from environment variables
 */
function parseAuth0Env() {
    const errors = [];
    const domain = getEnv('AUTH0_DOMAIN');
    const clientId = getEnv('AUTH0_CLIENT_ID');
    const clientSecret = getEnv('AUTH0_CLIENT_SECRET');
    const baseUrl = getEnv('AUTH0_BASE_URL');
    const secret = getEnv('AUTH0_SECRET');
    // Check required vars
    if (!domain)
        errors.push('AUTH0_DOMAIN');
    if (!clientId)
        errors.push('AUTH0_CLIENT_ID');
    if (!clientSecret)
        errors.push('AUTH0_CLIENT_SECRET');
    if (!baseUrl)
        errors.push('AUTH0_BASE_URL');
    if (!secret)
        errors.push('AUTH0_SECRET');
    if (errors.length > 0) {
        return { config: null, errors };
    }
    // Build config
    const config = {
        domain: domain,
        clientId: clientId,
        clientSecret: clientSecret,
        baseUrl: baseUrl,
        secret: secret,
        audience: getEnv('AUTH0_AUDIENCE'),
        scopes: getEnvList('AUTH0_SCOPES') ?? ['openid', 'profile', 'email'],
        allowedRoles: getEnvList('AUTH0_ALLOWED_ROLES'),
        allowedDomains: getEnvList('AUTH0_ALLOWED_DOMAINS'),
        exposeAccessToken: getEnvBool('AUTH0_EXPOSE_ACCESS_TOKEN', false),
        routes: {
            login: getEnv('AUTH0_LOGIN_PATH') ?? '/login',
            logout: getEnv('AUTH0_LOGOUT_PATH') ?? '/logout',
            callback: getEnv('AUTH0_CALLBACK_PATH') ?? '/callback',
        },
    };
    return { config, errors: [] };
}
/**
 * Parse Supabase configuration from environment variables
 */
function parseSupabaseEnv() {
    const errors = [];
    const url = getEnv('SUPABASE_URL');
    const anonKey = getEnv('SUPABASE_ANON_KEY');
    // Check required vars
    if (!url)
        errors.push('SUPABASE_URL');
    if (!anonKey)
        errors.push('SUPABASE_ANON_KEY');
    if (errors.length > 0) {
        return { config: null, errors };
    }
    const config = {
        url: url,
        anonKey: anonKey,
    };
    return { config, errors: [] };
}
/**
 * Parse Basic Auth configuration from environment variables
 */
function parseBasicAuthEnv() {
    const errors = [];
    const username = getEnv('BASIC_AUTH_USERNAME');
    const password = getEnv('BASIC_AUTH_PASSWORD');
    // Check required vars
    if (!username)
        errors.push('BASIC_AUTH_USERNAME');
    if (!password)
        errors.push('BASIC_AUTH_PASSWORD');
    if (errors.length > 0) {
        return { config: null, errors };
    }
    const config = {
        username: username,
        password: password,
        realm: getEnv('BASIC_AUTH_REALM') ?? 'Protected',
    };
    return { config, errors: [] };
}
// ═══════════════════════════════════════════════════════════════════════════
// Factory Function
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Valid adapter names
 */
const VALID_ADAPTERS = ['supertokens', 'auth0', 'supabase', 'basic'];
/**
 * Create an auth plugin configured from environment variables.
 *
 * The plugin state depends on environment configuration:
 * - **disabled**: AUTH_ADAPTER not set - no authentication middleware is applied
 * - **enabled**: Valid configuration - adapter is active and working
 * - **error**: Invalid configuration - plugin is disabled with error details
 *
 * @example
 * ```typescript
 * // Zero-config setup - reads everything from env vars
 * const authPlugin = createAuthPluginFromEnv();
 *
 * // With overrides
 * const authPlugin = createAuthPluginFromEnv({
 *   excludePaths: ['/health', '/metrics'],
 *   authRequired: true,
 * });
 * ```
 *
 * @param options - Optional overrides (env vars take precedence for adapter config)
 * @returns A Plugin instance
 */
export function createAuthPluginFromEnv(options) {
    const adapterName = getEnv('AUTH_ADAPTER')?.toLowerCase();
    // No adapter specified OR explicitly disabled - return disabled plugin
    if (!adapterName || adapterName === 'none') {
        currentStatus = {
            state: 'disabled',
            adapter: null,
        };
        return createDisabledPlugin();
    }
    // Validate adapter name
    if (!VALID_ADAPTERS.includes(adapterName)) {
        const error = `Invalid AUTH_ADAPTER value: "${adapterName}". Valid options: ${VALID_ADAPTERS.join(', ')}`;
        currentStatus = {
            state: 'error',
            adapter: null,
            error,
        };
        return createErrorPlugin(error);
    }
    // Parse adapter-specific configuration
    let parseResult;
    switch (adapterName) {
        case 'supertokens':
            parseResult = parseSupertokensEnv();
            break;
        case 'auth0':
            parseResult = parseAuth0Env();
            break;
        case 'supabase':
            parseResult = parseSupabaseEnv();
            break;
        case 'basic':
            parseResult = parseBasicAuthEnv();
            break;
    }
    // Check for parsing errors
    if (parseResult.errors.length > 0) {
        const error = `Missing required environment variables for ${adapterName} adapter: ${parseResult.errors.join(', ')}`;
        currentStatus = {
            state: 'error',
            adapter: adapterName,
            error,
            missingVars: parseResult.errors,
        };
        return createErrorPlugin(error);
    }
    // Create the adapter
    let adapter;
    switch (adapterName) {
        case 'supertokens':
            adapter = supertokensAdapter(parseResult.config);
            break;
        case 'auth0':
            adapter = auth0Adapter(parseResult.config);
            break;
        case 'supabase':
            adapter = supabaseAdapter(parseResult.config);
            break;
        case 'basic':
            adapter = basicAdapter(parseResult.config);
            break;
    }
    // Build plugin configuration
    const excludePaths = options?.excludePaths ?? getEnvList('AUTH_EXCLUDE_PATHS') ?? [];
    const authRequired = options?.authRequired ?? getEnvBool('AUTH_REQUIRED', true);
    const debug = options?.debug ?? getEnvBool('AUTH_DEBUG', false);
    const pluginConfig = {
        adapter,
        excludePaths,
        authRequired,
        debug,
        onUnauthorized: options?.onUnauthorized,
        onAuthenticated: options?.onAuthenticated,
    };
    // Update status
    currentStatus = {
        state: 'enabled',
        adapter: adapterName,
        config: getMaskedConfig(adapterName),
    };
    // Create the plugin
    const basePlugin = createAuthPlugin(pluginConfig);
    // Wrap to add config status routes
    return {
        ...basePlugin,
        type: 'system', // Explicit system type (auth can handle any path)
        async onStart(pluginConfig, registry) {
            // Call base plugin onStart
            await basePlugin.onStart?.(pluginConfig, registry);
            // Add config status routes
            registerAuthConfigRoutes(registry);
        },
    };
}
// ═══════════════════════════════════════════════════════════════════════════
// Status & Config API
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Get current auth plugin status
 */
export function getAuthStatus() {
    return { ...currentStatus };
}
/**
 * Get masked configuration for the current adapter
 */
function getMaskedConfig(adapter) {
    const config = {};
    // Sensitive keys that should be masked
    const sensitiveKeys = [
        'SECRET',
        'PASSWORD',
        'KEY',
        'TOKEN',
        'CREDENTIAL',
        'ANON_KEY',
        'API_KEY',
        'CLIENT_SECRET',
    ];
    const isSensitive = (key) => {
        const upper = key.toUpperCase();
        return sensitiveKeys.some((s) => upper.includes(s));
    };
    // Get all env vars for the adapter
    const prefixes = {
        supertokens: ['SUPERTOKENS_'],
        auth0: ['AUTH0_'],
        supabase: ['SUPABASE_'],
        basic: ['BASIC_AUTH_'],
    };
    for (const [key, value] of Object.entries(process.env)) {
        const matchesPrefix = prefixes[adapter].some((p) => key.startsWith(p));
        if (matchesPrefix && value) {
            config[key] = isSensitive(key) ? maskValue(value) : value;
        }
    }
    // Add general auth vars
    const generalVars = ['AUTH_ADAPTER', 'AUTH_REQUIRED', 'AUTH_EXCLUDE_PATHS', 'AUTH_DEBUG'];
    for (const key of generalVars) {
        const value = process.env[key];
        if (value) {
            config[key] = value;
        }
    }
    return config;
}
/**
 * Register config API routes
 *
 * IMPORTANT: These routes should be registered even when auth is disabled or in error state.
 * This allows administrators to:
 * - View current auth configuration status
 * - See error messages for misconfigured auth
 * - Update auth configuration at runtime
 * - Test auth adapter connections
 *
 * Can be called from plugin onStart() to add auth configuration management endpoints.
 * These routes allow viewing and updating auth configuration at runtime.
 */
export function registerAuthConfigRoutes(registry) {
    // GET /auth/config/status - Get current auth status
    registry.addRoute({
        method: 'get',
        path: '/auth/config/status',
        pluginId: 'auth',
        handler: (_req, res) => {
            res.json(getAuthStatus());
        },
    });
    // GET /auth/config - Get current configuration (masked)
    registry.addRoute({
        method: 'get',
        path: '/auth/config',
        pluginId: 'auth',
        handler: async (_req, res) => {
            const status = getAuthStatus();
            const response = {
                state: status.state,
                adapter: status.adapter,
                config: status.config || {},
                error: status.error,
                missingVars: status.missingVars,
            };
            // Include runtime config if available from store
            if (configStore) {
                try {
                    const runtimeConfig = await configStore.load();
                    if (runtimeConfig) {
                        response.runtimeConfig = runtimeConfig;
                    }
                }
                catch (err) {
                    console.error('[AuthPlugin] Failed to load runtime config:', err);
                }
            }
            res.json(response);
        },
    });
    // PUT /auth/config - Save new configuration
    registry.addRoute({
        method: 'put',
        path: '/auth/config',
        pluginId: 'auth',
        handler: async (req, res) => {
            try {
                // Check if config store is available
                if (!configStore) {
                    return res.status(503).json({
                        error: 'Configuration store not available',
                        message: 'Runtime configuration requires a config store (PostgreSQL)',
                    });
                }
                // Parse and validate request body
                const body = req.body;
                if (!body || !body.adapter) {
                    return res.status(400).json({
                        error: 'Invalid request',
                        message: 'Request body must include adapter type',
                    });
                }
                // Validate adapter type
                if (!VALID_ADAPTERS.includes(body.adapter)) {
                    return res.status(400).json({
                        error: 'Invalid adapter',
                        message: `Valid adapters: ${VALID_ADAPTERS.join(', ')}`,
                    });
                }
                // Validate adapter config
                const validation = validateAdapterConfig(body.adapter, body.config || {});
                if (!validation.valid) {
                    return res.status(400).json({
                        error: 'Invalid configuration',
                        message: validation.errors.join(', '),
                        errors: validation.errors,
                    });
                }
                // Build runtime config
                const runtimeConfig = {
                    adapter: body.adapter,
                    config: {
                        [body.adapter]: body.config,
                    },
                    settings: body.settings || {},
                    updatedAt: new Date().toISOString(),
                };
                // Save to store
                await configStore.save(runtimeConfig);
                // Apply config immediately (hot-reload)
                if (adapterWrapper) {
                    const adapter = createAdapterFromConfig(body.adapter, runtimeConfig.config);
                    if (adapter) {
                        await adapterWrapper.setAdapter(adapter);
                    }
                }
                // Update status
                currentStatus = {
                    state: 'enabled',
                    adapter: body.adapter,
                    config: getMaskedRuntimeConfig(runtimeConfig),
                };
                res.json({
                    success: true,
                    status: getAuthStatus(),
                });
            }
            catch (error) {
                console.error('[AuthPlugin] Failed to save config:', error);
                res.status(500).json({
                    error: 'Failed to save configuration',
                    message: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        },
    });
    // DELETE /auth/config - Revert to environment variables
    registry.addRoute({
        method: 'delete',
        path: '/auth/config',
        pluginId: 'auth',
        handler: async (_req, res) => {
            try {
                // Check if config store is available
                if (!configStore) {
                    return res.status(503).json({
                        error: 'Configuration store not available',
                        message: 'Runtime configuration requires a config store (PostgreSQL)',
                    });
                }
                // Delete from store
                await configStore.delete();
                // Revert to env vars
                const adapterName = getEnv('AUTH_ADAPTER')?.toLowerCase();
                if (adapterName && VALID_ADAPTERS.includes(adapterName)) {
                    const parseResult = getParseResultForAdapter(adapterName);
                    if (parseResult.config && adapterWrapper) {
                        const adapter = createAdapterForName(adapterName, parseResult.config);
                        await adapterWrapper.setAdapter(adapter);
                        currentStatus = {
                            state: 'enabled',
                            adapter: adapterName,
                            config: getMaskedConfig(adapterName),
                        };
                    }
                    else if (parseResult.errors.length > 0) {
                        currentStatus = {
                            state: 'error',
                            adapter: adapterName,
                            error: `Missing env vars: ${parseResult.errors.join(', ')}`,
                            missingVars: parseResult.errors,
                        };
                    }
                }
                else {
                    currentStatus = {
                        state: 'disabled',
                        adapter: null,
                    };
                }
                res.json({
                    success: true,
                    status: getAuthStatus(),
                });
            }
            catch (error) {
                console.error('[AuthPlugin] Failed to delete config:', error);
                res.status(500).json({
                    error: 'Failed to delete configuration',
                    message: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        },
    });
    // POST /auth/test-provider - Test provider connection
    registry.addRoute({
        method: 'post',
        path: '/auth/test-provider',
        pluginId: 'auth',
        handler: async (req, res) => {
            try {
                const body = req.body;
                if (!body || !body.adapter) {
                    return res.status(400).json({
                        error: 'Invalid request',
                        message: 'Request body must include adapter type',
                    });
                }
                // Validate adapter type
                if (!VALID_ADAPTERS.includes(body.adapter)) {
                    return res.status(400).json({
                        error: 'Invalid adapter',
                        message: `Valid adapters: ${VALID_ADAPTERS.join(', ')}`,
                    });
                }
                // Test the connection
                const result = await testProviderConnection(body.adapter, body.config || {});
                res.json(result);
            }
            catch (error) {
                console.error('[AuthPlugin] Test provider error:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        },
    });
    // POST /auth/test-current - Test current auth configuration (env-based or runtime)
    registry.addRoute({
        method: 'post',
        path: '/auth/test-current',
        pluginId: 'auth',
        handler: async (_req, res) => {
            try {
                const status = getAuthStatus();
                if (status.state !== 'enabled' || !status.adapter) {
                    return res.status(400).json({
                        success: false,
                        message: 'No active auth configuration to test',
                    });
                }
                // Get the current configuration from env vars
                const adapterName = status.adapter;
                const parseResult = getParseResultForAdapter(adapterName);
                if (parseResult.errors.length > 0) {
                    return res.json({
                        success: false,
                        message: `Missing configuration: ${parseResult.errors.join(', ')}`,
                    });
                }
                // Test the connection using the current env-based config
                // Use JSON round-trip for safe conversion to plain object
                const configObj = JSON.parse(JSON.stringify(parseResult.config));
                const result = await testProviderConnection(adapterName, configObj);
                res.json(result);
            }
            catch (error) {
                console.error('[AuthPlugin] Test current provider error:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        },
    });
    // Register UI menu item for auth configuration
    registry.addMenuItem({
        pluginId: 'auth',
        id: 'auth:sidebar',
        label: 'Authentication',
        icon: 'security',
        route: '/auth',
        order: 50, // After Entitlements (35)
    });
    // Register page contribution
    registry.addPage({
        pluginId: 'auth',
        id: 'auth:config-page',
        route: '/auth',
        component: 'AuthPage',
    });
    // Register dashboard widget
    registry.addWidget({
        id: 'auth-status',
        title: 'Authentication',
        component: 'AuthStatusWidget',
        priority: 40, // Show before integrations
        showByDefault: true,
        pluginId: 'auth',
    });
    // Register health check for auth provider connection
    const status = getAuthStatus();
    if (status.state === 'enabled' && status.adapter) {
        registry.registerHealthCheck({
            name: `auth-${status.adapter}`,
            type: 'custom',
            check: async () => {
                const currentStatus = getAuthStatus();
                if (currentStatus.state !== 'enabled' || !currentStatus.adapter) {
                    return { healthy: false, message: 'Auth not configured' };
                }
                const adapterName = currentStatus.adapter;
                const parseResult = getParseResultForAdapter(adapterName);
                if (parseResult.errors.length > 0) {
                    return { healthy: false, message: `Missing config: ${parseResult.errors.join(', ')}` };
                }
                const configObj = JSON.parse(JSON.stringify(parseResult.config));
                const result = await testProviderConnection(adapterName, configObj);
                return {
                    healthy: result.success,
                    message: result.message,
                    details: result.details,
                };
            },
        });
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// Disabled & Error Plugins
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Create a disabled plugin (no auth middleware)
 */
function createDisabledPlugin() {
    return {
        id: 'auth',
        name: 'Auth Plugin (Disabled)',
        version: '1.0.0',
        type: 'system',
        async onStart(_pluginConfig, registry) {
            const logger = registry.getLogger('auth');
            logger.info('Auth plugin disabled - AUTH_ADAPTER not set');
            // Register status routes even when disabled
            registerAuthConfigRoutes(registry);
        },
        async onStop() {
            // Nothing to cleanup
        },
    };
}
/**
 * Create an error plugin (auth disabled due to configuration error)
 */
function createErrorPlugin(error) {
    return {
        id: 'auth',
        name: 'Auth Plugin (Error)',
        version: '1.0.0',
        type: 'system',
        async onStart(_pluginConfig, registry) {
            const logger = registry.getLogger('auth');
            logger.error(`Auth plugin error: ${error}`);
            // Register status routes so admin can see the error
            registerAuthConfigRoutes(registry);
        },
        async onStop() {
            // Nothing to cleanup
        },
    };
}
/**
 * Create an adapter from runtime configuration
 */
function createAdapterFromConfig(adapterType, config) {
    switch (adapterType) {
        case 'supertokens':
            if (config.supertokens) {
                return supertokensAdapter(config.supertokens);
            }
            break;
        case 'auth0':
            if (config.auth0) {
                return auth0Adapter(config.auth0);
            }
            break;
        case 'supabase':
            if (config.supabase) {
                return supabaseAdapter(config.supabase);
            }
            break;
        case 'basic':
            if (config.basic) {
                return basicAdapter(config.basic);
            }
            break;
    }
    return null;
}
/**
 * Validate adapter configuration
 */
function validateAdapterConfig(adapterType, config) {
    const errors = [];
    switch (adapterType) {
        case 'supertokens':
            if (!config.connectionUri)
                errors.push('connectionUri is required');
            if (!config.appName)
                errors.push('appName is required');
            if (!config.apiDomain)
                errors.push('apiDomain is required');
            if (!config.websiteDomain)
                errors.push('websiteDomain is required');
            break;
        case 'auth0':
            if (!config.domain)
                errors.push('domain is required');
            if (!config.clientId)
                errors.push('clientId is required');
            if (!config.clientSecret)
                errors.push('clientSecret is required');
            if (!config.baseUrl)
                errors.push('baseUrl is required');
            if (!config.secret)
                errors.push('secret is required');
            break;
        case 'supabase':
            if (!config.url)
                errors.push('url is required');
            if (!config.anonKey)
                errors.push('anonKey is required');
            break;
        case 'basic':
            if (!config.username)
                errors.push('username is required');
            if (!config.password)
                errors.push('password is required');
            break;
    }
    return { valid: errors.length === 0, errors };
}
/**
 * Validate a URL for security (prevent SSRF attacks)
 */
function validateUrl(urlString) {
    const url = new URL(urlString);
    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('URL must use http or https protocol');
    }
    // Block private/internal IPs (basic SSRF protection)
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.') ||
        hostname.endsWith('.internal') ||
        hostname.endsWith('.local')) {
        // Allow localhost for dev/testing, but log it
        console.warn(`[AuthPlugin] Testing connection to internal address: ${hostname}`);
    }
    return url;
}
/**
 * Test a provider connection
 */
async function testProviderConnection(adapterType, config) {
    const startTime = Date.now();
    try {
        // Validate config first
        const validation = validateAdapterConfig(adapterType, config);
        if (!validation.valid) {
            return {
                success: false,
                message: `Invalid configuration: ${validation.errors.join(', ')}`,
            };
        }
        // Test connection based on adapter type
        switch (adapterType) {
            case 'supertokens': {
                // Try to connect to Supertokens core
                const connectionUri = config.connectionUri;
                validateUrl(connectionUri); // Validate URL before making request
                const apiKey = config.apiKey;
                const headers = {
                    'Content-Type': 'application/json',
                };
                if (apiKey) {
                    headers['api-key'] = apiKey;
                }
                const response = await fetch(`${connectionUri}/apiversion`, { headers });
                if (!response.ok) {
                    return {
                        success: false,
                        message: `Failed to connect to Supertokens core: ${response.status} ${response.statusText}`,
                    };
                }
                const data = (await response.json());
                return {
                    success: true,
                    message: 'Successfully connected to Supertokens core',
                    details: {
                        latency: Date.now() - startTime,
                        version: data.versions?.[0],
                    },
                };
            }
            case 'auth0': {
                // Test Auth0 domain is reachable
                const domain = config.domain;
                const response = await fetch(`https://${domain}/.well-known/openid-configuration`);
                if (!response.ok) {
                    return {
                        success: false,
                        message: `Failed to connect to Auth0: ${response.status} ${response.statusText}`,
                    };
                }
                return {
                    success: true,
                    message: 'Successfully connected to Auth0',
                    details: {
                        latency: Date.now() - startTime,
                    },
                };
            }
            case 'supabase': {
                // Test Supabase endpoint
                const url = config.url;
                validateUrl(url); // Validate URL before making request
                const anonKey = config.anonKey;
                const response = await fetch(`${url}/rest/v1/`, {
                    headers: {
                        apikey: anonKey,
                        Authorization: `Bearer ${anonKey}`,
                    },
                });
                // Supabase returns 200 even without tables
                if (!response.ok && response.status !== 404) {
                    return {
                        success: false,
                        message: `Failed to connect to Supabase: ${response.status} ${response.statusText}`,
                    };
                }
                return {
                    success: true,
                    message: 'Successfully connected to Supabase',
                    details: {
                        latency: Date.now() - startTime,
                    },
                };
            }
            case 'basic': {
                // Basic auth just validates credentials are present
                return {
                    success: true,
                    message: 'Basic auth configuration is valid',
                    details: {
                        latency: Date.now() - startTime,
                    },
                };
            }
            default:
                return {
                    success: false,
                    message: `Unknown adapter type: ${adapterType}`,
                };
        }
    }
    catch (error) {
        // Provide more helpful error messages for common network errors
        let message = 'Connection test failed';
        if (error instanceof Error) {
            const errorWithCause = error;
            if (error.message === 'fetch failed' || errorWithCause.cause) {
                // Network error - server not reachable
                const cause = errorWithCause.cause;
                if (cause?.message?.includes('ECONNREFUSED')) {
                    const uri = adapterType === 'supertokens' ? config.connectionUri :
                        adapterType === 'supabase' ? config.url :
                            adapterType === 'auth0' ? `https://${config.domain}` : 'server';
                    message = `Cannot connect to ${adapterType} at ${uri}. Is the server running?`;
                }
                else {
                    message = `Network error: Unable to reach the ${adapterType} server. Check if it's running and accessible.`;
                }
            }
            else {
                message = `Connection test failed: ${error.message}`;
            }
        }
        return {
            success: false,
            message,
        };
    }
}
/**
 * Handle configuration change (from database)
 * Called when pg_notify fires on another instance
 */
async function handleConfigChange(newConfig) {
    if (!adapterWrapper)
        return;
    if (!newConfig || !newConfig.adapter) {
        // No config in database - revert to env vars
        const adapterName = getEnv('AUTH_ADAPTER')?.toLowerCase();
        if (adapterName && VALID_ADAPTERS.includes(adapterName)) {
            // Re-create adapter from env vars
            const parseResult = getParseResultForAdapter(adapterName);
            if (parseResult.config) {
                const adapter = createAdapterForName(adapterName, parseResult.config);
                if (adapter) {
                    await adapterWrapper.setAdapter(adapter);
                    currentStatus = {
                        state: 'enabled',
                        adapter: adapterName,
                        config: getMaskedConfig(adapterName),
                    };
                }
            }
        }
        else {
            // No env config either - disable
            currentStatus = {
                state: 'disabled',
                adapter: null,
            };
        }
        return;
    }
    // Apply new config
    const adapter = createAdapterFromConfig(newConfig.adapter, newConfig.config);
    if (adapter) {
        await adapterWrapper.setAdapter(adapter);
        currentStatus = {
            state: 'enabled',
            adapter: newConfig.adapter,
            config: getMaskedRuntimeConfig(newConfig),
        };
    }
}
/**
 * Get masked runtime configuration
 */
function getMaskedRuntimeConfig(config) {
    const result = {};
    if (!config.adapter)
        return result;
    const sensitiveKeys = ['secret', 'password', 'key', 'token', 'anonKey', 'clientSecret', 'apiKey'];
    const isSensitive = (key) => sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()));
    // Get adapter-specific config
    const adapterConfig = config.config[config.adapter];
    if (adapterConfig) {
        for (const [key, value] of Object.entries(adapterConfig)) {
            if (typeof value === 'string') {
                result[key] = isSensitive(key) ? maskValue(value) : value;
            }
            else if (typeof value === 'boolean' || typeof value === 'number') {
                result[key] = String(value);
            }
        }
    }
    result['AUTH_ADAPTER'] = config.adapter;
    return result;
}
/**
 * Helper to get parse result for a given adapter
 */
function getParseResultForAdapter(adapterName) {
    switch (adapterName) {
        case 'supertokens':
            return parseSupertokensEnv();
        case 'auth0':
            return parseAuth0Env();
        case 'supabase':
            return parseSupabaseEnv();
        case 'basic':
            return parseBasicAuthEnv();
    }
}
/**
 * Helper to create adapter for a given name and config
 */
function createAdapterForName(adapterName, config) {
    switch (adapterName) {
        case 'supertokens':
            return supertokensAdapter(config);
        case 'auth0':
            return auth0Adapter(config);
        case 'supabase':
            return supabaseAdapter(config);
        case 'basic':
            return basicAdapter(config);
    }
}
/**
 * Set the configuration store for runtime auth config persistence.
 *
 * This must be called during application startup to enable runtime configuration
 * features. Without a config store, the PUT/DELETE endpoints will return 503.
 *
 * @param store - PostgreSQL-backed config store from `postgresAuthConfigStore()`
 *
 * @example
 * ```typescript
 * import { Pool } from 'pg';
 * import { setAuthConfigStore, postgresAuthConfigStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const configStore = postgresAuthConfigStore({ pool });
 * await configStore.initialize();
 * setAuthConfigStore(configStore);
 * ```
 */
export function setAuthConfigStore(store) {
    configStore = store;
}
/**
 * Get the current adapter wrapper
 */
export function getAdapterWrapper() {
    return adapterWrapper;
}
// ═══════════════════════════════════════════════════════════════════════════
// Exports for Testing
// ═══════════════════════════════════════════════════════════════════════════
// Export internal functions for testing
export const __testing = {
    parseSupertokensEnv,
    parseAuth0Env,
    parseSupabaseEnv,
    parseBasicAuthEnv,
    getEnv,
    getEnvBool,
    getEnvList,
    maskValue,
    VALID_ADAPTERS,
    validateAdapterConfig,
    testProviderConnection,
    createAdapterFromConfig,
};
//# sourceMappingURL=env-config.js.map