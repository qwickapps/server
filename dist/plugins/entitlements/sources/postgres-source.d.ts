/**
 * PostgreSQL Entitlement Source
 *
 * Entitlement storage implementation using PostgreSQL.
 * Stores user entitlements and entitlement definitions.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { EntitlementSource, PostgresEntitlementSourceConfig } from '../types.js';
/**
 * Create a PostgreSQL entitlement source
 *
 * @param config Configuration including a pg Pool instance or a function that returns one
 * @returns EntitlementSource implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresEntitlementSource } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const source = postgresEntitlementSource({ pool });
 *
 * // Or with lazy initialization:
 * const source = postgresEntitlementSource({ pool: () => getPostgres().getPool() });
 * ```
 */
export declare function postgresEntitlementSource(config: PostgresEntitlementSourceConfig): EntitlementSource;
//# sourceMappingURL=postgres-source.d.ts.map