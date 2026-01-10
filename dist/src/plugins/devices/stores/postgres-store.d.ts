/**
 * PostgreSQL Device Store
 *
 * Device storage implementation using PostgreSQL.
 * Supports multi-tenant isolation via org_id.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { DeviceStore, PostgresDeviceStoreConfig } from '../types.js';
/**
 * Create a PostgreSQL device store
 *
 * @param config Configuration including a pg Pool instance
 * @returns DeviceStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresDeviceStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresDeviceStore({ pool });
 * ```
 */
export declare function postgresDeviceStore(config: PostgresDeviceStoreConfig): DeviceStore;
//# sourceMappingURL=postgres-store.d.ts.map