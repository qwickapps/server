/**
 * Users Plugin Tests
 *
 * Unit tests for the users plugin including the new endpoints:
 * - GET /users/:id/info
 * - POST /users/sync
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createUsersPlugin,
  getUserStore,
  getUserById,
  getUserByEmail,
  findOrCreateUser,
} from '../users-plugin.js';
import type { UserStore, UsersPluginConfig, User } from '../types.js';
import type { PluginRegistry } from '../../../core/plugin-registry.js';

// Mock the imported helper functions from other plugins
vi.mock('../../entitlements/entitlements-plugin.js', () => ({
  getEntitlements: vi.fn(),
}));

vi.mock('../../preferences/preferences-plugin.js', () => ({
  getPreferences: vi.fn(),
}));

vi.mock('../../bans/bans-plugin.js', () => ({
  getActiveBan: vi.fn(),
}));

// Import mocked functions for test setup
import { getEntitlements } from '../../entitlements/entitlements-plugin.js';
import { getPreferences } from '../../preferences/preferences-plugin.js';
import { getActiveBan } from '../../bans/bans-plugin.js';

describe('Users Plugin', () => {
  // Mock user data
  const mockUser: User = {
    id: 'test-user-id-123',
    email: 'test@example.com',
    name: 'Test User',
    external_id: 'auth0|abc123',
    provider: 'auth0',
    picture: 'https://example.com/avatar.jpg',
    status: 'active',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
    last_login_at: new Date('2025-12-13'),
  };

  // Mock store
  const createMockStore = (): UserStore => ({
    name: 'mock',
    initialize: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn().mockResolvedValue(mockUser),
    getByIds: vi.fn().mockResolvedValue([mockUser]),
    getByEmail: vi.fn().mockResolvedValue(mockUser),
    getByExternalId: vi.fn().mockResolvedValue(null),
    getByIdentifier: vi.fn().mockResolvedValue(mockUser),
    linkIdentifiers: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue(mockUser),
    update: vi.fn().mockResolvedValue(mockUser),
    delete: vi.fn().mockResolvedValue(true),
    search: vi.fn().mockResolvedValue({ users: [mockUser], total: 1, page: 1, limit: 20, totalPages: 1 }),
    updateLastLogin: vi.fn().mockResolvedValue(undefined),
    getByInvitationToken: vi.fn().mockResolvedValue(mockUser),
    acceptInvitation: vi.fn().mockResolvedValue(mockUser),
    shutdown: vi.fn().mockResolvedValue(undefined),
  });

  // Mock registry with configurable plugins
  const createMockRegistry = (plugins: string[] = []): PluginRegistry =>
    ({
      hasPlugin: vi.fn().mockImplementation((id: string) => plugins.includes(id)),
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
      getRouter: vi.fn().mockReturnValue({} as any),
      getLogger: vi.fn().mockReturnValue({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      }),
    }) as unknown as PluginRegistry;

  let mockStore: UserStore;
  let mockRegistry: PluginRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
    mockRegistry = createMockRegistry();
  });

  afterEach(async () => {
    // Clean up by stopping the plugin if it was started
    const store = getUserStore();
    if (store) {
      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStop();
    }
  });

  describe('createUsersPlugin', () => {
    it('should create a plugin with correct id', () => {
      const plugin = createUsersPlugin({ store: mockStore });
      expect(plugin.id).toBe('users');
    });

    it('should create a plugin with correct name', () => {
      const plugin = createUsersPlugin({ store: mockStore });
      expect(plugin.name).toBe('Users');
    });

    it('should create a plugin with version', () => {
      const plugin = createUsersPlugin({ store: mockStore });
      expect(plugin.version).toBe('1.0.0');
    });
  });

  describe('onStart', () => {
    it('should initialize store on start', async () => {
      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      expect(mockStore.initialize).toHaveBeenCalled();
    });

    it('should register health check', async () => {
      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'users-store',
          type: 'custom',
        })
      );
    });

    it('should register CRUD routes by default', async () => {
      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      // GET /users, GET /users/:id, POST /users, PUT /users/:id, DELETE /users/:id
      // + GET /users/:id/info, POST /users/sync
      expect(mockRegistry.addRoute).toHaveBeenCalledTimes(7);
    });

    it('should register /users/:id/info route', async () => {
      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;
      const infoRoute = calls.find((c: any) => c[0].path === '/users/:id/info');

      expect(infoRoute).toBeDefined();
      expect(infoRoute[0]).toMatchObject({
        method: 'get',
        path: '/users/:id/info',
        pluginId: 'users',
      });
    });

    it('should register /users/sync route', async () => {
      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;
      const syncRoute = calls.find((c: any) => c[0].path === '/users/sync');

      expect(syncRoute).toBeDefined();
      expect(syncRoute[0]).toMatchObject({
        method: 'post',
        path: '/users/sync',
        pluginId: 'users',
      });
    });

    it('should use custom API prefix when provided', async () => {
      const plugin = createUsersPlugin({
        store: mockStore,
        api: { prefix: '/people' },
      });
      await plugin.onStart({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;
      expect(calls[0][0].path).toBe('/people');
    });
  });

  describe('onStop', () => {
    it('should shutdown store', async () => {
      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop();

      expect(mockStore.shutdown).toHaveBeenCalled();
    });

    it('should clear store reference', async () => {
      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop();

      expect(getUserStore()).toBeNull();
    });
  });

  describe('helper functions', () => {
    describe('getUserStore', () => {
      it('should return null when plugin not started', () => {
        expect(getUserStore()).toBeNull();
      });

      it('should return store when plugin started', async () => {
        const plugin = createUsersPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        expect(getUserStore()).toBe(mockStore);
      });
    });

    describe('getUserById', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(getUserById('user-id')).rejects.toThrow(
          'Users plugin not initialized'
        );
      });

      it('should return user when found', async () => {
        const plugin = createUsersPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await getUserById(mockUser.id);
        expect(result).toEqual(mockUser);
      });

      it('should return null when user not found', async () => {
        const plugin = createUsersPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        (mockStore.getById as any).mockResolvedValue(null);

        const result = await getUserById('non-existent');
        expect(result).toBeNull();
      });
    });

    describe('getUserByEmail', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(getUserByEmail('test@example.com')).rejects.toThrow(
          'Users plugin not initialized'
        );
      });

      it('should return user when found', async () => {
        const plugin = createUsersPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await getUserByEmail(mockUser.email);
        expect(result).toEqual(mockUser);
      });
    });

    describe('findOrCreateUser', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          findOrCreateUser({
            email: 'test@example.com',
            external_id: 'auth0|123',
            provider: 'auth0',
          })
        ).rejects.toThrow('Users plugin not initialized');
      });

      it('should return existing user when found by external_id', async () => {
        const plugin = createUsersPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        (mockStore.getByExternalId as any).mockResolvedValue(mockUser);

        const result = await findOrCreateUser({
          email: 'test@example.com',
          external_id: 'auth0|abc123',
          provider: 'auth0',
        });

        expect(result).toEqual(mockUser);
        expect(mockStore.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
        expect(mockStore.create).not.toHaveBeenCalled();
      });

      it('should return existing user when found by email', async () => {
        const plugin = createUsersPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        // Not found by external_id
        (mockStore.getByExternalId as any).mockResolvedValue(null);
        // Found by email
        (mockStore.getByEmail as any).mockResolvedValue(mockUser);

        const result = await findOrCreateUser({
          email: 'test@example.com',
          external_id: 'auth0|new123',
          provider: 'auth0',
        });

        expect(result).toEqual(mockUser);
        expect(mockStore.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
        expect(mockStore.create).not.toHaveBeenCalled();
      });

      it('should create new user when not found', async () => {
        const plugin = createUsersPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        // Not found by external_id or email
        (mockStore.getByExternalId as any).mockResolvedValue(null);
        (mockStore.getByEmail as any).mockResolvedValue(null);

        const newUser: User = { ...mockUser, id: 'new-user-id' };
        (mockStore.create as any).mockResolvedValue(newUser);

        const result = await findOrCreateUser({
          email: 'new@example.com',
          external_id: 'auth0|new123',
          provider: 'auth0',
          name: 'New User',
        });

        expect(result).toEqual(newUser);
        expect(mockStore.create).toHaveBeenCalledWith({
          email: 'new@example.com',
          external_id: 'auth0|new123',
          provider: 'auth0',
          name: 'New User',
          picture: undefined,
        });
      });
    });
  });

  describe('GET /users/:id/info endpoint', () => {
    it('should build user info with all plugins loaded', async () => {
      // Setup registry with all plugins
      const registryWithPlugins = createMockRegistry(['entitlements', 'preferences', 'bans']);

      // Setup mock responses
      const mockEntitlements = { entitlements: ['pro', 'vtf', 'signals'], identifier: mockUser.email };
      const mockPreferences = { theme: 'dark', notifications: { email: true } };
      const mockBan = null; // Not banned

      (getEntitlements as any).mockResolvedValue(mockEntitlements);
      (getPreferences as any).mockResolvedValue(mockPreferences);
      (getActiveBan as any).mockResolvedValue(mockBan);

      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, registryWithPlugins);

      // Find the handler for /users/:id/info
      const calls = (registryWithPlugins.addRoute as any).mock.calls;
      const infoRoute = calls.find((c: any) => c[0].path === '/users/:id/info');
      const handler = infoRoute[0].handler;

      // Mock request and response
      const req = { params: { id: mockUser.id } } as any;
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        entitlements: ['pro', 'vtf', 'signals'],
        preferences: mockPreferences,
        ban: null,
      });
    });

    it('should build user info with only users plugin loaded', async () => {
      // Registry with no other plugins
      const registryNoPlugins = createMockRegistry([]);

      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, registryNoPlugins);

      // Find the handler
      const calls = (registryNoPlugins.addRoute as any).mock.calls;
      const infoRoute = calls.find((c: any) => c[0].path === '/users/:id/info');
      const handler = infoRoute[0].handler;

      const req = { params: { id: mockUser.id } } as any;
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      await handler(req, res);

      // Should only have user field
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it('should return 404 when user not found', async () => {
      (mockStore.getById as any).mockResolvedValue(null);

      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;
      const infoRoute = calls.find((c: any) => c[0].path === '/users/:id/info');
      const handler = infoRoute[0].handler;

      const req = { params: { id: 'non-existent' } } as any;
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should include ban info when user is banned', async () => {
      const registryWithBans = createMockRegistry(['bans']);

      const mockBan = {
        id: 'ban-123',
        user_id: mockUser.id,
        reason: 'Terms of service violation',
        banned_by: 'admin',
        banned_at: new Date('2025-12-01'),
        expires_at: new Date('2025-12-31'),
        is_active: true,
      };

      (getActiveBan as any).mockResolvedValue(mockBan);

      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, registryWithBans);

      const calls = (registryWithBans.addRoute as any).mock.calls;
      const infoRoute = calls.find((c: any) => c[0].path === '/users/:id/info');
      const handler = infoRoute[0].handler;

      const req = { params: { id: mockUser.id } } as any;
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        ban: {
          id: 'ban-123',
          reason: 'Terms of service violation',
          banned_at: mockBan.banned_at,
          expires_at: mockBan.expires_at,
        },
      });
    });

    it('should continue without failing when a plugin helper throws', async () => {
      const registryWithPlugins = createMockRegistry(['entitlements', 'preferences']);

      // Entitlements throws, preferences succeeds
      (getEntitlements as any).mockRejectedValue(new Error('Entitlements service unavailable'));
      (getPreferences as any).mockResolvedValue({ theme: 'light' });

      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, registryWithPlugins);

      const calls = (registryWithPlugins.addRoute as any).mock.calls;
      const infoRoute = calls.find((c: any) => c[0].path === '/users/:id/info');
      const handler = infoRoute[0].handler;

      const req = { params: { id: mockUser.id } } as any;
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      // Should not throw, should continue with available data
      await handler(req, res);

      // Should have user and preferences, but not entitlements
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        preferences: { theme: 'light' },
      });
    });
  });

  describe('POST /users/sync endpoint', () => {
    it('should find or create user and return full info', async () => {
      const registryWithPlugins = createMockRegistry(['entitlements', 'preferences', 'bans']);

      (mockStore.getByExternalId as any).mockResolvedValue(null);
      (mockStore.getByEmail as any).mockResolvedValue(null);
      (mockStore.create as any).mockResolvedValue(mockUser);

      (getEntitlements as any).mockResolvedValue({ entitlements: ['free'] });
      (getPreferences as any).mockResolvedValue({ theme: 'light' });
      (getActiveBan as any).mockResolvedValue(null);

      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, registryWithPlugins);

      const calls = (registryWithPlugins.addRoute as any).mock.calls;
      const syncRoute = calls.find((c: any) => c[0].path === '/users/sync');
      const handler = syncRoute[0].handler;

      const req = {
        body: {
          email: 'new@example.com',
          external_id: 'auth0|new123',
          provider: 'auth0',
          name: 'New User',
        },
      } as any;
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        entitlements: ['free'],
        preferences: { theme: 'light' },
        ban: null,
      });
    });

    it('should return 400 when email is missing', async () => {
      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;
      const syncRoute = calls.find((c: any) => c[0].path === '/users/sync');
      const handler = syncRoute[0].handler;

      const req = {
        body: {
          external_id: 'auth0|123',
          provider: 'auth0',
        },
      } as any;
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Valid email is required' });
    });

    it('should return 400 when email is invalid', async () => {
      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;
      const syncRoute = calls.find((c: any) => c[0].path === '/users/sync');
      const handler = syncRoute[0].handler;

      const req = {
        body: {
          email: 'invalid-email',
          external_id: 'auth0|123',
          provider: 'auth0',
        },
      } as any;
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Valid email is required' });
    });

    it('should return 400 when external_id is missing', async () => {
      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;
      const syncRoute = calls.find((c: any) => c[0].path === '/users/sync');
      const handler = syncRoute[0].handler;

      const req = {
        body: {
          email: 'test@example.com',
          provider: 'auth0',
        },
      } as any;
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'external_id is required' });
    });

    it('should return 400 when provider is missing', async () => {
      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;
      const syncRoute = calls.find((c: any) => c[0].path === '/users/sync');
      const handler = syncRoute[0].handler;

      const req = {
        body: {
          email: 'test@example.com',
          external_id: 'auth0|123',
        },
      } as any;
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'provider is required' });
    });

    it('should sync existing user and return info', async () => {
      const registryWithPlugins = createMockRegistry(['entitlements']);

      // User already exists
      (mockStore.getByExternalId as any).mockResolvedValue(mockUser);
      (getEntitlements as any).mockResolvedValue({ entitlements: ['pro', 'vtf'] });

      const plugin = createUsersPlugin({ store: mockStore });
      await plugin.onStart({}, registryWithPlugins);

      const calls = (registryWithPlugins.addRoute as any).mock.calls;
      const syncRoute = calls.find((c: any) => c[0].path === '/users/sync');
      const handler = syncRoute[0].handler;

      const req = {
        body: {
          email: mockUser.email,
          external_id: mockUser.external_id,
          provider: mockUser.provider,
        },
      } as any;
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      await handler(req, res);

      expect(mockStore.create).not.toHaveBeenCalled();
      expect(mockStore.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        entitlements: ['pro', 'vtf'],
      });
    });
  });
});
