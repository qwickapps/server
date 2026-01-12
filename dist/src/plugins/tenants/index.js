/**
 * Tenants Plugin
 *
 * Multi-tenant data isolation and organization management plugin.
 * Provides CRUD operations for tenants and tenant memberships.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Plugin
export { createTenantsPlugin, getTenantStore, autoCreateUserTenant } from './tenants-plugin.js';
// Store implementations
export { postgresTenantStore } from './stores/postgres-store.js';
//# sourceMappingURL=index.js.map