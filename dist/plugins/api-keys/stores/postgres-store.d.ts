/**
 * PostgreSQL API Keys Store
 *
 * API key storage implementation using PostgreSQL with Row-Level Security (RLS).
 * Uses SHA-256 for token hashing (high-entropy keys don't need bcrypt's slowness).
 *
 * RLS Context Pattern:
 * Each operation uses an explicit transaction and sets `app.current_user_id`
 * as a transaction-local configuration variable. The RLS policy checks this
 * variable to enforce that users can only access their own API keys.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { ApiKeyStore, PostgresApiKeyStoreConfig } from '../types.js';
/**
 * Create a PostgreSQL API keys store with RLS
 *
 * @param config Configuration including a pg Pool instance
 * @returns ApiKeyStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresApiKeyStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresApiKeyStore({ pool });
 *
 * // Or with lazy initialization:
 * const store = postgresApiKeyStore({ pool: () => getPostgres().getPool() });
 * ```
 */
export declare function postgresApiKeyStore(config: PostgresApiKeyStoreConfig): ApiKeyStore;
//# sourceMappingURL=postgres-store.d.ts.map