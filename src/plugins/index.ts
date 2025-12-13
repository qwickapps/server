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

export { createCachePlugin, getCache, hasCache } from './cache-plugin.js';
export type { CachePluginConfig, CacheInstance } from './cache-plugin.js';

// Auth plugin
export {
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
} from './auth/index.js';
export type {
  AuthPluginConfig,
  AuthAdapter,
  AuthenticatedUser,
  AuthenticatedRequest,
  Auth0AdapterConfig,
  SupabaseAdapterConfig,
  BasicAdapterConfig,
} from './auth/index.js';

// Users plugin
export {
  createUsersPlugin,
  getUserStore,
  getUserById,
  getUserByEmail,
  findOrCreateUser,
  postgresUserStore,
} from './users/index.js';
export type {
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
} from './users/index.js';

// Bans plugin (separate from Users, depends on Users)
export {
  createBansPlugin,
  getBanStore,
  isUserBanned,
  isEmailBanned,
  getActiveBan,
  banUser,
  unbanUser,
  listActiveBans,
  postgresBanStore,
} from './bans/index.js';
export type {
  BansPluginConfig,
  BanStore,
  Ban,
  CreateBanInput,
  RemoveBanInput,
  BanCallbacks,
  PostgresBanStoreConfig,
} from './bans/index.js';

// Entitlements plugin
export {
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
} from './entitlements/index.js';
export type {
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
} from './entitlements/index.js';

// Preferences plugin (depends on Users)
export {
  createPreferencesPlugin,
  getPreferencesStore,
  getPreferences,
  updatePreferences,
  deletePreferences,
  getDefaultPreferences,
  postgresPreferencesStore,
  deepMerge,
} from './preferences/index.js';
export type {
  PreferencesPluginConfig,
  PreferencesStore,
  UserPreferences,
  PostgresPreferencesStoreConfig,
  PreferencesApiConfig,
} from './preferences/index.js';
