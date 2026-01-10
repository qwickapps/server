/**
 * Rate Limit Plugin Environment Configuration
 *
 * Factory function for configuring rate limiting via environment variables.
 *
 * Environment Variables:
 * - RATE_LIMIT_ENABLED: Enable rate limiting (default: true)
 * - RATE_LIMIT_STRATEGY: Strategy to use: sliding-window, fixed-window, token-bucket (default: sliding-window)
 * - RATE_LIMIT_WINDOW_MS: Window size in milliseconds (default: 60000 = 1 minute)
 * - RATE_LIMIT_MAX_REQUESTS: Maximum requests per window (default: 100)
 * - RATE_LIMIT_CACHE_TYPE: Cache type: redis, memory, auto (default: auto)
 * - RATE_LIMIT_CLEANUP_ENABLED: Enable cleanup job (default: true)
 * - RATE_LIMIT_CLEANUP_INTERVAL_MS: Cleanup interval in ms (default: 300000 = 5 minutes)
 * - RATE_LIMIT_API_ENABLED: Enable status API endpoints (default: true)
 * - RATE_LIMIT_API_PREFIX: API route prefix (default: /rate-limit)
 * - RATE_LIMIT_DEBUG: Enable debug logging (default: false)
 *
 * PostgreSQL Store (via postgres-plugin):
 * - RATE_LIMIT_TABLE_NAME: Table name (default: rate_limits)
 * - RATE_LIMIT_ENABLE_RLS: Enable Row-Level Security (default: true)
 * - RATE_LIMIT_AUTO_CREATE_TABLES: Auto-create tables (default: true)
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
import type { RateLimitPluginConfig, RateLimitStrategy } from './types.js';
interface RateLimitConfigStatus {
    state: 'disabled' | 'enabled' | 'error';
    strategy: RateLimitStrategy | null;
    error?: string;
    config?: Record<string, string | number | boolean>;
}
/**
 * Get an environment variable, treating empty strings as undefined
 */
declare function getEnv(key: string): string | undefined;
/**
 * Parse a boolean environment variable
 */
declare function getEnvBool(key: string, defaultValue: boolean): boolean;
/**
 * Parse an integer environment variable
 */
declare function getEnvInt(key: string, defaultValue: number): number;
export interface RateLimitEnvPluginOptions {
    /**
     * Override the default store. If not provided, uses postgres-plugin.
     */
    store?: RateLimitPluginConfig['store'];
    /**
     * Debug mode override
     */
    debug?: boolean;
}
/**
 * Create a rate limit plugin configured from environment variables.
 *
 * The plugin state depends on environment configuration:
 * - **disabled**: RATE_LIMIT_ENABLED=false - no rate limiting is applied
 * - **enabled**: Valid configuration - rate limiting is active
 * - **error**: Invalid configuration or missing postgres - plugin is disabled with error details
 *
 * @example
 * ```typescript
 * // Zero-config setup - reads everything from env vars
 * // Requires postgres-plugin to be registered first
 * const rateLimitPlugin = createRateLimitPluginFromEnv();
 *
 * // With custom store
 * const rateLimitPlugin = createRateLimitPluginFromEnv({
 *   store: myCustomStore,
 * });
 * ```
 *
 * @param options - Optional overrides
 * @returns A Plugin instance
 */
export declare function createRateLimitPluginFromEnv(options?: RateLimitEnvPluginOptions): Plugin;
/**
 * Get current rate limit plugin status
 */
export declare function getRateLimitConfigStatus(): RateLimitConfigStatus;
export declare const __testing: {
    getEnv: typeof getEnv;
    getEnvBool: typeof getEnvBool;
    getEnvInt: typeof getEnvInt;
    VALID_STRATEGIES: RateLimitStrategy[];
    VALID_CACHE_TYPES: ("redis" | "memory" | "auto" | undefined)[];
};
export {};
//# sourceMappingURL=env-config.d.ts.map