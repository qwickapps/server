/**
 * Auth Plugin Environment Configuration
 *
 * Factory function and utilities for configuring auth adapters via environment variables.
 * Supports all adapters: Auth0, Supabase, Supertokens, Basic.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin, PluginRegistry } from '../../core/plugin-registry.js';
import type { AuthAdapter, Auth0AdapterConfig, SupabaseAdapterConfig, SupertokensAdapterConfig, BasicAdapterConfig, AuthEnvPluginOptions, AuthConfigStatus, AuthAdapterType, RuntimeAuthConfig, TestProviderResponse, AuthConfigStore } from './types.js';
import { type AdapterWrapper } from './adapter-wrapper.js';
/**
 * Get an environment variable, treating empty strings as undefined
 */
declare function getEnv(key: string): string | undefined;
/**
 * Parse a boolean environment variable
 * Supports: true/false, 1/0, yes/no (case-insensitive)
 */
declare function getEnvBool(key: string, defaultValue: boolean): boolean;
/**
 * Parse a comma-separated list environment variable
 */
declare function getEnvList(key: string): string[] | undefined;
/**
 * Mask a sensitive value for display
 */
declare function maskValue(value: string): string;
interface EnvParseResult<T> {
    config: T | null;
    errors: string[];
}
/**
 * Parse Supertokens configuration from environment variables
 */
declare function parseSupertokensEnv(): EnvParseResult<SupertokensAdapterConfig>;
/**
 * Parse Auth0 configuration from environment variables
 */
declare function parseAuth0Env(): EnvParseResult<Auth0AdapterConfig>;
/**
 * Parse Supabase configuration from environment variables
 */
declare function parseSupabaseEnv(): EnvParseResult<SupabaseAdapterConfig>;
/**
 * Parse Basic Auth configuration from environment variables
 */
declare function parseBasicAuthEnv(): EnvParseResult<BasicAdapterConfig>;
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
export declare function createAuthPluginFromEnv(options?: AuthEnvPluginOptions): Plugin;
/**
 * Get current auth plugin status
 */
export declare function getAuthStatus(): AuthConfigStatus;
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
export declare function registerAuthConfigRoutes(registry: PluginRegistry): void;
/**
 * Extended options for createAuthPluginFromEnv with runtime config support
 */
export interface AuthEnvPluginOptionsExtended extends AuthEnvPluginOptions {
    /** Configuration store for runtime config persistence */
    configStore?: AuthConfigStore;
}
/**
 * Create an adapter from runtime configuration
 */
declare function createAdapterFromConfig(adapterType: AuthAdapterType, config: RuntimeAuthConfig['config']): AuthAdapter | null;
/**
 * Validate adapter configuration
 */
declare function validateAdapterConfig(adapterType: AuthAdapterType, config: Record<string, unknown>): {
    valid: boolean;
    errors: string[];
};
/**
 * Test a provider connection
 */
declare function testProviderConnection(adapterType: AuthAdapterType, config: Record<string, unknown>): Promise<TestProviderResponse>;
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
export declare function setAuthConfigStore(store: AuthConfigStore): void;
/**
 * Get the current adapter wrapper
 */
export declare function getAdapterWrapper(): AdapterWrapper | null;
export declare const __testing: {
    parseSupertokensEnv: typeof parseSupertokensEnv;
    parseAuth0Env: typeof parseAuth0Env;
    parseSupabaseEnv: typeof parseSupabaseEnv;
    parseBasicAuthEnv: typeof parseBasicAuthEnv;
    getEnv: typeof getEnv;
    getEnvBool: typeof getEnvBool;
    getEnvList: typeof getEnvList;
    maskValue: typeof maskValue;
    VALID_ADAPTERS: readonly ["supertokens", "auth0", "supabase", "basic"];
    validateAdapterConfig: typeof validateAdapterConfig;
    testProviderConnection: typeof testProviderConnection;
    createAdapterFromConfig: typeof createAdapterFromConfig;
};
export {};
//# sourceMappingURL=env-config.d.ts.map