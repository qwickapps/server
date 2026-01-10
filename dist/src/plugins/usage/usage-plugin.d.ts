/**
 * Usage Plugin
 *
 * Usage tracking plugin for @qwickapps/server.
 * Tracks daily/monthly feature usage and enforces limits.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
import type { UsagePluginConfig, UsageStore, UsageIncrementResult, UsageStatus, UsageSummary } from './types.js';
/**
 * Create the Usage plugin
 */
export declare function createUsagePlugin(config: UsagePluginConfig): Plugin;
/**
 * Get the current usage store instance
 */
export declare function getUsageStore(): UsageStore | null;
/**
 * Get current daily usage for a feature
 */
export declare function getDailyUsage(userId: string, featureCode: string): Promise<number>;
/**
 * Increment usage and check limit
 */
export declare function incrementUsage(userId: string, featureCode: string, amount?: number): Promise<UsageIncrementResult>;
/**
 * Check if usage is within limit (without incrementing)
 */
export declare function checkUsageLimit(userId: string, featureCode: string, amount?: number): Promise<UsageIncrementResult>;
/**
 * Get usage status for a specific feature
 */
export declare function getFeatureUsageStatus(userId: string, featureCode: string): Promise<UsageStatus>;
/**
 * Get daily usage summary for all features
 */
export declare function getDailyUsageSummary(userId: string, date?: string): Promise<UsageSummary>;
/**
 * Reset usage for a feature (admin function)
 */
export declare function resetUsage(userId: string, featureCode: string): Promise<void>;
/**
 * Get remaining quota for a feature
 */
export declare function getRemainingQuota(userId: string, featureCode: string): Promise<number | null>;
/**
 * Check if user can use a feature (has remaining quota)
 */
export declare function canUseFeature(userId: string, featureCode: string, amount?: number): Promise<boolean>;
//# sourceMappingURL=usage-plugin.d.ts.map