/**
 * Tenants Plugin
 *
 * Multi-tenant data isolation and organization management plugin.
 * Provides CRUD operations for tenants and tenant memberships.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export { createTenantsPlugin, getTenantStore, autoCreateUserTenant } from './tenants-plugin.js';
export { postgresTenantStore } from './stores/postgres-store.js';
export type { TenantType, Tenant, CreateTenantInput, UpdateTenantInput, TenantSearchParams, TenantListResponse, TenantMembership, CreateTenantMembershipInput, UpdateTenantMembershipInput, TenantWithMembership, TenantStore, PostgresTenantStoreConfig, TenantsPluginConfig, } from './types.js';
//# sourceMappingURL=index.d.ts.map