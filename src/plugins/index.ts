/**
 * Built-in plugins for @qwickapps/server
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

export { createHealthPlugin } from './health-plugin.js';
export type { HealthPluginConfig } from './health-plugin.js';

export { createLogsPlugin } from './logs-plugin.js';
export type { LogsPluginConfig } from './logs-plugin.js';

export { createConfigPlugin } from './config-plugin.js';
export type { ConfigPluginConfig } from './config-plugin.js';

export { createDiagnosticsPlugin } from './diagnostics-plugin.js';
export type { DiagnosticsPluginConfig } from './diagnostics-plugin.js';

export { createFrontendAppPlugin } from './frontend-app-plugin.js';
export type { FrontendAppPluginConfig } from './frontend-app-plugin.js';

export { createPostgresPlugin, getPostgres, hasPostgres } from './postgres-plugin.js';
export type { PostgresPluginConfig, PostgresInstance, TransactionCallback } from './postgres-plugin.js';

// Backward compatibility aliases (deprecated)
export { createPostgresPlugin as createDatabasePlugin, getPostgres as getDatabase, hasPostgres as hasDatabase } from './postgres-plugin.js';
export type { PostgresPluginConfig as DatabasePluginConfig, PostgresInstance as DatabaseInstance } from './postgres-plugin.js';

export { createCachePlugin, getCache, hasCache } from './cache-plugin.js';
export type { CachePluginConfig, CacheInstance } from './cache-plugin.js';
