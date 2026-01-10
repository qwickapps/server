/**
 * PostgreSQL Preferences Store
 *
 * Preferences storage implementation using PostgreSQL with Row-Level Security (RLS).
 * Requires the 'pg' package and the Users plugin to be installed.
 *
 * RLS Context Pattern:
 * Each operation uses an explicit transaction and sets `app.current_user_id`
 * as a transaction-local configuration variable. The RLS policy checks this
 * variable to enforce that users can only access their own preferences.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { PreferencesStore, PostgresPreferencesStoreConfig } from '../types.js';
/**
 * Deep merge two objects
 * - Objects are recursively merged
 * - Arrays are replaced (not merged)
 * - Source values override target values
 */
export declare function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown>;
/**
 * Create a PostgreSQL preferences store with RLS
 *
 * @param config Configuration including a pg Pool instance
 * @returns PreferencesStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresPreferencesStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresPreferencesStore({ pool });
 *
 * // Or with lazy initialization:
 * const store = postgresPreferencesStore({ pool: () => getPostgres().getPool() });
 * ```
 */
export declare function postgresPreferencesStore(config: PostgresPreferencesStoreConfig): PreferencesStore;
//# sourceMappingURL=postgres-store.d.ts.map