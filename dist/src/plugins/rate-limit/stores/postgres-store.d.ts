/**
 * PostgreSQL Rate Limit Store
 *
 * Rate limit storage implementation using PostgreSQL with Row-Level Security (RLS).
 * Follows the same pattern as the preferences plugin's postgres-store.
 *
 * RLS Context Pattern:
 * Each operation uses an explicit transaction and sets `app.current_user_id`
 * as a transaction-local configuration variable. The RLS policy checks this
 * variable to enforce that users can only access their own rate limits.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { RateLimitStore, PostgresRateLimitStoreConfig } from '../types.js';
/**
 * Create a PostgreSQL rate limit store with RLS
 *
 * @param config Configuration including a pg Pool instance
 * @returns RateLimitStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresRateLimitStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresRateLimitStore({ pool });
 *
 * // Or with lazy initialization:
 * const store = postgresRateLimitStore({ pool: () => getPostgres().getPool() });
 * ```
 */
export declare function postgresRateLimitStore(config: PostgresRateLimitStoreConfig): RateLimitStore;
//# sourceMappingURL=postgres-store.d.ts.map