/**
 * @qwickapps/server
 *
 * Independent control panel and management UI for QwickApps services
 * Runs on a separate port, provides health checks, logs, config, and diagnostics
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

// Core exports
export { createControlPanel } from './core/control-panel.js';
export { createGateway } from './core/gateway.js';
export { HealthManager } from './core/health-manager.js';

// Guards exports
export {
  createRouteGuard,
  isAuthenticated,
  getAuthenticatedUser,
} from './core/guards.js';

// Logging exports
export {
  initializeLogging,
  getControlPanelLogger,
  getLoggingSubsystem,
} from './core/logging.js';
export type { LoggingConfig } from './core/logging.js';

export type {
  ControlPanelConfig,
  ControlPanelPlugin,
  ControlPanelInstance,
  PluginContext,
  HealthCheck,
  HealthCheckType,
  HealthCheckResult,
  HealthStatus,
  LogSource,
  ConfigDisplayOptions,
  Logger,
  DiagnosticsReport,
  // New mount path and guard types
  RouteGuardType,
  RouteGuardConfig,
  BasicAuthGuardConfig,
  SupabaseAuthGuardConfig,
  Auth0GuardConfig,
  NoAuthGuardConfig,
  MountConfig,
  FrontendAppConfig,
} from './core/types.js';
export type {
  GatewayConfig,
  GatewayInstance,
  ServiceFactory,
} from './core/gateway.js';

// Built-in plugins
export {
  createHealthPlugin,
  createLogsPlugin,
  createConfigPlugin,
  createDiagnosticsPlugin,
  createFrontendAppPlugin,
  // Database plugins
  createPostgresPlugin,
  getPostgres,
  hasPostgres,
  // Backward compatibility aliases (deprecated)
  createPostgresPlugin as createDatabasePlugin,
  getPostgres as getDatabase,
  hasPostgres as hasDatabase,
  // Cache plugins
  createCachePlugin,
  getCache,
  hasCache,
} from './plugins/index.js';
export type {
  HealthPluginConfig,
  LogsPluginConfig,
  ConfigPluginConfig,
  DiagnosticsPluginConfig,
  FrontendAppPluginConfig,
  // Database plugin types
  PostgresPluginConfig,
  PostgresInstance,
  TransactionCallback,
  // Backward compatibility aliases (deprecated)
  PostgresPluginConfig as DatabasePluginConfig,
  PostgresInstance as DatabaseInstance,
  // Cache plugin types
  CachePluginConfig,
  CacheInstance,
} from './plugins/index.js';
