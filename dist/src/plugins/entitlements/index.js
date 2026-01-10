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
export { postgresEntitlementSource } from './sources/index.js';
// UI Components
export { EntitlementsStatusWidget } from './EntitlementsStatusWidget.js';
export { EntitlementsManagementPage } from './EntitlementsManagementPage.js';
//# sourceMappingURL=index.js.map