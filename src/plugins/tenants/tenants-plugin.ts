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

import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type {
  TenantsPluginConfig,
  TenantStore,
  CreateTenantInput,
  UpdateTenantInput,
  TenantSearchParams,
  CreateTenantMembershipInput,
  UpdateTenantMembershipInput,
} from './types.js';
import { getUserById } from '../users/users-plugin.js';
import { getAuthenticatedUser, isAuthenticated } from '../auth/index.js';

// Store instance and registry for helper access
let currentStore: TenantStore | null = null;
let currentRegistry: PluginRegistry | null = null;

/**
 * Create the Tenants plugin
 */
export function createTenantsPlugin(config: TenantsPluginConfig): Plugin {
  const debug = config.debug || false;
  const apiPrefix = config.apiPrefix || ''; // Empty string to avoid double slashes in template literals
  const apiEnabled = config.apiEnabled !== false;

  function log(message: string, data?: Record<string, unknown>) {
    if (debug) {
      console.log(`[TenantsPlugin] ${message}`, data || '');
    }
  }

  /**
   * Helper to check if user has access to a tenant
   */
  async function canAccessTenant(userId: string, tenantId: string): Promise<boolean> {
    try {
      const membership = await config.store.getTenantForUser(tenantId, userId);
      return membership !== null;
    } catch {
      return false;
    }
  }

  /**
   * Helper to check if user has admin/owner role in a tenant
   */
  async function canManageTenant(userId: string, tenantId: string): Promise<boolean> {
    try {
      const membership = await config.store.getTenantForUser(tenantId, userId);
      return membership !== null && ['owner', 'admin'].includes(membership.user_role);
    } catch {
      return false;
    }
  }

  /**
   * Helper to check if user is owner of a tenant
   */
  async function isOwnerOfTenant(userId: string, tenantId: string): Promise<boolean> {
    try {
      const membership = await config.store.getTenantForUser(tenantId, userId);
      return membership !== null && membership.user_role === 'owner';
    } catch {
      return false;
    }
  }

  return {
    id: 'tenants',
    name: 'Tenants',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      log('Starting tenants plugin');

      // Initialize the store (creates tables if needed)
      await config.store.initialize();
      log('Tenants plugin migrations complete');

      // Store references for helper access
      currentStore = config.store;
      currentRegistry = registry;

      // Register health check
      registry.registerHealthCheck({
        name: 'tenants-store',
        type: 'custom',
        check: async () => {
          try {
            // Simple health check - try to search with limit 1
            await config.store.search({ limit: 1 });
            return { healthy: true };
          } catch {
            return { healthy: false };
          }
        },
      });

      if (!apiEnabled) return;

      // ========================================================================
      // Tenant CRUD Routes
      // ========================================================================

      // List/Search tenants
      registry.addRoute({
        method: 'get',
        path: apiPrefix || '/',
        pluginId: 'tenants',
        handler: async (req: Request, res: Response) => {
          try {
            // Authentication check
            if (!isAuthenticated(req)) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
              });
            }

            const user = getAuthenticatedUser(req);
            if (!user) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found',
              });
            }

            // Users can only search their own tenants
            // Get all tenants user belongs to
            const userTenants = await config.store.getTenantsForUser(user.id);
            res.json({
              tenants: userTenants,
              total: userTenants.length,
              page: 1,
              limit: userTenants.length,
              totalPages: 1,
            });
          } catch (error) {
            console.error('[TenantsPlugin] Search error:', error);
            res.status(500).json({ error: 'Failed to search tenants' });
          }
        },
      });

      // Get tenant by ID
      registry.addRoute({
        method: 'get',
        path: `${apiPrefix}/:id`,
        pluginId: 'tenants',
        handler: async (req: Request, res: Response) => {
          try {
            // Authentication check
            if (!isAuthenticated(req)) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
              });
            }

            const user = getAuthenticatedUser(req);
            if (!user) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found',
              });
            }

            // Authorization check: user must be a member of the tenant
            if (!(await canAccessTenant(user.id, req.params.id))) {
              return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have access to this tenant',
              });
            }

            const tenant = await config.store.getById(req.params.id);
            if (!tenant) {
              return res.status(404).json({ error: 'Tenant not found' });
            }
            res.json(tenant);
          } catch (error) {
            console.error('[TenantsPlugin] Get tenant error:', error);
            res.status(500).json({ error: 'Failed to get tenant' });
          }
        },
      });

      // Create tenant
      registry.addRoute({
        method: 'post',
        path: apiPrefix || '/',
        pluginId: 'tenants',
        handler: async (req: Request, res: Response) => {
          try {
            // Authentication check
            if (!isAuthenticated(req)) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
              });
            }

            const user = getAuthenticatedUser(req);
            if (!user) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found',
              });
            }

            const input: CreateTenantInput = {
              name: req.body.name,
              type: req.body.type,
              owner_id: req.body.owner_id || user.id, // Default to current user
              metadata: req.body.metadata,
            };

            if (!input.name) {
              return res.status(400).json({ error: 'Tenant name is required' });
            }

            if (!input.type) {
              return res.status(400).json({ error: 'Tenant type is required' });
            }

            // Validate tenant type
            const validTypes = ['user', 'organization', 'group', 'department'];
            if (!validTypes.includes(input.type)) {
              return res.status(400).json({
                error: `Invalid tenant type. Must be one of: ${validTypes.join(', ')}`,
              });
            }

            // Authorization: user can only create tenants for themselves
            if (input.owner_id !== user.id) {
              return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only create tenants for yourself',
              });
            }

            const tenant = await config.store.create(input);

            // Automatically add creator as owner
            await config.store.addMember({
              tenant_id: tenant.id,
              user_id: user.id,
              role: 'owner',
            });

            log('Tenant created', { tenantId: tenant.id, type: tenant.type, userId: user.id });
            res.status(201).json(tenant);
          } catch (error) {
            console.error('[TenantsPlugin] Create tenant error:', error);
            res.status(500).json({ error: 'Failed to create tenant' });
          }
        },
      });

      // Update tenant
      registry.addRoute({
        method: 'put',
        path: `${apiPrefix}/:id`,
        pluginId: 'tenants',
        handler: async (req: Request, res: Response) => {
          try {
            // Authentication check
            if (!isAuthenticated(req)) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
              });
            }

            const user = getAuthenticatedUser(req);
            if (!user) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found',
              });
            }

            // Authorization: user must be admin or owner
            if (!(await canManageTenant(user.id, req.params.id))) {
              return res.status(403).json({
                error: 'Forbidden',
                message: 'Only admins and owners can update tenants',
              });
            }

            const input: UpdateTenantInput = {
              name: req.body.name,
              metadata: req.body.metadata,
            };

            const tenant = await config.store.update(req.params.id, input);
            if (!tenant) {
              return res.status(404).json({ error: 'Tenant not found' });
            }

            log('Tenant updated', { tenantId: tenant.id, userId: user.id });
            res.json(tenant);
          } catch (error) {
            console.error('[TenantsPlugin] Update tenant error:', error);
            res.status(500).json({ error: 'Failed to update tenant' });
          }
        },
      });

      // Delete tenant
      registry.addRoute({
        method: 'delete',
        path: `${apiPrefix}/:id`,
        pluginId: 'tenants',
        handler: async (req: Request, res: Response) => {
          try {
            // Authentication check
            if (!isAuthenticated(req)) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
              });
            }

            const user = getAuthenticatedUser(req);
            if (!user) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found',
              });
            }

            // Authorization: only owners can delete tenants
            if (!(await isOwnerOfTenant(user.id, req.params.id))) {
              return res.status(403).json({
                error: 'Forbidden',
                message: 'Only owners can delete tenants',
              });
            }

            const deleted = await config.store.delete(req.params.id);
            if (!deleted) {
              return res.status(404).json({ error: 'Tenant not found' });
            }

            log('Tenant deleted', { tenantId: req.params.id, userId: user.id });
            res.status(204).send();
          } catch (error) {
            console.error('[TenantsPlugin] Delete tenant error:', error);
            res.status(500).json({ error: 'Failed to delete tenant' });
          }
        },
      });

      // ========================================================================
      // User-Tenant Routes
      // ========================================================================

      // Get all tenants for a user
      registry.addRoute({
        method: 'get',
        path: `${apiPrefix}/user/:userId`,
        pluginId: 'tenants',
        handler: async (req: Request, res: Response) => {
          try {
            // Authentication check
            if (!isAuthenticated(req)) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
              });
            }

            const user = getAuthenticatedUser(req);
            if (!user) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found',
              });
            }

            // Authorization: users can only get their own tenants
            if (req.params.userId !== user.id) {
              return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only view your own tenants',
              });
            }

            const tenants = await config.store.getTenantsForUser(req.params.userId);
            res.json({ tenants, total: tenants.length });
          } catch (error) {
            console.error('[TenantsPlugin] Get user tenants error:', error);
            res.status(500).json({ error: 'Failed to get user tenants' });
          }
        },
      });

      // ========================================================================
      // Membership Routes
      // ========================================================================

      // Get all members of a tenant
      registry.addRoute({
        method: 'get',
        path: `${apiPrefix}/:tenantId/members`,
        pluginId: 'tenants',
        handler: async (req: Request, res: Response) => {
          try {
            // Authentication check
            if (!isAuthenticated(req)) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
              });
            }

            const user = getAuthenticatedUser(req);
            if (!user) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found',
              });
            }

            // Authorization: user must be a member of the tenant
            if (!(await canAccessTenant(user.id, req.params.tenantId))) {
              return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have access to this tenant',
              });
            }

            const members = await config.store.getMembers(req.params.tenantId);
            res.json({ members, total: members.length });
          } catch (error) {
            console.error('[TenantsPlugin] Get members error:', error);
            res.status(500).json({ error: 'Failed to get tenant members' });
          }
        },
      });

      // Add a member to a tenant
      registry.addRoute({
        method: 'post',
        path: `${apiPrefix}/:tenantId/members`,
        pluginId: 'tenants',
        handler: async (req: Request, res: Response) => {
          try {
            // Authentication check
            if (!isAuthenticated(req)) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
              });
            }

            const user = getAuthenticatedUser(req);
            if (!user) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found',
              });
            }

            // Authorization: user must be admin or owner
            if (!(await canManageTenant(user.id, req.params.tenantId))) {
              return res.status(403).json({
                error: 'Forbidden',
                message: 'Only admins and owners can add members',
              });
            }

            const input: CreateTenantMembershipInput = {
              tenant_id: req.params.tenantId,
              user_id: req.body.user_id,
              role: req.body.role,
            };

            if (!input.user_id) {
              return res.status(400).json({ error: 'User ID is required' });
            }

            if (!input.role) {
              return res.status(400).json({ error: 'Role is required' });
            }

            // Validate role
            const validRoles = ['owner', 'admin', 'member', 'viewer'];
            if (!validRoles.includes(input.role)) {
              return res.status(400).json({
                error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
              });
            }

            const membership = await config.store.addMember(input);
            log('Member added to tenant', {
              tenantId: input.tenant_id,
              userId: input.user_id,
              role: input.role,
              addedBy: user.id,
            });
            res.status(201).json(membership);
          } catch (error) {
            console.error('[TenantsPlugin] Add member error:', error);
            res.status(500).json({ error: 'Failed to add tenant member' });
          }
        },
      });

      // Update a member's role
      registry.addRoute({
        method: 'put',
        path: `${apiPrefix}/:tenantId/members/:userId`,
        pluginId: 'tenants',
        handler: async (req: Request, res: Response) => {
          try {
            // Authentication check
            if (!isAuthenticated(req)) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
              });
            }

            const user = getAuthenticatedUser(req);
            if (!user) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found',
              });
            }

            // Authorization: user must be admin or owner
            if (!(await canManageTenant(user.id, req.params.tenantId))) {
              return res.status(403).json({
                error: 'Forbidden',
                message: 'Only admins and owners can update member roles',
              });
            }

            const input: UpdateTenantMembershipInput = {
              role: req.body.role,
            };

            if (!input.role) {
              return res.status(400).json({ error: 'Role is required' });
            }

            // Validate role
            const validRoles = ['owner', 'admin', 'member', 'viewer'];
            if (!validRoles.includes(input.role)) {
              return res.status(400).json({
                error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
              });
            }

            const membership = await config.store.updateMember(req.params.tenantId, req.params.userId, input);
            if (!membership) {
              return res.status(404).json({ error: 'Membership not found' });
            }

            log('Member role updated', {
              tenantId: req.params.tenantId,
              userId: req.params.userId,
              role: input.role,
              updatedBy: user.id,
            });
            res.json(membership);
          } catch (error) {
            console.error('[TenantsPlugin] Update member error:', error);
            res.status(500).json({ error: 'Failed to update tenant member' });
          }
        },
      });

      // Remove a member from a tenant
      registry.addRoute({
        method: 'delete',
        path: `${apiPrefix}/:tenantId/members/:userId`,
        pluginId: 'tenants',
        handler: async (req: Request, res: Response) => {
          try {
            // Authentication check
            if (!isAuthenticated(req)) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
              });
            }

            const user = getAuthenticatedUser(req);
            if (!user) {
              return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found',
              });
            }

            // Authorization: user must be admin or owner
            if (!(await canManageTenant(user.id, req.params.tenantId))) {
              return res.status(403).json({
                error: 'Forbidden',
                message: 'Only admins and owners can remove members',
              });
            }

            const deleted = await config.store.removeMember(req.params.tenantId, req.params.userId);
            if (!deleted) {
              return res.status(404).json({ error: 'Membership not found' });
            }

            log('Member removed from tenant', {
              tenantId: req.params.tenantId,
              userId: req.params.userId,
              removedBy: user.id,
            });
            res.status(204).send();
          } catch (error) {
            console.error('[TenantsPlugin] Remove member error:', error);
            res.status(500).json({ error: 'Failed to remove tenant member' });
          }
        },
      });

      log('Tenants plugin started successfully');
    },

    async onStop(): Promise<void> {
      log('Stopping tenants plugin');
      await config.store.shutdown();
      currentStore = null;
      currentRegistry = null;
    },
  };
}

/**
 * Helper function to get the tenant store
 * Used by other plugins to access tenant data
 */
export function getTenantStore(): TenantStore {
  if (!currentStore) {
    throw new Error('Tenants plugin not initialized. Call createTenantsPlugin() first.');
  }
  return currentStore;
}

/**
 * Auto-create personal tenant for a user
 * Called by users plugin when a new user is created
 */
export async function autoCreateUserTenant(userId: string): Promise<unknown> {
  if (!currentStore) {
    throw new Error('Tenants plugin not initialized. Call createTenantsPlugin() first.');
  }

  // Get user info from users plugin
  let userEmail = userId; // Fallback to userId if users plugin not available
  let userName = undefined;

  if (currentRegistry && currentRegistry.hasPlugin('users')) {
    try {
      const user = await getUserById(userId);
      if (user) {
        userEmail = user.email;
        userName = user.name;
      }
    } catch (error) {
      console.error('[TenantsPlugin] Failed to get user info:', error);
    }
  }

  // Create personal tenant
  const tenant = await currentStore.create({
    name: userName || userEmail,
    type: 'user',
    owner_id: userId,
    metadata: { auto_created: true },
  });

  // Auto-add user as member with owner role
  await currentStore.addMember({
    tenant_id: tenant.id,
    user_id: userId,
    role: 'owner',
  });

  return tenant;
}
