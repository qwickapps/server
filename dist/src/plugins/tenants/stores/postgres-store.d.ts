/**
 * PostgreSQL Tenant Store
 *
 * Tenant storage implementation using PostgreSQL.
 * Requires the 'pg' package to be installed.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { TenantStore, PostgresTenantStoreConfig } from '../types.js';
/**
 * Create a PostgreSQL tenant store
 *
 * @param config Configuration including a pg Pool instance
 * @returns TenantStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresTenantStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresTenantStore({ pool });
 * ```
 */
export declare function postgresTenantStore(config: PostgresTenantStoreConfig): TenantStore;
//# sourceMappingURL=postgres-store.d.ts.map