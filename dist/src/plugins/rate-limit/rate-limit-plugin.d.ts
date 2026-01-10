/**
 * Rate Limit Plugin
 *
 * Provides rate limiting capabilities for @qwickapps/server.
 * Includes PostgreSQL persistence with RLS, caching, multiple strategies,
 * and Express middleware.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
import type { RateLimitPluginConfig } from './types.js';
/**
 * Create the Rate Limit plugin
 *
 * @param config Plugin configuration
 * @returns Plugin instance
 *
 * @example
 * ```ts
 * import {
 *   createGateway,
 *   createRateLimitPlugin,
 *   postgresRateLimitStore,
 *   getPostgres,
 * } from '@qwickapps/server';
 *
 * const gateway = createGateway({
 *   plugins: [
 *     createRateLimitPlugin({
 *       store: postgresRateLimitStore({
 *         pool: () => getPostgres().getPool(),
 *       }),
 *       defaults: {
 *         windowMs: 60000,
 *         maxRequests: 100,
 *         strategy: 'sliding-window',
 *       },
 *     }),
 *   ],
 * });
 * ```
 */
export declare function createRateLimitPlugin(config: RateLimitPluginConfig): Plugin;
//# sourceMappingURL=rate-limit-plugin.d.ts.map