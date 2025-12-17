/**
 * Subscriptions Plugin
 *
 * Subscription tier and entitlement management plugin for @qwickapps/server.
 * Supports Stripe integration for paid subscriptions.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type {
  SubscriptionsPluginConfig,
  SubscriptionsStore,
  SubscriptionTier,
  SubscriptionEntitlement,
  UserSubscription,
  UserSubscriptionWithTier,
  CreateTierInput,
  UpdateTierInput,
  CreateEntitlementInput,
  CreateUserSubscriptionInput,
  UpdateUserSubscriptionInput,
  FeatureLimitResult,
} from './types.js';

// Store instance for helper access
let currentStore: SubscriptionsStore | null = null;
let currentConfig: SubscriptionsPluginConfig | null = null;

/**
 * Create the Subscriptions plugin
 */
export function createSubscriptionsPlugin(config: SubscriptionsPluginConfig): Plugin {
  const debug = config.debug || false;
  const defaultTierSlug = config.defaultTierSlug || 'free';
  const apiPrefix = config.api?.prefix || '/subscriptions';

  function log(message: string, data?: Record<string, unknown>) {
    if (debug) {
      console.log(`[SubscriptionsPlugin] ${message}`, data || '');
    }
  }

  return {
    id: 'subscriptions',
    name: 'Subscriptions',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      log('Starting subscriptions plugin');

      // Initialize the store (creates tables if needed)
      await config.store.initialize();
      log('Subscriptions plugin migrations complete');

      // Store references for helper access
      currentStore = config.store;
      currentConfig = config;

      // Register health check
      registry.registerHealthCheck({
        name: 'subscriptions-store',
        type: 'custom',
        check: async () => {
          try {
            const tiers = await config.store.listTiers(true);
            return {
              healthy: true,
              details: {
                tiersCount: tiers.length,
                defaultTier: defaultTierSlug,
              },
            };
          } catch {
            return { healthy: false };
          }
        },
      });

      // Add tier management routes
      if (config.api?.tierManagement !== false) {
        // List tiers
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/tiers`,
          pluginId: 'subscriptions',
          handler: async (req: Request, res: Response) => {
            try {
              const activeOnly = req.query.active !== 'false';
              const tiers = await config.store.listTiers(activeOnly);

              // Include entitlements if requested
              if (req.query.include === 'entitlements') {
                const tiersWithEntitlements = await Promise.all(
                  tiers.map(async (tier) => ({
                    ...tier,
                    entitlements: await config.store.getEntitlementsByTier(tier.id),
                  }))
                );
                return res.json({ tiers: tiersWithEntitlements });
              }

              res.json({ tiers });
            } catch (error) {
              console.error('[SubscriptionsPlugin] List tiers error:', error);
              res.status(500).json({ error: 'Failed to list tiers' });
            }
          },
        });

        // Get tier by ID or slug
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/tiers/:idOrSlug`,
          pluginId: 'subscriptions',
          handler: async (req: Request, res: Response) => {
            try {
              const { idOrSlug } = req.params;

              // Try by ID first, then by slug
              let tier = await config.store.getTierById(idOrSlug);
              if (!tier) {
                tier = await config.store.getTierBySlug(idOrSlug);
              }

              if (!tier) {
                return res.status(404).json({ error: 'Tier not found' });
              }

              const entitlements = await config.store.getEntitlementsByTier(tier.id);
              res.json({ ...tier, entitlements });
            } catch (error) {
              console.error('[SubscriptionsPlugin] Get tier error:', error);
              res.status(500).json({ error: 'Failed to get tier' });
            }
          },
        });

        // Create tier (admin only)
        registry.addRoute({
          method: 'post',
          path: `${apiPrefix}/tiers`,
          pluginId: 'subscriptions',
          handler: async (req: Request, res: Response) => {
            try {
              const input: CreateTierInput = req.body;

              if (!input.slug || !input.name) {
                return res.status(400).json({ error: 'slug and name are required' });
              }

              // Check for duplicate slug
              const existing = await config.store.getTierBySlug(input.slug);
              if (existing) {
                return res.status(409).json({ error: 'Tier with this slug already exists' });
              }

              const tier = await config.store.createTier(input);
              res.status(201).json(tier);
            } catch (error) {
              console.error('[SubscriptionsPlugin] Create tier error:', error);
              res.status(500).json({ error: 'Failed to create tier' });
            }
          },
        });

        // Update tier (admin only)
        registry.addRoute({
          method: 'put',
          path: `${apiPrefix}/tiers/:id`,
          pluginId: 'subscriptions',
          handler: async (req: Request, res: Response) => {
            try {
              const input: UpdateTierInput = req.body;
              const tier = await config.store.updateTier(req.params.id, input);

              if (!tier) {
                return res.status(404).json({ error: 'Tier not found' });
              }

              res.json(tier);
            } catch (error) {
              console.error('[SubscriptionsPlugin] Update tier error:', error);
              res.status(500).json({ error: 'Failed to update tier' });
            }
          },
        });

        // Set tier entitlements (admin only)
        registry.addRoute({
          method: 'put',
          path: `${apiPrefix}/tiers/:id/entitlements`,
          pluginId: 'subscriptions',
          handler: async (req: Request, res: Response) => {
            try {
              const { entitlements } = req.body as { entitlements: Array<{ feature_code: string; limit_value?: number }> };

              if (!Array.isArray(entitlements)) {
                return res.status(400).json({ error: 'entitlements array is required' });
              }

              await config.store.setTierEntitlements(req.params.id, entitlements);
              const updatedEntitlements = await config.store.getEntitlementsByTier(req.params.id);

              res.json({ entitlements: updatedEntitlements });
            } catch (error) {
              console.error('[SubscriptionsPlugin] Set entitlements error:', error);
              res.status(500).json({ error: 'Failed to set entitlements' });
            }
          },
        });
      }

      // Add user subscription routes
      if (config.api?.userSubscriptions !== false) {
        // Get user's active subscription
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/user/:userId`,
          pluginId: 'subscriptions',
          handler: async (req: Request, res: Response) => {
            try {
              const subscription = await config.store.getActiveSubscription(req.params.userId);

              if (!subscription) {
                return res.status(404).json({ error: 'No active subscription found' });
              }

              // Get entitlements for the tier
              const entitlements = await config.store.getEntitlementsByTier(subscription.tier_id);

              res.json({
                subscription,
                entitlements,
              });
            } catch (error) {
              console.error('[SubscriptionsPlugin] Get user subscription error:', error);
              res.status(500).json({ error: 'Failed to get subscription' });
            }
          },
        });

        // Create/update user subscription
        registry.addRoute({
          method: 'post',
          path: `${apiPrefix}/user/:userId`,
          pluginId: 'subscriptions',
          handler: async (req: Request, res: Response) => {
            try {
              const input: CreateUserSubscriptionInput = {
                user_id: req.params.userId,
                ...req.body,
              };

              if (!input.tier_id) {
                // Use default tier if not specified
                const defaultTier = await config.store.getTierBySlug(defaultTierSlug);
                if (!defaultTier) {
                  return res.status(400).json({ error: 'tier_id is required (no default tier found)' });
                }
                input.tier_id = defaultTier.id;
              }

              const subscription = await config.store.createUserSubscription(input);
              res.status(201).json(subscription);
            } catch (error) {
              console.error('[SubscriptionsPlugin] Create subscription error:', error);
              res.status(500).json({ error: 'Failed to create subscription' });
            }
          },
        });

        // Check feature limit
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/user/:userId/features/:featureCode`,
          pluginId: 'subscriptions',
          handler: async (req: Request, res: Response) => {
            try {
              const { userId, featureCode } = req.params;
              const result = await checkFeatureLimit(userId, featureCode);
              res.json(result);
            } catch (error) {
              console.error('[SubscriptionsPlugin] Check feature error:', error);
              res.status(500).json({ error: 'Failed to check feature' });
            }
          },
        });

        // Cancel subscription
        registry.addRoute({
          method: 'post',
          path: `${apiPrefix}/:id/cancel`,
          pluginId: 'subscriptions',
          handler: async (req: Request, res: Response) => {
            try {
              const success = await config.store.cancelSubscription(req.params.id);

              if (!success) {
                return res.status(404).json({ error: 'Subscription not found' });
              }

              const subscription = await config.store.getUserSubscriptionById(req.params.id);
              res.json(subscription);
            } catch (error) {
              console.error('[SubscriptionsPlugin] Cancel subscription error:', error);
              res.status(500).json({ error: 'Failed to cancel subscription' });
            }
          },
        });
      }

      log('Subscriptions plugin started');
    },

    async onStop(): Promise<void> {
      log('Stopping subscriptions plugin');
      await config.store.shutdown();
      currentStore = null;
      currentConfig = null;
      log('Subscriptions plugin stopped');
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the current subscriptions store instance
 */
export function getSubscriptionsStore(): SubscriptionsStore | null {
  return currentStore;
}

/**
 * Create a subscription tier
 */
export async function createTier(input: CreateTierInput): Promise<SubscriptionTier> {
  if (!currentStore) {
    throw new Error('Subscriptions plugin not initialized');
  }
  return currentStore.createTier(input);
}

/**
 * Get tier by slug
 */
export async function getTierBySlug(slug: string): Promise<SubscriptionTier | null> {
  if (!currentStore) {
    throw new Error('Subscriptions plugin not initialized');
  }
  return currentStore.getTierBySlug(slug);
}

/**
 * Get tier by ID
 */
export async function getTierById(id: string): Promise<SubscriptionTier | null> {
  if (!currentStore) {
    throw new Error('Subscriptions plugin not initialized');
  }
  return currentStore.getTierById(id);
}

/**
 * List all tiers
 */
export async function listTiers(activeOnly = true): Promise<SubscriptionTier[]> {
  if (!currentStore) {
    throw new Error('Subscriptions plugin not initialized');
  }
  return currentStore.listTiers(activeOnly);
}

/**
 * Get entitlements for a tier
 */
export async function getTierEntitlements(tierId: string): Promise<SubscriptionEntitlement[]> {
  if (!currentStore) {
    throw new Error('Subscriptions plugin not initialized');
  }
  return currentStore.getEntitlementsByTier(tierId);
}

/**
 * Set entitlements for a tier
 */
export async function setTierEntitlements(
  tierId: string,
  entitlements: Array<{ feature_code: string; limit_value?: number }>
): Promise<void> {
  if (!currentStore) {
    throw new Error('Subscriptions plugin not initialized');
  }
  return currentStore.setTierEntitlements(tierId, entitlements);
}

/**
 * Get user's active subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscriptionWithTier | null> {
  if (!currentStore) {
    throw new Error('Subscriptions plugin not initialized');
  }
  return currentStore.getActiveSubscription(userId);
}

/**
 * Create a user subscription
 */
export async function createUserSubscription(input: CreateUserSubscriptionInput): Promise<UserSubscription> {
  if (!currentStore) {
    throw new Error('Subscriptions plugin not initialized');
  }
  return currentStore.createUserSubscription(input);
}

/**
 * Update a user subscription
 */
export async function updateUserSubscription(
  id: string,
  input: UpdateUserSubscriptionInput
): Promise<UserSubscription | null> {
  if (!currentStore) {
    throw new Error('Subscriptions plugin not initialized');
  }
  return currentStore.updateUserSubscription(id, input);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(id: string): Promise<boolean> {
  if (!currentStore) {
    throw new Error('Subscriptions plugin not initialized');
  }
  return currentStore.cancelSubscription(id);
}

/**
 * Get user's tier slug
 */
export async function getUserTierSlug(userId: string): Promise<string | null> {
  const subscription = await getUserSubscription(userId);
  return subscription?.tier.slug || null;
}

/**
 * Get feature limit for a user
 */
export async function getFeatureLimit(userId: string, featureCode: string): Promise<number | null> {
  if (!currentStore) {
    throw new Error('Subscriptions plugin not initialized');
  }
  return currentStore.getFeatureLimit(userId, featureCode);
}

/**
 * Check if user has a feature
 */
export async function hasFeature(userId: string, featureCode: string): Promise<boolean> {
  if (!currentStore) {
    throw new Error('Subscriptions plugin not initialized');
  }
  return currentStore.hasFeature(userId, featureCode);
}

/**
 * Check feature limit and availability
 */
export async function checkFeatureLimit(userId: string, featureCode: string): Promise<FeatureLimitResult> {
  if (!currentStore) {
    throw new Error('Subscriptions plugin not initialized');
  }

  const limit = await currentStore.getFeatureLimit(userId, featureCode);

  if (limit === null) {
    return { available: false };
  }

  if (limit === 0) {
    return { available: false, limit: 0 };
  }

  // -1 means unlimited
  if (limit === -1) {
    return { available: true, limit: -1 };
  }

  // Note: Current usage would need to come from usage-plugin
  return { available: true, limit };
}

/**
 * Ensure user has a subscription (create default if not)
 */
export async function ensureUserSubscription(userId: string): Promise<UserSubscriptionWithTier> {
  if (!currentStore || !currentConfig) {
    throw new Error('Subscriptions plugin not initialized');
  }

  let subscription = await currentStore.getActiveSubscription(userId);

  if (!subscription) {
    // Create default subscription
    const defaultTierSlug = currentConfig.defaultTierSlug || 'free';
    const defaultTier = await currentStore.getTierBySlug(defaultTierSlug);

    if (!defaultTier) {
      throw new Error(`Default tier '${defaultTierSlug}' not found`);
    }

    await currentStore.createUserSubscription({
      user_id: userId,
      tier_id: defaultTier.id,
    });

    subscription = await currentStore.getActiveSubscription(userId);
    if (!subscription) {
      throw new Error('Failed to create subscription');
    }
  }

  return subscription;
}
