/**
 * Usage Plugin Tests
 *
 * Unit tests for the usage tracking plugin including:
 * - Plugin lifecycle
 * - Daily/monthly usage tracking
 * - Increment and check limits
 * - Cleanup operations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createUsagePlugin,
  getUsageStore,
  getDailyUsage,
  incrementUsage,
  checkUsageLimit,
  getDailyUsageSummary,
  resetUsage,
} from '../usage-plugin.js';
import type { UsageStore, DailyUsage, MonthlyUsage } from '../types.js';
import type { PluginRegistry } from '../../../core/plugin-registry.js';

// Mock the subscriptions plugin (usage plugin depends on it for limits)
vi.mock('../../subscriptions/subscriptions-plugin.js', () => ({
  getFeatureLimit: vi.fn().mockResolvedValue(-1), // unlimited by default
  hasFeature: vi.fn().mockResolvedValue(true),
}));

import { getFeatureLimit } from '../../subscriptions/subscriptions-plugin.js';

describe('Usage Plugin', () => {
  // Mock usage data
  const mockDailyUsage: DailyUsage = {
    id: 'usage-id-123',
    user_id: 'user-123',
    feature_code: 'ai_messages',
    date: new Date().toISOString().split('T')[0],
    count: 10,
    metadata: {},
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockMonthlyUsage: MonthlyUsage = {
    id: 'monthly-id-123',
    user_id: 'user-123',
    feature_code: 'ai_messages',
    year_month: new Date().toISOString().substring(0, 7),
    count: 300,
    metadata: {},
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Mock store factory
  const createMockStore = (): UsageStore => ({
    name: 'mock',
    initialize: vi.fn().mockResolvedValue(undefined),
    getDailyUsage: vi.fn().mockResolvedValue(mockDailyUsage),
    getMonthlyUsage: vi.fn().mockResolvedValue(mockMonthlyUsage),
    incrementDaily: vi.fn().mockResolvedValue(11),
    getAllDailyUsage: vi.fn().mockResolvedValue([mockDailyUsage]),
    getAllMonthlyUsage: vi.fn().mockResolvedValue([mockMonthlyUsage]),
    resetDailyUsage: vi.fn().mockResolvedValue(undefined),
    cleanupOldDaily: vi.fn().mockResolvedValue(100),
    cleanupOldMonthly: vi.fn().mockResolvedValue(12),
    shutdown: vi.fn().mockResolvedValue(undefined),
  });

  // Mock registry factory
  const createMockRegistry = (): PluginRegistry =>
    ({
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
      getRouter: vi.fn().mockReturnValue({} as any),
      getLogger: vi.fn().mockReturnValue({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      }),
    }) as unknown as PluginRegistry;

  let mockStore: UsageStore;
  let mockRegistry: PluginRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
    mockRegistry = createMockRegistry();
  });

  afterEach(async () => {
    // Clean up
    const store = getUsageStore();
    if (store) {
      const plugin = createUsagePlugin({ store: mockStore });
      await plugin.onStop?.();
    }
  });

  describe('createUsagePlugin', () => {
    it('should create a plugin with correct id', () => {
      const plugin = createUsagePlugin({ store: mockStore });
      expect(plugin.id).toBe('usage');
    });

    it('should create a plugin with correct name', () => {
      const plugin = createUsagePlugin({ store: mockStore });
      expect(plugin.name).toBe('Usage');
    });

    it('should create a plugin with version', () => {
      const plugin = createUsagePlugin({ store: mockStore });
      expect(plugin.version).toBe('1.0.0');
    });
  });

  describe('onStart', () => {
    it('should initialize store on start', async () => {
      const plugin = createUsagePlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      expect(mockStore.initialize).toHaveBeenCalled();
    });

    it('should register health check', async () => {
      const plugin = createUsagePlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'usage-store',
          type: 'custom',
        })
      );
    });
  });

  describe('onStop', () => {
    it('should shutdown store', async () => {
      const plugin = createUsagePlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop?.();

      expect(mockStore.shutdown).toHaveBeenCalled();
    });

    it('should clear store reference', async () => {
      const plugin = createUsagePlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop?.();

      expect(getUsageStore()).toBeNull();
    });
  });

  describe('helper functions', () => {
    describe('getUsageStore', () => {
      it('should return null when plugin not started', () => {
        expect(getUsageStore()).toBeNull();
      });

      it('should return store when plugin started', async () => {
        const plugin = createUsagePlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        expect(getUsageStore()).toBe(mockStore);
      });
    });

    describe('getDailyUsage', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          getDailyUsage('user-id', 'ai_messages')
        ).rejects.toThrow('Usage plugin not initialized');
      });

      it('should return daily usage count', async () => {
        const plugin = createUsagePlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await getDailyUsage('user-123', 'ai_messages');
        expect(result).toBe(10); // count from mockDailyUsage
      });

      it('should return 0 when no usage', async () => {
        const plugin = createUsagePlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        (mockStore.getDailyUsage as any).mockResolvedValue(null);

        const result = await getDailyUsage('user-123', 'unused_feature');
        expect(result).toBe(0);
      });
    });

    describe('incrementUsage', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          incrementUsage('user-id', 'ai_messages')
        ).rejects.toThrow('Usage plugin not initialized');
      });

      it('should increment and return result', async () => {
        const plugin = createUsagePlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await incrementUsage('user-123', 'ai_messages');

        expect(result.allowed).toBe(true);
        expect(result.current_count).toBeDefined();
        expect(mockStore.incrementDaily).toHaveBeenCalled();
      });

      it('should increment by custom amount', async () => {
        const plugin = createUsagePlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        (mockStore.incrementDaily as any).mockResolvedValue(15);

        const result = await incrementUsage('user-123', 'ai_messages', 5);

        expect(result.allowed).toBe(true);
        expect(result.current_count).toBe(15);
      });
    });

    describe('checkUsageLimit', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          checkUsageLimit('user-id', 'ai_messages', 50)
        ).rejects.toThrow('Usage plugin not initialized');
      });

      it('should return usage limit result', async () => {
        const plugin = createUsagePlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        // Reset mock to return -1 (unlimited)
        (getFeatureLimit as any).mockResolvedValue(-1);

        const result = await checkUsageLimit('user-123', 'ai_messages', -1);

        // Should return a result object with usage info
        expect(result).toHaveProperty('allowed');
        expect(result).toHaveProperty('current_count');
        expect(result).toHaveProperty('limit');
      });
    });

    describe('resetUsage', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          resetUsage('user-id', 'ai_messages')
        ).rejects.toThrow('Usage plugin not initialized');
      });

      it('should reset usage', async () => {
        const plugin = createUsagePlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        await resetUsage('user-123', 'ai_messages');

        expect(mockStore.resetDailyUsage).toHaveBeenCalledWith(
          'user-123',
          'ai_messages'
        );
      });
    });
  });
});
