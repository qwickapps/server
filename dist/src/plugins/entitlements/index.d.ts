/**
 * Entitlements Plugin
 *
 * User entitlement management for @qwickapps/server.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export { createEntitlementsPlugin } from './entitlements-plugin.js';
export { getEntitlementSource, isSourceReadonly, getEntitlements, refreshEntitlements, hasEntitlement, hasAnyEntitlement, hasAllEntitlements, grantEntitlement, revokeEntitlement, setEntitlements, getAvailableEntitlements, getEntitlementStats, invalidateEntitlementCache, storeExternalIdMapping, invalidateByExternalId, requireEntitlement, requireAnyEntitlement, requireAllEntitlements, } from './entitlements-plugin.js';
export { postgresEntitlementSource, inMemoryEntitlementSource } from './sources/index.js';
export type { EntitlementSource, EntitlementResult, EntitlementDefinition, EntitlementsPluginConfig, EntitlementCallbacks, EntitlementsCacheConfig, EntitlementsApiConfig, PostgresEntitlementSourceConfig, UserEntitlement, CachedEntitlements, EntitlementStats, } from './types.js';
export { EntitlementsStatusWidget } from './EntitlementsStatusWidget.js';
export type { EntitlementsStatusWidgetProps } from './EntitlementsStatusWidget.js';
export { EntitlementsManagementPage } from './EntitlementsManagementPage.js';
export type { EntitlementsManagementPageProps } from './EntitlementsManagementPage.js';
//# sourceMappingURL=index.d.ts.map