/**
 * Tenants Plugin
 *
 * Multi-tenant data isolation and organization management plugin for @qwickapps/server.
 * Provides CRUD operations for tenants and tenant memberships.
 *
 * Tenant-first design: Every user belongs to at least one tenant (their personal tenant).
 * Organizations are multi-user tenants with role-based access control.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
import type { TenantsPluginConfig, TenantStore } from './types.js';
/**
 * Create the Tenants plugin
 */
export declare function createTenantsPlugin(config: TenantsPluginConfig): Plugin;
/**
 * Helper function to get the tenant store
 * Used by other plugins to access tenant data
 */
export declare function getTenantStore(): TenantStore;
/**
 * Auto-create personal tenant for a user
 * Called by users plugin when a new user is created
 */
export declare function autoCreateUserTenant(userId: string): Promise<unknown>;
//# sourceMappingURL=tenants-plugin.d.ts.map