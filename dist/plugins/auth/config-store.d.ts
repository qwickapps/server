/**
 * Auth Configuration Store
 *
 * PostgreSQL-based storage for runtime auth configuration.
 * Supports pg_notify for cross-instance hot-reload in scaled deployments.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { AuthConfigStore, PostgresAuthConfigStoreConfig } from './types.js';
export declare function postgresAuthConfigStore(config: PostgresAuthConfigStoreConfig): AuthConfigStore;
//# sourceMappingURL=config-store.d.ts.map