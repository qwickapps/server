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
export { getEntitlementSource, isSourceReadonly, getEntitlements, refreshEntitlements, hasEntitlement, hasAnyEntitlement, hasAllEntitlements, grantEntitlement, revokeEntitlement, setEntitlements, getAvailableEntitlements, getEntitlementStats, invalidateEntitlementCache, storeExternalIdMapping, invalidateByExternalId, 
// Middleware
requireEntitlement, requireAnyEntitlement, requireAllEntitlements, } from './entitlements-plugin.js';
// Sources
export { postgresEntitlementSource, inMemoryEntitlementSource } from './sources/index.js';
// UI Components are exported from main package index (@qwickapps/server)
// Do NOT export here to avoid loading UI dependencies when importing plugins
//# sourceMappingURL=index.js.map