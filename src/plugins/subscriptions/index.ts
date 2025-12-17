/**
 * Subscriptions Plugin
 *
 * Subscription tier and entitlement management.
 * Exports all subscription-related functionality.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

// Main plugin
export {
  createSubscriptionsPlugin,
  getSubscriptionsStore,
  createTier,
  getTierBySlug,
  getTierById,
  listTiers,
  getTierEntitlements,
  setTierEntitlements,
  getUserSubscription,
  createUserSubscription,
  updateUserSubscription,
  cancelSubscription,
  getUserTierSlug,
  getFeatureLimit,
  hasFeature,
  checkFeatureLimit,
  ensureUserSubscription,
} from './subscriptions-plugin.js';

// Types
export type {
  SubscriptionTier,
  SubscriptionEntitlement,
  UserSubscription,
  UserSubscriptionWithTier,
  SubscriptionStatus,
  FeatureLimitResult,
  CreateTierInput,
  UpdateTierInput,
  CreateEntitlementInput,
  CreateUserSubscriptionInput,
  UpdateUserSubscriptionInput,
  SubscriptionsStore,
  SubscriptionsPluginConfig,
  SubscriptionsApiConfig,
  PostgresSubscriptionsStoreConfig,
} from './types.js';

// Stores
export { postgresSubscriptionsStore } from './stores/index.js';
