/**
 * PostgreSQL User Store
 *
 * User storage implementation using PostgreSQL.
 * Requires the 'pg' package to be installed.
 *
 * Note: Ban management is handled by the separate Bans Plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { UserStore, PostgresUserStoreConfig } from '../types.js';
/**
 * Create a PostgreSQL user store
 *
 * @param config Configuration including a pg Pool instance
 * @returns UserStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresUserStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresUserStore({ pool });
 * ```
 */
export declare function postgresUserStore(config: PostgresUserStoreConfig): UserStore;
//# sourceMappingURL=postgres-store.d.ts.map