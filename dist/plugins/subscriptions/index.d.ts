/**
 * Subscriptions Plugin
 *
 * Subscription tier and entitlement management.
 * Exports all subscription-related functionality.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export { createSubscriptionsPlugin, getSubscriptionsStore, createTier, getTierBySlug, getTierById, listTiers, getTierEntitlements, setTierEntitlements, getUserSubscription, createUserSubscription, updateUserSubscription, cancelSubscription, getUserTierSlug, getFeatureLimit, hasFeature, checkFeatureLimit, ensureUserSubscription, } from './subscriptions-plugin.js';
export type { SubscriptionTier, SubscriptionEntitlement, UserSubscription, UserSubscriptionWithTier, SubscriptionStatus, FeatureLimitResult, CreateTierInput, UpdateTierInput, CreateEntitlementInput, CreateUserSubscriptionInput, UpdateUserSubscriptionInput, SubscriptionsStore, SubscriptionsPluginConfig, SubscriptionsApiConfig, PostgresSubscriptionsStoreConfig, } from './types.js';
export { postgresSubscriptionsStore } from './stores/index.js';
export { SubscriptionsStatusWidget } from './SubscriptionsStatusWidget.js';
export type { SubscriptionsStatusWidgetProps } from './SubscriptionsStatusWidget.js';
export { SubscriptionsManagementPage } from './SubscriptionsManagementPage.js';
export type { SubscriptionsManagementPageProps } from './SubscriptionsManagementPage.js';
//# sourceMappingURL=index.d.ts.map