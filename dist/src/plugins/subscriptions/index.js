/**
 * Subscriptions Plugin
 *
 * Subscription tier and entitlement management.
 * Exports all subscription-related functionality.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Main plugin
export { createSubscriptionsPlugin, getSubscriptionsStore, createTier, getTierBySlug, getTierById, listTiers, getTierEntitlements, setTierEntitlements, getUserSubscription, createUserSubscription, updateUserSubscription, cancelSubscription, getUserTierSlug, getFeatureLimit, hasFeature, checkFeatureLimit, ensureUserSubscription, } from './subscriptions-plugin.js';
// Stores
export { postgresSubscriptionsStore } from './stores/index.js';
// UI Components
export { SubscriptionsStatusWidget } from './SubscriptionsStatusWidget.js';
export { SubscriptionsManagementPage } from './SubscriptionsManagementPage.js';
//# sourceMappingURL=index.js.map