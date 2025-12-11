/**
 * Entitlements Plugin
 *
 * User entitlement management for @qwickapps/server.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

// Main plugin
export { createEntitlementsPlugin } from './entitlements-plugin.js';

// Helper functions
export {
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
  // Middleware
  requireEntitlement,
  requireAnyEntitlement,
  requireAllEntitlements,
} from './entitlements-plugin.js';

// Sources
export { postgresEntitlementSource } from './sources/index.js';

// Types
export type {
  EntitlementSource,
  EntitlementResult,
  EntitlementDefinition,
  EntitlementsPluginConfig,
  EntitlementCallbacks,
  EntitlementsCacheConfig,
  EntitlementsApiConfig,
  PostgresEntitlementSourceConfig,
  UserEntitlement,
  CachedEntitlements,
  EntitlementStats,
} from './types.js';
