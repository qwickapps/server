/**
 * Entitlements Plugin Tests
 *
 * Tests the entitlements plugin core functionality and helper functions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Router } from 'express';

import {
  createEntitlementsPlugin,
  getEntitlementSource,
  isSourceReadonly,
  getEntitlements,
  hasEntitlement,
  hasAnyEntitlement,
  hasAllEntitlements,
  grantEntitlement,
  revokeEntitlement,
  invalidateEntitlementCache,
  type EntitlementsPluginConfig,
  type EntitlementSource,
} from '../src/plugins/entitlements/index.js';
import type { PluginRegistry } from '../src/core/plugin-registry.js';

// Create a mock entitlement source for testing
function createMockSource(overrides: Partial<EntitlementSource> = {}): EntitlementSource {
  const mockEntitlements: Map<string, string[]> = new Map();

  return {
    name: 'mock',
    description: 'Mock entitlement source for testing',
    readonly: false,
    initialize: vi.fn().mockResolvedValue(undefined),
    getEntitlements: vi.fn(async (identifier: string) => {
      return mockEntitlements.get(identifier.toLowerCase()) || [];
    }),
    getAllAvailable: vi.fn().mockResolvedValue([
      { id: '1', name: 'premium', category: 'subscription' },
      { id: '2', name: 'pro', category: 'subscription' },
      { id: '3', name: 'beta-access', category: 'features' },
    ]),
    getUsersWithEntitlement: vi.fn().mockResolvedValue({ emails: [], total: 0 }),
    addEntitlement: vi.fn(async (identifier: string, entitlement: string) => {
      const email = identifier.toLowerCase();
      const current = mockEntitlements.get(email) || [];
      if (!current.includes(entitlement)) {
        current.push(entitlement);
        mockEntitlements.set(email, current);
      }
    }),
    removeEntitlement: vi.fn(async (identifier: string, entitlement: string) => {
      const email = identifier.toLowerCase();
      const current = mockEntitlements.get(email) || [];
      const index = current.indexOf(entitlement);
      if (index > -1) {
        current.splice(index, 1);
        mockEntitlements.set(email, current);
      }
    }),
    setEntitlements: vi.fn(async (identifier: string, entitlements: string[]) => {
      mockEntitlements.set(identifier.toLowerCase(), [...entitlements]);
    }),
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

describe('Entitlements Plugin', () => {
  let mockSource: EntitlementSource;
  let mockRegistry: PluginRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSource = createMockSource();
    mockRegistry = createMockRegistry();
  });

  describe('createEntitlementsPlugin', () => {
    it('should create a plugin with correct id and name', () => {
      const config: EntitlementsPluginConfig = {
        source: mockSource,
      };
      const plugin = createEntitlementsPlugin(config);

      expect(plugin.id).toBe('entitlements');
      expect(plugin.name).toBe('Entitlements');
    });

    it('should initialize the source on start', async () => {
      const config: EntitlementsPluginConfig = {
        source: mockSource,
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      expect(mockSource.initialize).toHaveBeenCalled();
    });

    it('should initialize additional sources on start', async () => {
      const additionalSource = createMockSource({ name: 'additional' });
      const config: EntitlementsPluginConfig = {
        source: mockSource,
        additionalSources: [additionalSource],
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      expect(mockSource.initialize).toHaveBeenCalled();
      expect(additionalSource.initialize).toHaveBeenCalled();
    });

    it('should mount API routes when api config is provided', async () => {
      const config: EntitlementsPluginConfig = {
        source: mockSource,
        api: { prefix: '/api/entitlements' },
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      // Routes are registered individually, check that addRoute was called multiple times
      expect(mockRegistry.addRoute).toHaveBeenCalled();
      const calls = (mockRegistry.addRoute as any).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      // Verify at least the main entitlements route exists
      expect(calls.some((c: any) => c[0].path === '/api/entitlements/:email')).toBe(true);
    });
  });

  describe('getEntitlementSource', () => {
    it('should return the registered source after plugin start', async () => {
      const config: EntitlementsPluginConfig = {
        source: mockSource,
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      const source = getEntitlementSource();
      expect(source).toBeDefined();
    });
  });

  describe('isSourceReadonly', () => {
    it('should return false for writable source', async () => {
      const config: EntitlementsPluginConfig = {
        source: mockSource, // mockSource has readonly: false
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      expect(isSourceReadonly()).toBe(false);
    });

    it('should return true for readonly source', async () => {
      const readonlySource = createMockSource({ readonly: true });
      const config: EntitlementsPluginConfig = {
        source: readonlySource,
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      expect(isSourceReadonly()).toBe(true);
    });

    it('should return true when no source is initialized', async () => {
      // Before plugin starts, source is null, should default to true (safe default)
      // Note: This tests the default behavior when plugin hasn't started
      // We need to stop the previous plugin first
      const config: EntitlementsPluginConfig = {
        source: mockSource,
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop!();

      expect(isSourceReadonly()).toBe(true);
    });
  });

  describe('menu item registration', () => {
    it('should register entitlements menu item', async () => {
      const config: EntitlementsPluginConfig = {
        source: mockSource,
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.addMenuItem).toHaveBeenCalledWith(
        expect.objectContaining({
          pluginId: 'entitlements',
          id: 'entitlements:sidebar',
          label: 'Entitlements',
          icon: 'local_offer',
          route: '/entitlements',
        })
      );
    });
  });

  describe('status endpoint registration', () => {
    it('should register /status endpoint', async () => {
      const config: EntitlementsPluginConfig = {
        source: mockSource,
        api: { prefix: '/api/entitlements' },
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;
      const statusRoute = calls.find((c: any) => c[0].path === '/api/entitlements/status');
      expect(statusRoute).toBeDefined();
      expect(statusRoute[0].method).toBe('get');
    });
  });

  describe('getEntitlements', () => {
    it('should return entitlements for a user', async () => {
      // Pre-populate some entitlements
      await mockSource.addEntitlement!('test@example.com', 'premium');
      await mockSource.addEntitlement!('test@example.com', 'pro');

      const config: EntitlementsPluginConfig = {
        source: mockSource,
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      const result = await getEntitlements('test@example.com');
      expect(result.identifier).toBe('test@example.com');
      expect(result.entitlements).toContain('premium');
      expect(result.entitlements).toContain('pro');
    });

    it('should return empty array for user with no entitlements', async () => {
      const config: EntitlementsPluginConfig = {
        source: mockSource,
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      const result = await getEntitlements('unknown@example.com');
      expect(result.entitlements).toEqual([]);
    });

    it('should merge entitlements from multiple sources', async () => {
      // Primary source has 'premium'
      await mockSource.addEntitlement!('test@example.com', 'premium');

      // Additional source has 'beta-access'
      const additionalSource = createMockSource({ name: 'additional' });
      await additionalSource.addEntitlement!('test@example.com', 'beta-access');

      const config: EntitlementsPluginConfig = {
        source: mockSource,
        additionalSources: [additionalSource],
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      const result = await getEntitlements('test@example.com');
      expect(result.entitlements).toContain('premium');
      expect(result.entitlements).toContain('beta-access');
    });

    it('should deduplicate entitlements from multiple sources', async () => {
      // Both sources have 'premium'
      await mockSource.addEntitlement!('test@example.com', 'premium');

      const additionalSource = createMockSource({ name: 'additional' });
      await additionalSource.addEntitlement!('test@example.com', 'premium');

      const config: EntitlementsPluginConfig = {
        source: mockSource,
        additionalSources: [additionalSource],
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      const result = await getEntitlements('test@example.com');
      const premiumCount = result.entitlements.filter((e) => e === 'premium').length;
      expect(premiumCount).toBe(1);
    });
  });

  describe('hasEntitlement', () => {
    beforeEach(async () => {
      await mockSource.addEntitlement!('test@example.com', 'premium');

      const config: EntitlementsPluginConfig = {
        source: mockSource,
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);
    });

    it('should return true if user has entitlement', async () => {
      const has = await hasEntitlement('test@example.com', 'premium');
      expect(has).toBe(true);
    });

    it('should return false if user does not have entitlement', async () => {
      const has = await hasEntitlement('test@example.com', 'enterprise');
      expect(has).toBe(false);
    });

    it('should be case-insensitive for email', async () => {
      const has = await hasEntitlement('TEST@EXAMPLE.COM', 'premium');
      expect(has).toBe(true);
    });
  });

  describe('hasAnyEntitlement', () => {
    beforeEach(async () => {
      await mockSource.addEntitlement!('test@example.com', 'premium');

      const config: EntitlementsPluginConfig = {
        source: mockSource,
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);
    });

    it('should return true if user has any of the entitlements', async () => {
      const has = await hasAnyEntitlement('test@example.com', ['premium', 'enterprise']);
      expect(has).toBe(true);
    });

    it('should return false if user has none of the entitlements', async () => {
      const has = await hasAnyEntitlement('test@example.com', ['enterprise', 'ultimate']);
      expect(has).toBe(false);
    });
  });

  describe('hasAllEntitlements', () => {
    beforeEach(async () => {
      await mockSource.addEntitlement!('test@example.com', 'premium');
      await mockSource.addEntitlement!('test@example.com', 'pro');

      const config: EntitlementsPluginConfig = {
        source: mockSource,
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);
    });

    it('should return true if user has all entitlements', async () => {
      const has = await hasAllEntitlements('test@example.com', ['premium', 'pro']);
      expect(has).toBe(true);
    });

    it('should return false if user is missing some entitlements', async () => {
      const has = await hasAllEntitlements('test@example.com', ['premium', 'enterprise']);
      expect(has).toBe(false);
    });
  });

  describe('grantEntitlement', () => {
    beforeEach(async () => {
      const config: EntitlementsPluginConfig = {
        source: mockSource,
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);
    });

    it('should grant entitlement to user', async () => {
      await grantEntitlement('new@example.com', 'premium');

      expect(mockSource.addEntitlement).toHaveBeenCalledWith(
        'new@example.com',
        'premium',
        undefined
      );
    });

    it('should throw error if source is readonly', async () => {
      // Create a new plugin with readonly source
      const readonlySource = createMockSource({ readonly: true });
      const config: EntitlementsPluginConfig = {
        source: readonlySource,
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      await expect(grantEntitlement('test@example.com', 'premium')).rejects.toThrow(
        'Primary entitlement source is read-only'
      );
    });
  });

  describe('revokeEntitlement', () => {
    beforeEach(async () => {
      await mockSource.addEntitlement!('test@example.com', 'premium');

      const config: EntitlementsPluginConfig = {
        source: mockSource,
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);
    });

    it('should revoke entitlement from user', async () => {
      await revokeEntitlement('test@example.com', 'premium');

      expect(mockSource.removeEntitlement).toHaveBeenCalledWith(
        'test@example.com',
        'premium'
      );
    });
  });

  describe('invalidateEntitlementCache', () => {
    it('should not throw when cache is not enabled', async () => {
      const config: EntitlementsPluginConfig = {
        source: mockSource,
        cache: { enabled: false },
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      // Should not throw
      await invalidateEntitlementCache('test@example.com');
    });
  });

  describe('callbacks', () => {
    it('should call onGrant callback', async () => {
      const onGrant = vi.fn();

      const config: EntitlementsPluginConfig = {
        source: mockSource,
        callbacks: {
          onGrant,
        },
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      await grantEntitlement('test@example.com', 'premium', 'admin');

      expect(onGrant).toHaveBeenCalledWith('test@example.com', 'premium', 'admin');
    });

    it('should call onRevoke callback', async () => {
      const onRevoke = vi.fn();
      await mockSource.addEntitlement!('test@example.com', 'premium');

      const config: EntitlementsPluginConfig = {
        source: mockSource,
        callbacks: {
          onRevoke,
        },
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);

      await revokeEntitlement('test@example.com', 'premium');

      expect(onRevoke).toHaveBeenCalledWith('test@example.com', 'premium');
    });
  });

  describe('onStop', () => {
    it('should shutdown all sources', async () => {
      const additionalSource = createMockSource({ name: 'additional' });

      const config: EntitlementsPluginConfig = {
        source: mockSource,
        additionalSources: [additionalSource],
      };
      const plugin = createEntitlementsPlugin(config);
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop!();

      expect(mockSource.shutdown).toHaveBeenCalled();
      expect(additionalSource.shutdown).toHaveBeenCalled();
    });
  });
});

describe('PostgreSQL Entitlement Source', () => {
  // These are more integration-style tests that would run with a real DB
  // For now, just test the factory function exists

  it('should export postgresEntitlementSource factory', async () => {
    const { postgresEntitlementSource } = await import(
      '../src/plugins/entitlements/sources/postgres-source.js'
    );
    expect(typeof postgresEntitlementSource).toBe('function');
  });
});
