/**
 * Tenants Plugin Tests
 *
 * Tests the tenants plugin core functionality and helper functions.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Router } from 'express';
import {
  createTenantsPlugin,
  getTenantStore,
  type TenantsPluginConfig,
  type TenantStore,
  type Tenant,
  type TenantMembership,
  type TenantWithMembership,
} from '../src/plugins/tenants/index.js';
import type { PluginRegistry } from '../src/core/plugin-registry.js';

// Create a mock tenant store for testing
function createMockStore(overrides: Partial<TenantStore> = {}): TenantStore {
  return {
    name: 'mock',
    initialize: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn().mockResolvedValue(null),
    getByIds: vi.fn().mockResolvedValue([]),
    getByName: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({
      id: 'tenant-new',
      name: 'New Tenant',
      type: 'organization',
      owner_id: 'user-123',
      metadata: {},
      created_at: new Date(),
      updated_at: new Date(),
    } as Tenant),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
    search: vi.fn().mockResolvedValue({
      tenants: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    }),
    getTenantsForUser: vi.fn().mockResolvedValue([]),
    getTenantForUser: vi.fn().mockResolvedValue(null),
    addMember: vi.fn().mockResolvedValue({
      id: 'membership-1',
      tenant_id: 'tenant-123',
      user_id: 'user-456',
      role: 'member',
      joined_at: new Date(),
    } as TenantMembership),
    updateMember: vi.fn().mockResolvedValue(null),
    removeMember: vi.fn().mockResolvedValue(false),
    getMembers: vi.fn().mockResolvedValue([]),
    getMembership: vi.fn().mockResolvedValue(null),
    shutdown: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// Create a mock registry
function createMockRegistry(): PluginRegistry {
  const mockRouter = Router();

  return {
    hasPlugin: vi.fn().mockReturnValue(false),
    getPlugin: vi.fn().mockReturnValue(null),
    listPlugins: vi.fn().mockReturnValue([]),
    addRoute: vi.fn(),
    addMenuItem: vi.fn(),
    addPage: vi.fn(),
    addWidget: vi.fn(),
    getRoutes: vi.fn().mockReturnValue([]),
    getMenuItems: vi.fn().mockReturnValue([]),
    getPages: vi.fn().mockReturnValue([]),
    getWidgets: vi.fn().mockReturnValue([]),
    getConfig: vi.fn().mockReturnValue({}),
    setConfig: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn().mockReturnValue(() => {}),
    emit: vi.fn(),
    registerHealthCheck: vi.fn(),
    getApp: vi.fn().mockReturnValue({} as any),
    getRouter: vi.fn().mockReturnValue(mockRouter),
    getLogger: vi.fn().mockReturnValue({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  };
}

describe('Tenants Plugin', () => {
  let mockStore: TenantStore;
  let mockRegistry: PluginRegistry;

  beforeEach(() => {
    mockStore = createMockStore();
    mockRegistry = createMockRegistry();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('plugin creation', () => {
    it('should create plugin with required configuration', () => {
      const config: TenantsPluginConfig = {
        store: mockStore,
      };

      const plugin = createTenantsPlugin(config);

      expect(plugin).toBeDefined();
      expect(plugin.id).toBe('tenants');
      expect(plugin.name).toBe('Tenants');
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have onStart and onStop lifecycle methods', () => {
      const config: TenantsPluginConfig = {
        store: mockStore,
      };

      const plugin = createTenantsPlugin(config);

      expect(plugin.onStart).toBeDefined();
      expect(plugin.onStop).toBeDefined();
    });
  });

  describe('onStart', () => {
    it('should initialize the store', async () => {
      const config: TenantsPluginConfig = {
        store: mockStore,
        apiEnabled: false, // Disable API to test store init only
      };

      const plugin = createTenantsPlugin(config);
      await plugin.onStart!({}, mockRegistry);

      expect(mockStore.initialize).toHaveBeenCalled();
    });

    it('should register health check', async () => {
      const config: TenantsPluginConfig = {
        store: mockStore,
        apiEnabled: false,
      };

      const plugin = createTenantsPlugin(config);
      await plugin.onStart!({}, mockRegistry);

      expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith({
        name: 'tenants-store',
        type: 'custom',
        check: expect.any(Function),
      });
    });

    it('should register API routes when apiEnabled is true', async () => {
      const config: TenantsPluginConfig = {
        store: mockStore,
        apiEnabled: true,
        apiPrefix: '/tenants',
      };

      const plugin = createTenantsPlugin(config);
      await plugin.onStart!({}, mockRegistry);

      // Should register multiple routes
      expect(mockRegistry.addRoute).toHaveBeenCalled();
      const calls = (mockRegistry.addRoute as any).mock.calls;

      // Verify CRUD routes
      const routePaths = calls.map((call: any) => call[0].path);
      expect(routePaths).toContain('/tenants'); // List/Create
      expect(routePaths).toContain('/tenants/:id'); // Get/Update/Delete
      expect(routePaths).toContain('/tenants/user/:userId'); // User tenants
      expect(routePaths).toContain('/tenants/:tenantId/members'); // Members
    });

    it('should not register routes when apiEnabled is false', async () => {
      const config: TenantsPluginConfig = {
        store: mockStore,
        apiEnabled: false,
      };

      const plugin = createTenantsPlugin(config);
      await plugin.onStart!({}, mockRegistry);

      expect(mockRegistry.addRoute).not.toHaveBeenCalled();
    });

    it('should use default apiPrefix when not provided', async () => {
      const config: TenantsPluginConfig = {
        store: mockStore,
        apiEnabled: true,
      };

      const plugin = createTenantsPlugin(config);
      await plugin.onStart!({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;
      const firstRoute = calls[0][0];

      expect(firstRoute.path).toBe('/'); // Default prefix
    });

    it('should use custom apiPrefix', async () => {
      const config: TenantsPluginConfig = {
        store: mockStore,
        apiEnabled: true,
        apiPrefix: '/api/tenants',
      };

      const plugin = createTenantsPlugin(config);
      await plugin.onStart!({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;
      const routes = calls.map((call: any) => call[0]);

      const listRoute = routes.find((r: any) => r.method === 'get' && r.path === '/api/tenants');
      expect(listRoute).toBeDefined();
    });
  });

  describe('onStop', () => {
    it('should shutdown the store', async () => {
      const config: TenantsPluginConfig = {
        store: mockStore,
      };

      const plugin = createTenantsPlugin(config);
      await plugin.onStart!({}, mockRegistry);
      await plugin.onStop!();

      expect(mockStore.shutdown).toHaveBeenCalled();
    });
  });

  describe('getTenantStore helper', () => {
    it('should return the store after plugin initialization', async () => {
      const config: TenantsPluginConfig = {
        store: mockStore,
      };

      const plugin = createTenantsPlugin(config);
      await plugin.onStart!({}, mockRegistry);

      const store = getTenantStore();

      expect(store).toBe(mockStore);
    });

    it('should throw error when plugin not initialized', async () => {
      // First stop any running plugin to reset the store
      const config: TenantsPluginConfig = {
        store: mockStore,
      };

      const plugin = createTenantsPlugin(config);

      // Start then stop to ensure currentStore is set to null
      await plugin.onStart!({}, mockRegistry);
      await plugin.onStop!();

      // Now the store should be null and should throw
      expect(() => getTenantStore()).toThrow('Tenants plugin not initialized');
    });
  });

  describe('route handlers', () => {
    let routeHandlers: Map<string, any>;

    beforeEach(async () => {
      const config: TenantsPluginConfig = {
        store: mockStore,
        apiEnabled: true,
        apiPrefix: '/tenants',
      };

      const plugin = createTenantsPlugin(config);
      await plugin.onStart!({}, mockRegistry);

      // Extract route handlers from mock registry
      const calls = (mockRegistry.addRoute as any).mock.calls;
      routeHandlers = new Map();

      calls.forEach((call: any) => {
        const route = call[0];
        const key = `${route.method}:${route.path}`;
        routeHandlers.set(key, route.handler);
      });
    });

    describe('GET /tenants (list/search)', () => {
      it('should search tenants with query parameters', async () => {
        const handler = routeHandlers.get('get:/tenants');

        const mockReq = {
          query: {
            q: 'test',
            type: 'organization',
            owner_id: 'user-123',
            page: '2',
            limit: '10',
            sortBy: 'name',
            sortOrder: 'asc',
          },
        };

        const mockRes = {
          json: vi.fn(),
          status: vi.fn().mockReturnThis(),
        };

        await handler(mockReq, mockRes);

        expect(mockStore.search).toHaveBeenCalledWith({
          query: 'test',
          type: 'organization',
          owner_id: 'user-123',
          page: 2,
          limit: 10,
          sortBy: 'name',
          sortOrder: 'asc',
        });

        expect(mockRes.json).toHaveBeenCalled();
      });

      it('should use default pagination values', async () => {
        const handler = routeHandlers.get('get:/tenants');

        const mockReq = { query: {} };
        const mockRes = {
          json: vi.fn(),
          status: vi.fn().mockReturnThis(),
        };

        await handler(mockReq, mockRes);

        expect(mockStore.search).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
            limit: 20,
            sortBy: 'created_at',
            sortOrder: 'desc',
          })
        );
      });

      it('should limit max page size to 100', async () => {
        const handler = routeHandlers.get('get:/tenants');

        const mockReq = {
          query: { limit: '500' },
        };

        const mockRes = {
          json: vi.fn(),
          status: vi.fn().mockReturnThis(),
        };

        await handler(mockReq, mockRes);

        expect(mockStore.search).toHaveBeenCalledWith(
          expect.objectContaining({ limit: 100 })
        );
      });
    });

    describe('GET /tenants/:id (get by id)', () => {
      it('should return tenant when found', async () => {
        const handler = routeHandlers.get('get:/tenants/:id');

        const mockTenant = {
          id: 'tenant-123',
          name: 'Test Org',
          type: 'organization',
          owner_id: 'user-123',
        };

        mockStore.getById = vi.fn().mockResolvedValue(mockTenant);

        const mockReq = { params: { id: 'tenant-123' } };
        const mockRes = {
          json: vi.fn(),
          status: vi.fn().mockReturnThis(),
        };

        await handler(mockReq, mockRes);

        expect(mockStore.getById).toHaveBeenCalledWith('tenant-123');
        expect(mockRes.json).toHaveBeenCalledWith(mockTenant);
      });

      it('should return 404 when tenant not found', async () => {
        const handler = routeHandlers.get('get:/tenants/:id');

        mockStore.getById = vi.fn().mockResolvedValue(null);

        const mockReq = { params: { id: 'nonexistent' } };
        const mockRes = {
          json: vi.fn(),
          status: vi.fn().mockReturnThis(),
        };

        await handler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tenant not found' });
      });
    });

    describe('POST /tenants (create)', () => {
      it('should create tenant with valid input', async () => {
        const handler = routeHandlers.get('post:/tenants');

        const mockReq = {
          body: {
            name: 'New Org',
            type: 'organization',
            owner_id: 'user-123',
            metadata: { plan: 'premium' },
          },
        };

        const mockRes = {
          json: vi.fn(),
          status: vi.fn().mockReturnThis(),
        };

        await handler(mockReq, mockRes);

        expect(mockStore.create).toHaveBeenCalledWith({
          name: 'New Org',
          type: 'organization',
          owner_id: 'user-123',
          metadata: { plan: 'premium' },
        });

        expect(mockRes.status).toHaveBeenCalledWith(201);
      });

      it('should validate required name', async () => {
        const handler = routeHandlers.get('post:/tenants');

        const mockReq = {
          body: { type: 'organization', owner_id: 'user-123' },
        };

        const mockRes = {
          json: vi.fn(),
          status: vi.fn().mockReturnThis(),
        };

        await handler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tenant name is required' });
      });

      it('should validate required type', async () => {
        const handler = routeHandlers.get('post:/tenants');

        const mockReq = {
          body: { name: 'Test', owner_id: 'user-123' },
        };

        const mockRes = {
          json: vi.fn(),
          status: vi.fn().mockReturnThis(),
        };

        await handler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tenant type is required' });
      });

      it('should validate required owner_id', async () => {
        const handler = routeHandlers.get('post:/tenants');

        const mockReq = {
          body: { name: 'Test', type: 'organization' },
        };

        const mockRes = {
          json: vi.fn(),
          status: vi.fn().mockReturnThis(),
        };

        await handler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Owner ID is required' });
      });

      it('should validate tenant type', async () => {
        const handler = routeHandlers.get('post:/tenants');

        const mockReq = {
          body: {
            name: 'Test',
            type: 'invalid-type',
            owner_id: 'user-123',
          },
        };

        const mockRes = {
          json: vi.fn(),
          status: vi.fn().mockReturnThis(),
        };

        await handler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid tenant type. Must be one of: user, organization, group, department',
        });
      });
    });

    describe('POST /tenants/:tenantId/members (add member)', () => {
      it('should add member with valid role', async () => {
        const handler = routeHandlers.get('post:/tenants/:tenantId/members');

        const mockReq = {
          params: { tenantId: 'tenant-123' },
          body: { user_id: 'user-456', role: 'admin' },
        };

        const mockRes = {
          json: vi.fn(),
          status: vi.fn().mockReturnThis(),
        };

        await handler(mockReq, mockRes);

        expect(mockStore.addMember).toHaveBeenCalledWith({
          tenant_id: 'tenant-123',
          user_id: 'user-456',
          role: 'admin',
        });

        expect(mockRes.status).toHaveBeenCalledWith(201);
      });

      it('should validate role value', async () => {
        const handler = routeHandlers.get('post:/tenants/:tenantId/members');

        const mockReq = {
          params: { tenantId: 'tenant-123' },
          body: { user_id: 'user-456', role: 'invalid-role' },
        };

        const mockRes = {
          json: vi.fn(),
          status: vi.fn().mockReturnThis(),
        };

        await handler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid role. Must be one of: owner, admin, member, viewer',
        });
      });
    });

    describe('DELETE /tenants/:tenantId/members/:userId (remove member)', () => {
      it('should remove member successfully', async () => {
        const handler = routeHandlers.get('delete:/tenants/:tenantId/members/:userId');

        mockStore.removeMember = vi.fn().mockResolvedValue(true);

        const mockReq = {
          params: { tenantId: 'tenant-123', userId: 'user-456' },
        };

        const mockRes = {
          send: vi.fn(),
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        };

        await handler(mockReq, mockRes);

        expect(mockStore.removeMember).toHaveBeenCalledWith('tenant-123', 'user-456');
        expect(mockRes.status).toHaveBeenCalledWith(204);
        expect(mockRes.send).toHaveBeenCalled();
      });

      it('should return 404 when membership not found', async () => {
        const handler = routeHandlers.get('delete:/tenants/:tenantId/members/:userId');

        mockStore.removeMember = vi.fn().mockResolvedValue(false);

        const mockReq = {
          params: { tenantId: 'tenant-123', userId: 'user-456' },
        };

        const mockRes = {
          send: vi.fn(),
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        };

        await handler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Membership not found' });
      });
    });
  });

  describe('debug logging', () => {
    it('should log when debug is enabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const config: TenantsPluginConfig = {
        store: mockStore,
        debug: true,
      };

      const plugin = createTenantsPlugin(config);
      await plugin.onStart!({}, mockRegistry);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TenantsPlugin]'),
        expect.anything()
      );

      consoleSpy.mockRestore();
    });

    it('should not log when debug is disabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const config: TenantsPluginConfig = {
        store: mockStore,
        debug: false,
      };

      const plugin = createTenantsPlugin(config);
      await plugin.onStart!({}, mockRegistry);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
