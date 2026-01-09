/**
 * Usage Plugin
 *
 * Usage tracking plugin for @qwickapps/server.
 * Tracks daily/monthly feature usage and enforces limits.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Import subscription helpers if available
let getFeatureLimitFn = null;
// Store instance for helper access
let currentStore = null;
let currentConfig = null;
let cleanupIntervalId = null;
/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}
/**
 * Get tomorrow's date at midnight (for reset time)
 */
function getTomorrowMidnight() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
}
/**
 * Create the Usage plugin
 */
export function createUsagePlugin(config) {
    const debug = config.debug || false;
    const apiPrefix = config.api?.prefix || '/'; // Framework adds /usage prefix automatically
    function log(message, data) {
        if (debug) {
            console.log(`[UsagePlugin] ${message}`, data || '');
        }
    }
    return {
        id: 'usage',
        name: 'Usage',
        version: '1.0.0',
        async onStart(_pluginConfig, registry) {
            log('Starting usage plugin');
            // Initialize the store (creates tables if needed)
            await config.store.initialize();
            log('Usage plugin migrations complete');
            // Store references for helper access
            currentStore = config.store;
            currentConfig = config;
            // Try to get the feature limit function from subscriptions plugin
            try {
                const subscriptions = await import('../subscriptions/index.js');
                getFeatureLimitFn = subscriptions.getFeatureLimit;
                log('Subscriptions plugin integration enabled');
            }
            catch {
                log('Subscriptions plugin not available, limits will not be enforced');
            }
            // Register health check
            registry.registerHealthCheck({
                name: 'usage-store',
                type: 'custom',
                check: async () => {
                    try {
                        // Simple health check
                        return { healthy: true };
                    }
                    catch {
                        return { healthy: false };
                    }
                },
            });
            // Run cleanup on startup if configured
            if (config.cleanup?.runOnStartup) {
                const dailyDays = config.cleanup.dailyRetentionDays || 90;
                const monthlyMonths = config.cleanup.monthlyRetentionMonths || 24;
                const dailyDeleted = await config.store.cleanupOldDaily(dailyDays);
                const monthlyDeleted = await config.store.cleanupOldMonthly(monthlyMonths);
                log('Startup cleanup complete', { dailyDeleted, monthlyDeleted });
            }
            // Set up periodic cleanup if configured
            if (config.cleanup?.cleanupIntervalHours && config.cleanup.cleanupIntervalHours > 0) {
                const intervalMs = config.cleanup.cleanupIntervalHours * 60 * 60 * 1000;
                cleanupIntervalId = setInterval(async () => {
                    try {
                        const dailyDays = config.cleanup?.dailyRetentionDays || 90;
                        const monthlyMonths = config.cleanup?.monthlyRetentionMonths || 24;
                        const dailyDeleted = await config.store.cleanupOldDaily(dailyDays);
                        const monthlyDeleted = await config.store.cleanupOldMonthly(monthlyMonths);
                        log('Periodic cleanup complete', { dailyDeleted, monthlyDeleted });
                    }
                    catch (error) {
                        console.error('[UsagePlugin] Cleanup error:', error);
                    }
                }, intervalMs);
            }
            // Add API routes if enabled
            if (config.api?.enabled !== false) {
                // Get daily usage summary
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/user/:userId/daily`,
                    pluginId: 'usage',
                    handler: async (req, res) => {
                        try {
                            const { userId } = req.params;
                            const date = req.query.date || getCurrentDate();
                            const summary = await getDailyUsageSummary(userId, date);
                            res.json(summary);
                        }
                        catch (error) {
                            console.error('[UsagePlugin] Get daily usage error:', error);
                            res.status(500).json({ error: 'Failed to get daily usage' });
                        }
                    },
                });
                // Get usage for a specific feature
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/user/:userId/feature/:featureCode`,
                    pluginId: 'usage',
                    handler: async (req, res) => {
                        try {
                            const { userId, featureCode } = req.params;
                            const status = await getFeatureUsageStatus(userId, featureCode);
                            res.json(status);
                        }
                        catch (error) {
                            console.error('[UsagePlugin] Get feature usage error:', error);
                            res.status(500).json({ error: 'Failed to get feature usage' });
                        }
                    },
                });
                // Increment usage (with limit check)
                registry.addRoute({
                    method: 'post',
                    path: `${apiPrefix}/user/:userId/feature/:featureCode/increment`,
                    pluginId: 'usage',
                    handler: async (req, res) => {
                        try {
                            const { userId, featureCode } = req.params;
                            const amount = parseInt(req.body.amount) || 1;
                            const result = await incrementUsage(userId, featureCode, amount);
                            res.json(result);
                        }
                        catch (error) {
                            console.error('[UsagePlugin] Increment usage error:', error);
                            res.status(500).json({ error: 'Failed to increment usage' });
                        }
                    },
                });
                // Check if usage is within limit (without incrementing)
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/user/:userId/feature/:featureCode/check`,
                    pluginId: 'usage',
                    handler: async (req, res) => {
                        try {
                            const { userId, featureCode } = req.params;
                            const amount = parseInt(req.query.amount) || 1;
                            const result = await checkUsageLimit(userId, featureCode, amount);
                            res.json(result);
                        }
                        catch (error) {
                            console.error('[UsagePlugin] Check usage error:', error);
                            res.status(500).json({ error: 'Failed to check usage' });
                        }
                    },
                });
            }
            log('Usage plugin started');
        },
        async onStop() {
            log('Stopping usage plugin');
            // Clear cleanup interval
            if (cleanupIntervalId) {
                clearInterval(cleanupIntervalId);
                cleanupIntervalId = null;
            }
            await config.store.shutdown();
            currentStore = null;
            currentConfig = null;
            log('Usage plugin stopped');
        },
    };
}
// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Get the current usage store instance
 */
export function getUsageStore() {
    return currentStore;
}
/**
 * Get current daily usage for a feature
 */
export async function getDailyUsage(userId, featureCode) {
    if (!currentStore) {
        throw new Error('Usage plugin not initialized');
    }
    const usage = await currentStore.getDailyUsage(userId, featureCode);
    return usage?.count || 0;
}
/**
 * Increment usage and check limit
 */
export async function incrementUsage(userId, featureCode, amount = 1) {
    if (!currentStore) {
        throw new Error('Usage plugin not initialized');
    }
    // Get current usage
    const currentUsage = await getDailyUsage(userId, featureCode);
    // Get limit from subscriptions plugin
    let limit = null;
    if (getFeatureLimitFn) {
        limit = await getFeatureLimitFn(userId, featureCode);
    }
    // Check if increment is allowed
    // limit = -1 means unlimited, null means no subscription/feature disabled
    if (limit === null) {
        return {
            allowed: false,
            current_count: currentUsage,
            limit: null,
            remaining: null,
            reason: 'Feature not available in your subscription',
        };
    }
    if (limit === 0) {
        return {
            allowed: false,
            current_count: currentUsage,
            limit: 0,
            remaining: 0,
            reason: 'Feature is disabled',
        };
    }
    // Check if within limit (-1 = unlimited)
    if (limit !== -1 && currentUsage + amount > limit) {
        return {
            allowed: false,
            current_count: currentUsage,
            limit,
            remaining: Math.max(0, limit - currentUsage),
            resets_at: getTomorrowMidnight(),
            reason: 'Daily limit reached',
        };
    }
    // Increment usage
    const newCount = await currentStore.incrementDaily(userId, featureCode, amount);
    return {
        allowed: true,
        current_count: newCount,
        limit,
        remaining: limit === -1 ? -1 : Math.max(0, limit - newCount),
        resets_at: getTomorrowMidnight(),
    };
}
/**
 * Check if usage is within limit (without incrementing)
 */
export async function checkUsageLimit(userId, featureCode, amount = 1) {
    if (!currentStore) {
        throw new Error('Usage plugin not initialized');
    }
    const currentUsage = await getDailyUsage(userId, featureCode);
    // Get limit from subscriptions plugin
    let limit = null;
    if (getFeatureLimitFn) {
        limit = await getFeatureLimitFn(userId, featureCode);
    }
    if (limit === null) {
        return {
            allowed: false,
            current_count: currentUsage,
            limit: null,
            remaining: null,
            reason: 'Feature not available in your subscription',
        };
    }
    if (limit === 0) {
        return {
            allowed: false,
            current_count: currentUsage,
            limit: 0,
            remaining: 0,
            reason: 'Feature is disabled',
        };
    }
    // Check if within limit
    const wouldExceed = limit !== -1 && currentUsage + amount > limit;
    return {
        allowed: !wouldExceed,
        current_count: currentUsage,
        limit,
        remaining: limit === -1 ? -1 : Math.max(0, limit - currentUsage),
        resets_at: getTomorrowMidnight(),
        reason: wouldExceed ? 'Would exceed daily limit' : undefined,
    };
}
/**
 * Get usage status for a specific feature
 */
export async function getFeatureUsageStatus(userId, featureCode) {
    if (!currentStore) {
        throw new Error('Usage plugin not initialized');
    }
    const currentUsage = await getDailyUsage(userId, featureCode);
    // Get limit from subscriptions plugin
    let limit = null;
    if (getFeatureLimitFn) {
        limit = await getFeatureLimitFn(userId, featureCode);
    }
    let remaining = null;
    let percentageUsed = null;
    if (limit !== null) {
        if (limit === -1) {
            remaining = -1; // Unlimited
        }
        else if (limit > 0) {
            remaining = Math.max(0, limit - currentUsage);
            percentageUsed = Math.min(100, Math.round((currentUsage / limit) * 100));
        }
        else {
            remaining = 0;
            percentageUsed = 100;
        }
    }
    return {
        feature_code: featureCode,
        current: currentUsage,
        limit,
        remaining,
        resets_at: getTomorrowMidnight(),
        percentage_used: percentageUsed,
    };
}
/**
 * Get daily usage summary for all features
 */
export async function getDailyUsageSummary(userId, date) {
    if (!currentStore) {
        throw new Error('Usage plugin not initialized');
    }
    const targetDate = date || getCurrentDate();
    const dailyUsages = await currentStore.getAllDailyUsage(userId, targetDate);
    // Get status for each feature
    const features = await Promise.all(dailyUsages.map(async (usage) => {
        let limit = null;
        if (getFeatureLimitFn) {
            limit = await getFeatureLimitFn(userId, usage.feature_code);
        }
        let remaining = null;
        let percentageUsed = null;
        if (limit !== null) {
            if (limit === -1) {
                remaining = -1;
            }
            else if (limit > 0) {
                remaining = Math.max(0, limit - usage.count);
                percentageUsed = Math.min(100, Math.round((usage.count / limit) * 100));
            }
            else {
                remaining = 0;
                percentageUsed = 100;
            }
        }
        return {
            feature_code: usage.feature_code,
            current: usage.count,
            limit,
            remaining,
            resets_at: getTomorrowMidnight(),
            percentage_used: percentageUsed,
        };
    }));
    return {
        user_id: userId,
        period: 'daily',
        period_value: targetDate,
        features,
    };
}
/**
 * Reset usage for a feature (admin function)
 */
export async function resetUsage(userId, featureCode) {
    if (!currentStore) {
        throw new Error('Usage plugin not initialized');
    }
    await currentStore.resetDailyUsage(userId, featureCode);
}
/**
 * Get remaining quota for a feature
 */
export async function getRemainingQuota(userId, featureCode) {
    const status = await getFeatureUsageStatus(userId, featureCode);
    return status.remaining;
}
/**
 * Check if user can use a feature (has remaining quota)
 */
export async function canUseFeature(userId, featureCode, amount = 1) {
    const result = await checkUsageLimit(userId, featureCode, amount);
    return result.allowed;
}
//# sourceMappingURL=usage-plugin.js.map