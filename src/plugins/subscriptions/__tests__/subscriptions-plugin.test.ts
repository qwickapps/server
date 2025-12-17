/**
 * Subscriptions Plugin Tests
 *
 * Unit tests for the subscriptions plugin including:
 * - Plugin lifecycle
 * - Tier management
 * - Entitlement checks
 * - User subscription management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createSubscriptionsPlugin,
  getSubscriptionsStore,
  getTierById,
  getTierBySlug,
  listTiers,
  createTier,
  getUserSubscription,
  createUserSubscription,
  getFeatureLimit,
  hasFeature,
} from '../subscriptions-plugin.js';
import type {
  SubscriptionsStore,
  SubscriptionTier,
  UserSubscription,
  SubscriptionEntitlement,
} from '../types.js';
import type { PluginRegistry } from '../../../core/plugin-registry.js';

describe('Subscriptions Plugin', () => {
  // Mock tier data
  const mockTier: SubscriptionTier = {
    id: 'tier-id-123',
    slug: 'premium',
    name: 'Premium Plan',
    description: 'Full access to all features',
    price_monthly_cents: 999,
    price_yearly_cents: 9990,
    stripe_price_id_monthly: 'price_monthly_123',
    stripe_price_id_yearly: 'price_yearly_123',
    is_active: true,
    sort_order: 1,
    metadata: {},
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockEntitlement: SubscriptionEntitlement = {
    id: 'entitlement-id-123',
    tier_id: mockTier.id,
    feature_code: 'ai_messages_daily',
    limit_value: -1, // unlimited
    metadata: {},
  };

  const mockSubscription: UserSubscription = {
    id: 'subscription-id-123',
    user_id: 'user-123',
    tier_id: mockTier.id,
    stripe_customer_id: 'cus_123',
    stripe_subscription_id: 'sub_123',
    status: 'active',
    current_period_start: new Date(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancel_at_period_end: false,
    metadata: {},
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Mock store factory
  const createMockStore = (): SubscriptionsStore => ({
    name: 'mock',
    initialize: vi.fn().mockResolvedValue(undefined),
    // Tiers
    createTier: vi.fn().mockResolvedValue(mockTier),
    getTierById: vi.fn().mockResolvedValue(mockTier),
    getTierBySlug: vi.fn().mockResolvedValue(mockTier),
    listTiers: vi.fn().mockResolvedValue([mockTier]),
    updateTier: vi.fn().mockResolvedValue(mockTier),
    deleteTier: vi.fn().mockResolvedValue(true),
    // Entitlements
    createEntitlement: vi.fn().mockResolvedValue(mockEntitlement),
    getEntitlementsByTier: vi.fn().mockResolvedValue([mockEntitlement]),
    updateEntitlement: vi.fn().mockResolvedValue(mockEntitlement),
    deleteEntitlement: vi.fn().mockResolvedValue(true),
    setTierEntitlements: vi.fn().mockResolvedValue(undefined),
    // User subscriptions
    createUserSubscription: vi.fn().mockResolvedValue(mockSubscription),
    getUserSubscriptionById: vi.fn().mockResolvedValue(mockSubscription),
    getActiveSubscription: vi.fn().mockResolvedValue({
      ...mockSubscription,
      tier: mockTier,
    }),
    getByStripeSubscriptionId: vi.fn().mockResolvedValue(mockSubscription),
    updateUserSubscription: vi.fn().mockResolvedValue(mockSubscription),
    cancelSubscription: vi.fn().mockResolvedValue(true),
    getFeatureLimit: vi.fn().mockResolvedValue(-1), // unlimited
    hasFeature: vi.fn().mockResolvedValue(true),
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

  let mockStore: SubscriptionsStore;
  let mockRegistry: PluginRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
    mockRegistry = createMockRegistry();
  });

  afterEach(async () => {
    // Clean up
    const store = getSubscriptionsStore();
    if (store) {
      const plugin = createSubscriptionsPlugin({ store: mockStore });
      await plugin.onStop?.();
    }
  });

  describe('createSubscriptionsPlugin', () => {
    it('should create a plugin with correct id', () => {
      const plugin = createSubscriptionsPlugin({ store: mockStore });
      expect(plugin.id).toBe('subscriptions');
    });

    it('should create a plugin with correct name', () => {
      const plugin = createSubscriptionsPlugin({ store: mockStore });
      expect(plugin.name).toBe('Subscriptions');
    });

    it('should create a plugin with version', () => {
      const plugin = createSubscriptionsPlugin({ store: mockStore });
      expect(plugin.version).toBe('1.0.0');
    });
  });

  describe('onStart', () => {
    it('should initialize store on start', async () => {
      const plugin = createSubscriptionsPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      expect(mockStore.initialize).toHaveBeenCalled();
    });

    it('should register health check', async () => {
      const plugin = createSubscriptionsPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'subscriptions-store',
          type: 'custom',
        })
      );
    });
  });

  describe('onStop', () => {
    it('should shutdown store', async () => {
      const plugin = createSubscriptionsPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop?.();

      expect(mockStore.shutdown).toHaveBeenCalled();
    });

    it('should clear store reference', async () => {
      const plugin = createSubscriptionsPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop?.();

      expect(getSubscriptionsStore()).toBeNull();
    });
  });

  describe('helper functions', () => {
    describe('getSubscriptionsStore', () => {
      it('should return null when plugin not started', () => {
        expect(getSubscriptionsStore()).toBeNull();
      });

      it('should return store when plugin started', async () => {
        const plugin = createSubscriptionsPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        expect(getSubscriptionsStore()).toBe(mockStore);
      });
    });

    describe('getTierById', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(getTierById('tier-id')).rejects.toThrow(
          'Subscriptions plugin not initialized'
        );
      });

      it('should return tier when found', async () => {
        const plugin = createSubscriptionsPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await getTierById(mockTier.id);
        expect(result).toEqual(mockTier);
      });
    });

    describe('getTierBySlug', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(getTierBySlug('premium')).rejects.toThrow(
          'Subscriptions plugin not initialized'
        );
      });

      it('should return tier when found', async () => {
        const plugin = createSubscriptionsPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await getTierBySlug('premium');
        expect(result).toEqual(mockTier);
      });
    });

    describe('listTiers', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(listTiers()).rejects.toThrow(
          'Subscriptions plugin not initialized'
        );
      });

      it('should return all tiers', async () => {
        const plugin = createSubscriptionsPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await listTiers();

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(mockTier);
      });
    });

    describe('createTier', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          createTier({ slug: 'new', name: 'New Tier' })
        ).rejects.toThrow('Subscriptions plugin not initialized');
      });

      it('should create tier', async () => {
        const plugin = createSubscriptionsPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await createTier({ slug: 'new', name: 'New Tier' });

        expect(result).toEqual(mockTier);
        expect(mockStore.createTier).toHaveBeenCalled();
      });
    });

    describe('getUserSubscription', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(getUserSubscription('user-id')).rejects.toThrow(
          'Subscriptions plugin not initialized'
        );
      });

      it('should return user subscription with tier', async () => {
        const plugin = createSubscriptionsPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await getUserSubscription('user-123');

        expect(result?.user_id).toBe('user-123');
        expect(result?.tier).toBeDefined();
      });

      it('should return null when no subscription', async () => {
        const plugin = createSubscriptionsPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        (mockStore.getActiveSubscription as any).mockResolvedValue(null);

        const result = await getUserSubscription('user-no-sub');
        expect(result).toBeNull();
      });
    });

    describe('createUserSubscription', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          createUserSubscription({
            user_id: 'user-123',
            tier_id: mockTier.id,
          })
        ).rejects.toThrow('Subscriptions plugin not initialized');
      });

      it('should create subscription', async () => {
        const plugin = createSubscriptionsPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await createUserSubscription({
          user_id: 'user-123',
          tier_id: mockTier.id,
        });

        expect(result).toEqual(mockSubscription);
        expect(mockStore.createUserSubscription).toHaveBeenCalled();
      });
    });

    describe('getFeatureLimit', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          getFeatureLimit('user-id', 'ai_messages_daily')
        ).rejects.toThrow('Subscriptions plugin not initialized');
      });

      it('should return -1 for unlimited feature', async () => {
        const plugin = createSubscriptionsPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await getFeatureLimit('user-123', 'ai_messages_daily');
        expect(result).toBe(-1);
      });

      it('should return limit value', async () => {
        const plugin = createSubscriptionsPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        (mockStore.getFeatureLimit as any).mockResolvedValue(100);

        const result = await getFeatureLimit('user-123', 'vision_calls_daily');
        expect(result).toBe(100);
      });

      it('should return null when no subscription', async () => {
        const plugin = createSubscriptionsPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        (mockStore.getFeatureLimit as any).mockResolvedValue(null);

        const result = await getFeatureLimit('user-no-sub', 'ai_messages_daily');
        expect(result).toBeNull();
      });
    });

    describe('hasFeature', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          hasFeature('user-id', 'ai_messages_daily')
        ).rejects.toThrow('Subscriptions plugin not initialized');
      });

      it('should return true when user has feature', async () => {
        const plugin = createSubscriptionsPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await hasFeature('user-123', 'ai_messages_daily');
        expect(result).toBe(true);
      });

      it('should return false when user lacks feature', async () => {
        const plugin = createSubscriptionsPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        (mockStore.hasFeature as any).mockResolvedValue(false);

        const result = await hasFeature('user-123', 'premium_feature');
        expect(result).toBe(false);
      });
    });
  });
});
