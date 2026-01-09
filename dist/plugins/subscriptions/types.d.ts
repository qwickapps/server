/**
 * Subscriptions Plugin Types
 *
 * Type definitions for subscription tier management and feature entitlements.
 * Supports Stripe integration for paid subscriptions.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Subscription status
 */
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive';
/**
 * Subscription tier definition (admin-managed)
 */
export interface SubscriptionTier {
    /** Primary key - UUID */
    id: string;
    /** URL-safe identifier (e.g., 'free', 'premium', 'family') */
    slug: string;
    /** Display name */
    name: string;
    /** Description */
    description?: string;
    /** Monthly price in cents (null = free) */
    price_monthly_cents?: number;
    /** Yearly price in cents (null = free or monthly only) */
    price_yearly_cents?: number;
    /** Stripe price ID for monthly billing */
    stripe_price_id_monthly?: string;
    /** Stripe price ID for yearly billing */
    stripe_price_id_yearly?: string;
    /** Whether this tier is active (available for new subscriptions) */
    is_active: boolean;
    /** Sort order for display */
    sort_order: number;
    /** Additional metadata */
    metadata: Record<string, unknown>;
    /** When the tier was created */
    created_at: Date;
    /** When the tier was last updated */
    updated_at: Date;
}
/**
 * Feature entitlement per tier
 */
export interface SubscriptionEntitlement {
    /** Primary key - UUID */
    id: string;
    /** Tier this entitlement belongs to */
    tier_id: string;
    /** Feature code (e.g., 'ai_messages_daily', 'vision_calls_daily') */
    feature_code: string;
    /** Limit value (-1 = unlimited, null = disabled, positive = limit) */
    limit_value?: number;
    /** Additional metadata */
    metadata: Record<string, unknown>;
}
/**
 * User subscription record
 */
export interface UserSubscription {
    /** Primary key - UUID */
    id: string;
    /** User ID */
    user_id: string;
    /** Tier ID */
    tier_id: string;
    /** Stripe customer ID */
    stripe_customer_id?: string;
    /** Stripe subscription ID */
    stripe_subscription_id?: string;
    /** Subscription status */
    status: SubscriptionStatus;
    /** Current billing period start */
    current_period_start?: Date;
    /** Current billing period end */
    current_period_end?: Date;
    /** Whether to cancel at period end */
    cancel_at_period_end: boolean;
    /** Additional metadata */
    metadata: Record<string, unknown>;
    /** When the subscription was created */
    created_at: Date;
    /** When the subscription was last updated */
    updated_at: Date;
}
/**
 * User subscription with tier details
 */
export interface UserSubscriptionWithTier extends UserSubscription {
    tier: SubscriptionTier;
}
/**
 * Feature limit check result
 */
export interface FeatureLimitResult {
    /** Whether the feature is available */
    available: boolean;
    /** Limit value (-1 = unlimited) */
    limit?: number;
    /** Current usage (if tracked) */
    current?: number;
    /** Remaining quota (if tracked) */
    remaining?: number;
}
/**
 * Tier creation payload
 */
export interface CreateTierInput {
    slug: string;
    name: string;
    description?: string;
    price_monthly_cents?: number;
    price_yearly_cents?: number;
    stripe_price_id_monthly?: string;
    stripe_price_id_yearly?: string;
    is_active?: boolean;
    sort_order?: number;
    metadata?: Record<string, unknown>;
}
/**
 * Tier update payload
 */
export interface UpdateTierInput {
    name?: string;
    description?: string;
    price_monthly_cents?: number;
    price_yearly_cents?: number;
    stripe_price_id_monthly?: string;
    stripe_price_id_yearly?: string;
    is_active?: boolean;
    sort_order?: number;
    metadata?: Record<string, unknown>;
}
/**
 * Entitlement creation payload
 */
export interface CreateEntitlementInput {
    tier_id: string;
    feature_code: string;
    limit_value?: number;
    metadata?: Record<string, unknown>;
}
/**
 * User subscription creation payload
 */
export interface CreateUserSubscriptionInput {
    user_id: string;
    tier_id: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    status?: SubscriptionStatus;
    current_period_start?: Date;
    current_period_end?: Date;
    metadata?: Record<string, unknown>;
}
/**
 * User subscription update payload
 */
export interface UpdateUserSubscriptionInput {
    tier_id?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    status?: SubscriptionStatus;
    current_period_start?: Date;
    current_period_end?: Date;
    cancel_at_period_end?: boolean;
    metadata?: Record<string, unknown>;
}
/**
 * Subscriptions store interface
 */
export interface SubscriptionsStore {
    /** Store name (e.g., 'postgres') */
    name: string;
    /**
     * Initialize the store (create tables, etc.)
     */
    initialize(): Promise<void>;
    /**
     * Create a subscription tier
     */
    createTier(input: CreateTierInput): Promise<SubscriptionTier>;
    /**
     * Get tier by ID
     */
    getTierById(id: string): Promise<SubscriptionTier | null>;
    /**
     * Get tier by slug
     */
    getTierBySlug(slug: string): Promise<SubscriptionTier | null>;
    /**
     * List all tiers
     */
    listTiers(activeOnly?: boolean): Promise<SubscriptionTier[]>;
    /**
     * Update a tier
     */
    updateTier(id: string, input: UpdateTierInput): Promise<SubscriptionTier | null>;
    /**
     * Delete a tier (soft delete)
     */
    deleteTier(id: string): Promise<boolean>;
    /**
     * Create an entitlement
     */
    createEntitlement(input: CreateEntitlementInput): Promise<SubscriptionEntitlement>;
    /**
     * Get entitlements for a tier
     */
    getEntitlementsByTier(tierId: string): Promise<SubscriptionEntitlement[]>;
    /**
     * Update an entitlement
     */
    updateEntitlement(id: string, limitValue: number | null): Promise<SubscriptionEntitlement | null>;
    /**
     * Delete an entitlement
     */
    deleteEntitlement(id: string): Promise<boolean>;
    /**
     * Set multiple entitlements for a tier (upsert)
     */
    setTierEntitlements(tierId: string, entitlements: Array<{
        feature_code: string;
        limit_value?: number;
    }>): Promise<void>;
    /**
     * Create a user subscription
     */
    createUserSubscription(input: CreateUserSubscriptionInput): Promise<UserSubscription>;
    /**
     * Get user subscription by ID
     */
    getUserSubscriptionById(id: string): Promise<UserSubscription | null>;
    /**
     * Get active subscription for a user
     */
    getActiveSubscription(userId: string): Promise<UserSubscriptionWithTier | null>;
    /**
     * Get subscription by Stripe subscription ID
     */
    getByStripeSubscriptionId(stripeSubId: string): Promise<UserSubscription | null>;
    /**
     * Update user subscription
     */
    updateUserSubscription(id: string, input: UpdateUserSubscriptionInput): Promise<UserSubscription | null>;
    /**
     * Cancel subscription (sets cancel_at_period_end)
     */
    cancelSubscription(id: string): Promise<boolean>;
    /**
     * Get feature limit for a user
     */
    getFeatureLimit(userId: string, featureCode: string): Promise<number | null>;
    /**
     * Check if user has a feature
     */
    hasFeature(userId: string, featureCode: string): Promise<boolean>;
    /**
     * Shutdown the store
     */
    shutdown(): Promise<void>;
}
/**
 * PostgreSQL subscriptions store configuration
 */
export interface PostgresSubscriptionsStoreConfig {
    /** PostgreSQL pool instance or a function that returns one */
    pool: unknown | (() => unknown);
    /** Tiers table name (default: 'subscription_tiers') */
    tiersTable?: string;
    /** Entitlements table name (default: 'subscription_entitlements') */
    entitlementsTable?: string;
    /** User subscriptions table name (default: 'user_subscriptions') */
    userSubscriptionsTable?: string;
    /** Schema name (default: 'public') */
    schema?: string;
    /** Auto-create tables on init (default: true) */
    autoCreateTables?: boolean;
}
/**
 * API configuration
 */
export interface SubscriptionsApiConfig {
    /** API route prefix (default: '/subscriptions') */
    prefix?: string;
    /** Enable tier management endpoints */
    tierManagement?: boolean;
    /** Enable user subscription endpoints */
    userSubscriptions?: boolean;
}
/**
 * Subscriptions plugin configuration
 */
export interface SubscriptionsPluginConfig {
    /** Subscriptions storage backend */
    store: SubscriptionsStore;
    /** Default tier slug for new users (default: 'free') */
    defaultTierSlug?: string;
    /** Whether to auto-create default subscription for new users */
    autoCreateDefaultSubscription?: boolean;
    /** API configuration */
    api?: SubscriptionsApiConfig;
    /** Enable debug logging */
    debug?: boolean;
}
//# sourceMappingURL=types.d.ts.map