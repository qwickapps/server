/**
 * Preferences Plugin Tests
 *
 * Unit tests for the preferences plugin using mocked dependencies.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createPreferencesPlugin,
  getPreferencesStore,
  getPreferences,
  updatePreferences,
  deletePreferences,
  getDefaultPreferences,
} from '../preferences-plugin.js';
import type { PreferencesStore, PreferencesPluginConfig } from '../types.js';
import type { PluginRegistry } from '../../../core/plugin-registry.js';

describe('Preferences Plugin', () => {
  // Mock store
  const createMockStore = (): PreferencesStore => ({
    name: 'mock',
    initialize: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(true),
    shutdown: vi.fn().mockResolvedValue(undefined),
  });

  // Mock registry
  const createMockRegistry = (hasUsers = true): PluginRegistry =>
    ({
      hasPlugin: vi.fn().mockImplementation((id: string) => id === 'users' && hasUsers),
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

  let mockStore: PreferencesStore;
  let mockRegistry: PluginRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
    mockRegistry = createMockRegistry();
  });

  afterEach(async () => {
    // Clean up by stopping the plugin if it was started
    const store = getPreferencesStore();
    if (store) {
      const plugin = createPreferencesPlugin({ store: mockStore });
      await plugin.onStop();
    }
  });

  describe('createPreferencesPlugin', () => {
    it('should create a plugin with correct id', () => {
      const plugin = createPreferencesPlugin({ store: mockStore });
      expect(plugin.id).toBe('preferences');
    });

    it('should create a plugin with correct name', () => {
      const plugin = createPreferencesPlugin({ store: mockStore });
      expect(plugin.name).toBe('Preferences');
    });

    it('should create a plugin with version', () => {
      const plugin = createPreferencesPlugin({ store: mockStore });
      expect(plugin.version).toBe('1.0.0');
    });
  });

  describe('onStart', () => {
    it('should throw error if users plugin is not loaded', async () => {
      const registryWithoutUsers = createMockRegistry(false);
      const plugin = createPreferencesPlugin({ store: mockStore });

      await expect(plugin.onStart({}, registryWithoutUsers)).rejects.toThrow(
        'Preferences plugin requires Users plugin to be loaded first'
      );
    });

    it('should initialize store on start', async () => {
      const plugin = createPreferencesPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      expect(mockStore.initialize).toHaveBeenCalled();
    });

    it('should register health check', async () => {
      const plugin = createPreferencesPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'preferences-store',
          type: 'custom',
        })
      );
    });

    it('should register API routes by default', async () => {
      const plugin = createPreferencesPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.addRoute).toHaveBeenCalledTimes(3); // GET, PUT, DELETE
    });

    it('should register routes with correct paths', async () => {
      const plugin = createPreferencesPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;

      // Check GET route
      expect(calls[0][0]).toMatchObject({
        method: 'get',
        path: '/preferences',
        pluginId: 'preferences',
      });

      // Check PUT route
      expect(calls[1][0]).toMatchObject({
        method: 'put',
        path: '/preferences',
        pluginId: 'preferences',
      });

      // Check DELETE route
      expect(calls[2][0]).toMatchObject({
        method: 'delete',
        path: '/preferences',
        pluginId: 'preferences',
      });
    });

    it('should use custom API prefix when provided', async () => {
      const plugin = createPreferencesPlugin({
        store: mockStore,
        api: { prefix: '/user-prefs' },
      });
      await plugin.onStart({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;
      expect(calls[0][0].path).toBe('/user-prefs');
    });

    it('should not register routes when API is disabled', async () => {
      const plugin = createPreferencesPlugin({
        store: mockStore,
        api: { enabled: false },
      });
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.addRoute).not.toHaveBeenCalled();
    });

    it('should set store reference for helper functions', async () => {
      const plugin = createPreferencesPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      expect(getPreferencesStore()).toBe(mockStore);
    });
  });

  describe('onStop', () => {
    it('should shutdown store', async () => {
      const plugin = createPreferencesPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop();

      expect(mockStore.shutdown).toHaveBeenCalled();
    });

    it('should clear store reference', async () => {
      const plugin = createPreferencesPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop();

      expect(getPreferencesStore()).toBeNull();
    });
  });

  describe('helper functions', () => {
    describe('getPreferencesStore', () => {
      it('should return null when plugin not started', () => {
        expect(getPreferencesStore()).toBeNull();
      });

      it('should return store when plugin started', async () => {
        const plugin = createPreferencesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        expect(getPreferencesStore()).toBe(mockStore);
      });
    });

    describe('getPreferences', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(getPreferences('user-id')).rejects.toThrow(
          'Preferences plugin not initialized'
        );
      });

      it('should return defaults when no stored preferences', async () => {
        const defaults = { theme: 'light' };
        const plugin = createPreferencesPlugin({ store: mockStore, defaults });
        await plugin.onStart({}, mockRegistry);

        (mockStore.get as any).mockResolvedValue(null);

        const result = await getPreferences('user-id');
        expect(result).toEqual({ theme: 'light' });
      });

      it('should merge stored preferences with defaults', async () => {
        const defaults = { theme: 'light', notifications: { email: true } };
        const plugin = createPreferencesPlugin({ store: mockStore, defaults });
        await plugin.onStart({}, mockRegistry);

        (mockStore.get as any).mockResolvedValue({ theme: 'dark' });

        const result = await getPreferences('user-id');
        expect(result).toEqual({
          theme: 'dark',
          notifications: { email: true },
        });
      });

      it('should call store.get with userId', async () => {
        const plugin = createPreferencesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        await getPreferences('test-user-id');

        expect(mockStore.get).toHaveBeenCalledWith('test-user-id');
      });
    });

    describe('updatePreferences', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(updatePreferences('user-id', {})).rejects.toThrow(
          'Preferences plugin not initialized'
        );
      });

      it('should call store.update with userId and preferences', async () => {
        const plugin = createPreferencesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const prefs = { theme: 'dark' };
        (mockStore.update as any).mockResolvedValue(prefs);

        await updatePreferences('test-user-id', prefs);

        expect(mockStore.update).toHaveBeenCalledWith('test-user-id', prefs);
      });

      it('should merge result with defaults', async () => {
        const defaults = { notifications: { email: true } };
        const plugin = createPreferencesPlugin({ store: mockStore, defaults });
        await plugin.onStart({}, mockRegistry);

        (mockStore.update as any).mockResolvedValue({ theme: 'dark' });

        const result = await updatePreferences('user-id', { theme: 'dark' });
        expect(result).toEqual({
          theme: 'dark',
          notifications: { email: true },
        });
      });
    });

    describe('deletePreferences', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(deletePreferences('user-id')).rejects.toThrow(
          'Preferences plugin not initialized'
        );
      });

      it('should call store.delete with userId', async () => {
        const plugin = createPreferencesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        await deletePreferences('test-user-id');

        expect(mockStore.delete).toHaveBeenCalledWith('test-user-id');
      });

      it('should return store.delete result', async () => {
        const plugin = createPreferencesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        (mockStore.delete as any).mockResolvedValue(true);
        expect(await deletePreferences('user-id')).toBe(true);

        (mockStore.delete as any).mockResolvedValue(false);
        expect(await deletePreferences('user-id')).toBe(false);
      });
    });

    describe('getDefaultPreferences', () => {
      it('should return empty object when no defaults configured', async () => {
        const plugin = createPreferencesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        expect(getDefaultPreferences()).toEqual({});
      });

      it('should return configured defaults', async () => {
        const defaults = { theme: 'light', lang: 'en' };
        const plugin = createPreferencesPlugin({ store: mockStore, defaults });
        await plugin.onStart({}, mockRegistry);

        expect(getDefaultPreferences()).toEqual(defaults);
      });

      it('should return a copy (not reference)', async () => {
        const defaults = { theme: 'light' };
        const plugin = createPreferencesPlugin({ store: mockStore, defaults });
        await plugin.onStart({}, mockRegistry);

        const result = getDefaultPreferences();
        expect(result).not.toBe(defaults);
        expect(result).toEqual(defaults);
      });
    });
  });
});
