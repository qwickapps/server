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
export type { CreateControlPanelOptions } from './core/control-panel.js';
export { createGateway } from './core/gateway.js';
export { HealthManager } from './core/health-manager.js';

// Plugin Registry exports (event-driven architecture v2.0)
export {
  createPluginRegistry,
  getPluginRegistry,
  hasPluginRegistry,
  resetPluginRegistry,
  PluginRegistryImpl,
} from './core/plugin-registry.js';
export type {
  Plugin,
  PluginConfig,
  PluginEvent,
  PluginEventHandler,
  PluginRegistry,
  PluginInfo,
  MenuContribution,
  PageContribution,
  WidgetContribution,
  RouteDefinition,
} from './core/plugin-registry.js';

// Route guards (for control panel protection)
export { createRouteGuard } from './core/guards.js';

// Logging exports
export {
  initializeLogging,
  getControlPanelLogger,
  getLoggingSubsystem,
} from './core/logging.js';
export type { LoggingConfig } from './core/logging.js';

export type {
  ControlPanelConfig,
  ControlPanelInstance,
  HealthCheck,
  HealthCheckType,
  HealthCheckResult,
  HealthStatus,
  LogSource,
  ConfigDisplayOptions,
  Logger,
  DiagnosticsReport,
  // Route guard types
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
  MountedAppConfig,
} from './core/gateway.js';

// Built-in plugins
export {
  createHealthPlugin,
  createLogsPlugin,
  createConfigPlugin,
  createDiagnosticsPlugin,
  createFrontendAppPlugin,
  // Postgres plugin
  createPostgresPlugin,
  getPostgres,
  hasPostgres,
  // Cache plugin
  createCachePlugin,
  getCache,
  hasCache,
  // Auth plugin
  createAuthPlugin,
  isAuthenticated,
  getAuthenticatedUser,
  getAccessToken,
  requireAuth,
  requireRoles,
  requireAnyRole,
  auth0Adapter,
  basicAdapter,
  supabaseAdapter,
  isAuthenticatedRequest,
  // Users plugin
  createUsersPlugin,
  getUserStore,
  getUserById,
  getUserByEmail,
  findOrCreateUser,
  postgresUserStore,
  // Bans plugin (separate from Users, depends on Users)
  createBansPlugin,
  getBanStore,
  isUserBanned,
  isEmailBanned,
  getActiveBan,
  banUser,
  unbanUser,
  listActiveBans,
  postgresBanStore,
  // Entitlements plugin
  createEntitlementsPlugin,
  getEntitlementSource,
  isSourceReadonly,
  getEntitlements,
  refreshEntitlements,
  hasEntitlement,
  hasAnyEntitlement,
  hasAllEntitlements,
  grantEntitlement,
  revokeEntitlement,
  setEntitlements,
  getAvailableEntitlements,
  getEntitlementStats,
  invalidateEntitlementCache,
  storeExternalIdMapping,
  invalidateByExternalId,
  requireEntitlement,
  requireAnyEntitlement,
  requireAllEntitlements,
  postgresEntitlementSource,
} from './plugins/index.js';
export type {
  HealthPluginConfig,
  LogsPluginConfig,
  ConfigPluginConfig,
  DiagnosticsPluginConfig,
  FrontendAppPluginConfig,
  // Postgres plugin types
  PostgresPluginConfig,
  PostgresInstance,
  TransactionCallback,
  // Cache plugin types
  CachePluginConfig,
  CacheInstance,
  // Auth plugin types
  AuthPluginConfig,
  AuthAdapter,
  AuthenticatedUser,
  AuthenticatedRequest,
  Auth0AdapterConfig,
  SupabaseAdapterConfig,
  BasicAdapterConfig,
  // Users plugin types
  UsersPluginConfig,
  UserStore,
  User,
  CreateUserInput,
  UpdateUserInput,
  UserSearchParams,
  UserListResponse,
  PostgresUserStoreConfig,
  UserSyncConfig,
  UsersApiConfig,
  UsersUiConfig,
  // Bans plugin types
  BansPluginConfig,
  BanStore,
  Ban,
  CreateBanInput,
  RemoveBanInput,
  BanCallbacks,
  PostgresBanStoreConfig,
  // Entitlements plugin types
  EntitlementsPluginConfig,
  EntitlementSource,
  EntitlementResult,
  EntitlementDefinition,
  EntitlementCallbacks,
  EntitlementsCacheConfig,
  EntitlementsApiConfig,
  PostgresEntitlementSourceConfig,
  UserEntitlement,
  CachedEntitlements,
  EntitlementStats,
} from './plugins/index.js';
