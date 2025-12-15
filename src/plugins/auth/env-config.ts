/**
 * Auth Plugin Environment Configuration
 *
 * Factory function and utilities for configuring auth adapters via environment variables.
 * Supports all adapters: Auth0, Supabase, Supertokens, Basic.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type {
  AuthPluginConfig,
  Auth0AdapterConfig,
  SupabaseAdapterConfig,
  SupertokensAdapterConfig,
  BasicAdapterConfig,
  AuthEnvPluginOptions,
  AuthConfigStatus,
  AuthPluginState,
} from './types.js';
import { createAuthPlugin } from './auth-plugin.js';
import { auth0Adapter } from './adapters/auth0-adapter.js';
import { supabaseAdapter } from './adapters/supabase-adapter.js';
import { supertokensAdapter } from './adapters/supertokens-adapter.js';
import { basicAdapter } from './adapters/basic-adapter.js';

// ═══════════════════════════════════════════════════════════════════════════
// Module State
// ═══════════════════════════════════════════════════════════════════════════

let currentStatus: AuthConfigStatus = {
  state: 'disabled',
  adapter: null,
};

// ═══════════════════════════════════════════════════════════════════════════
// Environment Variable Helpers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get an environment variable, treating empty strings as undefined
 */
function getEnv(key: string): string | undefined {
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
function getEnvBool(key: string, defaultValue: boolean): boolean {
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
function getEnvList(key: string): string[] | undefined {
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
function maskValue(value: string): string {
  if (value.length <= 4) {
    return '****';
  }
  return value.substring(0, 2) + '*'.repeat(Math.min(value.length - 4, 20)) + value.substring(value.length - 2);
}

// ═══════════════════════════════════════════════════════════════════════════
// Environment Parsers
// ═══════════════════════════════════════════════════════════════════════════

interface EnvParseResult<T> {
  config: T | null;
  errors: string[];
}

/**
 * Parse Supertokens configuration from environment variables
 */
function parseSupertokensEnv(): EnvParseResult<SupertokensAdapterConfig> {
  const errors: string[] = [];

  const connectionUri = getEnv('SUPERTOKENS_CONNECTION_URI');
  const appName = getEnv('SUPERTOKENS_APP_NAME');
  const apiDomain = getEnv('SUPERTOKENS_API_DOMAIN');
  const websiteDomain = getEnv('SUPERTOKENS_WEBSITE_DOMAIN');

  // Check required vars
  if (!connectionUri) errors.push('SUPERTOKENS_CONNECTION_URI');
  if (!appName) errors.push('SUPERTOKENS_APP_NAME');
  if (!apiDomain) errors.push('SUPERTOKENS_API_DOMAIN');
  if (!websiteDomain) errors.push('SUPERTOKENS_WEBSITE_DOMAIN');

  if (errors.length > 0) {
    return { config: null, errors };
  }

  // Build config
  const config: SupertokensAdapterConfig = {
    connectionUri: connectionUri!,
    appName: appName!,
    apiDomain: apiDomain!,
    websiteDomain: websiteDomain!,
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
function parseAuth0Env(): EnvParseResult<Auth0AdapterConfig> {
  const errors: string[] = [];

  const domain = getEnv('AUTH0_DOMAIN');
  const clientId = getEnv('AUTH0_CLIENT_ID');
  const clientSecret = getEnv('AUTH0_CLIENT_SECRET');
  const baseUrl = getEnv('AUTH0_BASE_URL');
  const secret = getEnv('AUTH0_SECRET');

  // Check required vars
  if (!domain) errors.push('AUTH0_DOMAIN');
  if (!clientId) errors.push('AUTH0_CLIENT_ID');
  if (!clientSecret) errors.push('AUTH0_CLIENT_SECRET');
  if (!baseUrl) errors.push('AUTH0_BASE_URL');
  if (!secret) errors.push('AUTH0_SECRET');

  if (errors.length > 0) {
    return { config: null, errors };
  }

  // Build config
  const config: Auth0AdapterConfig = {
    domain: domain!,
    clientId: clientId!,
    clientSecret: clientSecret!,
    baseUrl: baseUrl!,
    secret: secret!,
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
function parseSupabaseEnv(): EnvParseResult<SupabaseAdapterConfig> {
  const errors: string[] = [];

  const url = getEnv('SUPABASE_URL');
  const anonKey = getEnv('SUPABASE_ANON_KEY');

  // Check required vars
  if (!url) errors.push('SUPABASE_URL');
  if (!anonKey) errors.push('SUPABASE_ANON_KEY');

  if (errors.length > 0) {
    return { config: null, errors };
  }

  const config: SupabaseAdapterConfig = {
    url: url!,
    anonKey: anonKey!,
  };

  return { config, errors: [] };
}

/**
 * Parse Basic Auth configuration from environment variables
 */
function parseBasicAuthEnv(): EnvParseResult<BasicAdapterConfig> {
  const errors: string[] = [];

  const username = getEnv('BASIC_AUTH_USERNAME');
  const password = getEnv('BASIC_AUTH_PASSWORD');

  // Check required vars
  if (!username) errors.push('BASIC_AUTH_USERNAME');
  if (!password) errors.push('BASIC_AUTH_PASSWORD');

  if (errors.length > 0) {
    return { config: null, errors };
  }

  const config: BasicAdapterConfig = {
    username: username!,
    password: password!,
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
const VALID_ADAPTERS = ['supertokens', 'auth0', 'supabase', 'basic'] as const;
type AdapterName = (typeof VALID_ADAPTERS)[number];

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
export function createAuthPluginFromEnv(options?: AuthEnvPluginOptions): Plugin {
  const adapterName = getEnv('AUTH_ADAPTER')?.toLowerCase();

  // No adapter specified - return disabled plugin
  if (!adapterName) {
    currentStatus = {
      state: 'disabled',
      adapter: null,
    };
    return createDisabledPlugin();
  }

  // Validate adapter name
  if (!VALID_ADAPTERS.includes(adapterName as AdapterName)) {
    const error = `Invalid AUTH_ADAPTER value: "${adapterName}". Valid options: ${VALID_ADAPTERS.join(', ')}`;
    currentStatus = {
      state: 'error',
      adapter: null,
      error,
    };
    return createErrorPlugin(error);
  }

  // Parse adapter-specific configuration
  let parseResult: EnvParseResult<
    Auth0AdapterConfig | SupabaseAdapterConfig | SupertokensAdapterConfig | BasicAdapterConfig
  >;

  switch (adapterName as AdapterName) {
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
  switch (adapterName as AdapterName) {
    case 'supertokens':
      adapter = supertokensAdapter(parseResult.config as SupertokensAdapterConfig);
      break;
    case 'auth0':
      adapter = auth0Adapter(parseResult.config as Auth0AdapterConfig);
      break;
    case 'supabase':
      adapter = supabaseAdapter(parseResult.config as SupabaseAdapterConfig);
      break;
    case 'basic':
      adapter = basicAdapter(parseResult.config as BasicAdapterConfig);
      break;
  }

  // Build plugin configuration
  const excludePaths = options?.excludePaths ?? getEnvList('AUTH_EXCLUDE_PATHS') ?? [];
  const authRequired = options?.authRequired ?? getEnvBool('AUTH_REQUIRED', true);
  const debug = options?.debug ?? getEnvBool('AUTH_DEBUG', false);

  const pluginConfig: AuthPluginConfig = {
    adapter,
    excludePaths,
    authRequired,
    debug,
    onUnauthorized: options?.onUnauthorized,
  };

  // Update status
  currentStatus = {
    state: 'enabled',
    adapter: adapterName,
    config: getMaskedConfig(adapterName as AdapterName),
  };

  // Create the plugin
  const basePlugin = createAuthPlugin(pluginConfig);

  // Wrap to add config status routes
  return {
    ...basePlugin,
    async onStart(pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      // Call base plugin onStart
      await basePlugin.onStart?.(pluginConfig, registry);

      // Add config status routes
      registerConfigRoutes(registry);
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Status & Config API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get current auth plugin status
 */
export function getAuthStatus(): AuthConfigStatus {
  return { ...currentStatus };
}

/**
 * Get masked configuration for the current adapter
 */
function getMaskedConfig(adapter: AdapterName): Record<string, string> {
  const config: Record<string, string> = {};

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

  const isSensitive = (key: string): boolean => {
    const upper = key.toUpperCase();
    return sensitiveKeys.some((s) => upper.includes(s));
  };

  // Get all env vars for the adapter
  const prefixes: Record<AdapterName, string[]> = {
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
 */
function registerConfigRoutes(registry: PluginRegistry): void {
  // GET /api/auth/config/status - Get current auth status
  registry.addRoute({
    method: 'get',
    path: '/api/auth/config/status',
    pluginId: 'auth',
    handler: (_req: Request, res: Response) => {
      res.json(getAuthStatus());
    },
  });

  // GET /api/auth/config - Get current configuration (masked)
  registry.addRoute({
    method: 'get',
    path: '/api/auth/config',
    pluginId: 'auth',
    handler: (_req: Request, res: Response) => {
      const status = getAuthStatus();
      res.json({
        state: status.state,
        adapter: status.adapter,
        config: status.config || {},
        error: status.error,
        missingVars: status.missingVars,
      });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Disabled & Error Plugins
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a disabled plugin (no auth middleware)
 */
function createDisabledPlugin(): Plugin {
  return {
    id: 'auth',
    name: 'Auth Plugin (Disabled)',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      const logger = registry.getLogger('auth');
      logger.info('Auth plugin disabled - AUTH_ADAPTER not set');

      // Register status routes even when disabled
      registerConfigRoutes(registry);
    },

    async onStop(): Promise<void> {
      // Nothing to cleanup
    },
  };
}

/**
 * Create an error plugin (auth disabled due to configuration error)
 */
function createErrorPlugin(error: string): Plugin {
  return {
    id: 'auth',
    name: 'Auth Plugin (Error)',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      const logger = registry.getLogger('auth');
      logger.error(`Auth plugin error: ${error}`);

      // Register status routes so admin can see the error
      registerConfigRoutes(registry);
    },

    async onStop(): Promise<void> {
      // Nothing to cleanup
    },
  };
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
};
