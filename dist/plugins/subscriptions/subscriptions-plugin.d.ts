/**
 * Subscriptions Plugin
 *
 * Subscription tier and entitlement management plugin for @qwickapps/server.
 * Supports Stripe integration for paid subscriptions.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
import type { SubscriptionsPluginConfig, SubscriptionsStore, SubscriptionTier, SubscriptionEntitlement, UserSubscription, UserSubscriptionWithTier, CreateTierInput, CreateUserSubscriptionInput, UpdateUserSubscriptionInput, FeatureLimitResult } from './types.js';
/**
 * Create the Subscriptions plugin
 */
export declare function createSubscriptionsPlugin(config: SubscriptionsPluginConfig): Plugin;
/**
 * Get the current subscriptions store instance
 */
export declare function getSubscriptionsStore(): SubscriptionsStore | null;
/**
 * Create a subscription tier
 */
export declare function createTier(input: CreateTierInput): Promise<SubscriptionTier>;
/**
 * Get tier by slug
 */
export declare function getTierBySlug(slug: string): Promise<SubscriptionTier | null>;
/**
 * Get tier by ID
 */
export declare function getTierById(id: string): Promise<SubscriptionTier | null>;
/**
 * List all tiers
 */
export declare function listTiers(activeOnly?: boolean): Promise<SubscriptionTier[]>;
/**
 * Get entitlements for a tier
 */
export declare function getTierEntitlements(tierId: string): Promise<SubscriptionEntitlement[]>;
/**
 * Set entitlements for a tier
 */
export declare function setTierEntitlements(tierId: string, entitlements: Array<{
    feature_code: string;
    limit_value?: number;
}>): Promise<void>;
/**
 * Get user's active subscription
 */
export declare function getUserSubscription(userId: string): Promise<UserSubscriptionWithTier | null>;
/**
 * Create a user subscription
 */
export declare function createUserSubscription(input: CreateUserSubscriptionInput): Promise<UserSubscription>;
/**
 * Update a user subscription
 */
export declare function updateUserSubscription(id: string, input: UpdateUserSubscriptionInput): Promise<UserSubscription | null>;
/**
 * Cancel a subscription
 */
export declare function cancelSubscription(id: string): Promise<boolean>;
/**
 * Get user's tier slug
 */
export declare function getUserTierSlug(userId: string): Promise<string | null>;
/**
 * Get feature limit for a user
 */
export declare function getFeatureLimit(userId: string, featureCode: string): Promise<number | null>;
/**
 * Check if user has a feature
 */
export declare function hasFeature(userId: string, featureCode: string): Promise<boolean>;
/**
 * Check feature limit and availability
 */
export declare function checkFeatureLimit(userId: string, featureCode: string): Promise<FeatureLimitResult>;
/**
 * Ensure user has a subscription (create default if not)
 */
export declare function ensureUserSubscription(userId: string): Promise<UserSubscriptionWithTier>;
//# sourceMappingURL=subscriptions-plugin.d.ts.map