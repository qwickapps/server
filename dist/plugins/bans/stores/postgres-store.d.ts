/**
 * PostgreSQL Ban Store
 *
 * Ban storage implementation using PostgreSQL.
 * Requires the 'pg' package and the Users plugin to be installed.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { BanStore, PostgresBanStoreConfig } from '../types.js';
/**
 * Create a PostgreSQL ban store
 *
 * @param config Configuration including a pg Pool instance or a function that returns one
 * @returns BanStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresBanStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresBanStore({ pool });
 *
 * // Or with lazy initialization:
 * const store = postgresBanStore({ pool: () => getPostgres().getPool() });
 * ```
 */
export declare function postgresBanStore(config: PostgresBanStoreConfig): BanStore;
//# sourceMappingURL=postgres-store.d.ts.map