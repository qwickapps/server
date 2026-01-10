/**
 * Parental Plugin
 *
 * Generic parental/guardian controls for @qwickapps/server.
 * Supports PIN protection, profile restrictions, schedules, and activity logging.
 * Uses adapters for domain-specific behavior (kids, gaming, education).
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { createHash } from 'crypto';
// Store instances for helper access
let currentStore = null;
let currentAdapter = null;
let currentConfig = null;
/**
 * Hash a PIN using SHA-256
 */
function hashPin(pin) {
    return createHash('sha256').update(pin).digest('hex');
}
/**
 * Check if current time is within allowed schedule
 */
function isWithinSchedule(schedule) {
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = dayNames[now.getDay()];
    const todaySchedule = schedule[today];
    if (!todaySchedule)
        return true; // No schedule for today = allowed
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= todaySchedule.start && currentTime <= todaySchedule.end;
}
/**
 * Create the Parental plugin
 */
export function createParentalPlugin(config) {
    const debug = config.debug || false;
    const apiPrefix = config.api?.prefix || '/'; // Framework adds /parental prefix automatically
    const maxPinAttempts = config.maxPinAttempts || 5;
    const pinLockoutMinutes = config.pinLockoutMinutes || 30;
    function log(message, data) {
        if (debug) {
            console.log(`[ParentalPlugin] ${message}`, data || '');
        }
    }
    return {
        id: 'parental',
        name: 'Parental',
        version: '1.0.0',
        async onStart(_pluginConfig, registry) {
            log('Starting parental plugin');
            // Initialize the store (creates tables if needed)
            await config.store.initialize();
            log('Parental store initialized');
            // Store references for helper access
            currentStore = config.store;
            currentAdapter = config.adapter;
            currentConfig = config;
            // Register health check
            registry.registerHealthCheck({
                name: 'parental-store',
                type: 'custom',
                check: async () => {
                    try {
                        return { healthy: true };
                    }
                    catch {
                        return { healthy: false };
                    }
                },
            });
            // Add API routes if enabled
            if (config.api?.enabled !== false) {
                // ═══════════════════════════════════════════════════════════════════════
                // Guardian Settings Routes
                // ═══════════════════════════════════════════════════════════════════════
                // Get guardian settings
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/settings/:userId`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const { userId } = req.params;
                            const settings = await getGuardianSettings(userId);
                            if (!settings) {
                                return res.status(404).json({ error: 'Settings not found' });
                            }
                            // Don't expose PIN hash
                            const { pin_hash: _pin, ...safeSettings } = settings;
                            res.json({ ...safeSettings, has_pin: !!_pin });
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Get settings error:', error);
                            res.status(500).json({ error: 'Failed to get settings' });
                        }
                    },
                });
                // Create guardian settings
                registry.addRoute({
                    method: 'post',
                    path: `${apiPrefix}/settings`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const input = req.body;
                            // Hash PIN if provided
                            const processedInput = {
                                ...input,
                                adapter_type: config.adapter.name,
                                pin: input.pin ? hashPin(input.pin) : undefined,
                            };
                            const settings = await createGuardianSettings(processedInput);
                            const { pin_hash: _pin, ...safeSettings } = settings;
                            res.status(201).json({ ...safeSettings, has_pin: !!_pin });
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Create settings error:', error);
                            res.status(500).json({ error: 'Failed to create settings' });
                        }
                    },
                });
                // Update guardian settings
                registry.addRoute({
                    method: 'patch',
                    path: `${apiPrefix}/settings/:userId`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const { userId } = req.params;
                            const input = req.body;
                            const settings = await updateGuardianSettings(userId, input);
                            if (!settings) {
                                return res.status(404).json({ error: 'Settings not found' });
                            }
                            const { pin_hash: _pin, ...safeSettings } = settings;
                            res.json({ ...safeSettings, has_pin: !!_pin });
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Update settings error:', error);
                            res.status(500).json({ error: 'Failed to update settings' });
                        }
                    },
                });
                // Set PIN
                registry.addRoute({
                    method: 'post',
                    path: `${apiPrefix}/settings/:userId/pin`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const { userId } = req.params;
                            const { pin, current_pin } = req.body;
                            if (!pin || pin.length < 4) {
                                return res.status(400).json({ error: 'PIN must be at least 4 characters' });
                            }
                            // If user already has PIN, verify current PIN
                            const settings = await getGuardianSettings(userId);
                            if (settings?.pin_hash) {
                                if (!current_pin) {
                                    return res.status(400).json({ error: 'Current PIN required to change PIN' });
                                }
                                const isValid = await verifyPin(userId, current_pin);
                                if (!isValid) {
                                    return res.status(401).json({ error: 'Invalid current PIN' });
                                }
                            }
                            await setPin(userId, pin);
                            res.json({ success: true });
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Set PIN error:', error);
                            res.status(500).json({ error: 'Failed to set PIN' });
                        }
                    },
                });
                // Verify PIN
                registry.addRoute({
                    method: 'post',
                    path: `${apiPrefix}/settings/:userId/verify-pin`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const { userId } = req.params;
                            const { pin } = req.body;
                            if (!pin) {
                                return res.status(400).json({ error: 'PIN required' });
                            }
                            const isValid = await verifyPin(userId, pin);
                            if (!isValid) {
                                // Increment failed attempts
                                const attempts = await incrementFailedPinAttempts(userId);
                                if (attempts >= maxPinAttempts) {
                                    // Lock the account
                                    const lockUntil = new Date(Date.now() + pinLockoutMinutes * 60 * 1000);
                                    return res.status(423).json({
                                        error: 'Account locked due to too many failed attempts',
                                        locked_until: lockUntil,
                                        attempts,
                                    });
                                }
                                return res.status(401).json({
                                    error: 'Invalid PIN',
                                    attempts_remaining: maxPinAttempts - attempts,
                                });
                            }
                            // Reset failed attempts on success
                            await resetFailedPinAttempts(userId);
                            res.json({ success: true });
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Verify PIN error:', error);
                            res.status(500).json({ error: 'Failed to verify PIN' });
                        }
                    },
                });
                // ═══════════════════════════════════════════════════════════════════════
                // Profile Restrictions Routes
                // ═══════════════════════════════════════════════════════════════════════
                // Get restrictions for a profile
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/restrictions/:profileId`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const { profileId } = req.params;
                            const restrictions = await getRestrictions(profileId);
                            res.json(restrictions);
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Get restrictions error:', error);
                            res.status(500).json({ error: 'Failed to get restrictions' });
                        }
                    },
                });
                // Create restriction
                registry.addRoute({
                    method: 'post',
                    path: `${apiPrefix}/restrictions`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const input = req.body;
                            // Validate with adapter
                            if (config.adapter.validateRestriction) {
                                const validation = config.adapter.validateRestriction(input);
                                if (!validation.valid) {
                                    return res.status(400).json({ error: 'Invalid restriction', errors: validation.errors });
                                }
                            }
                            const restriction = await createRestriction(input);
                            res.status(201).json(restriction);
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Create restriction error:', error);
                            res.status(500).json({ error: 'Failed to create restriction' });
                        }
                    },
                });
                // Update restriction
                registry.addRoute({
                    method: 'patch',
                    path: `${apiPrefix}/restrictions/:id`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const { id } = req.params;
                            const updates = req.body;
                            const restriction = await updateRestriction(id, updates);
                            if (!restriction) {
                                return res.status(404).json({ error: 'Restriction not found' });
                            }
                            res.json(restriction);
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Update restriction error:', error);
                            res.status(500).json({ error: 'Failed to update restriction' });
                        }
                    },
                });
                // Delete restriction
                registry.addRoute({
                    method: 'delete',
                    path: `${apiPrefix}/restrictions/:id`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const { id } = req.params;
                            const deleted = await deleteRestriction(id);
                            if (!deleted) {
                                return res.status(404).json({ error: 'Restriction not found' });
                            }
                            res.status(204).send();
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Delete restriction error:', error);
                            res.status(500).json({ error: 'Failed to delete restriction' });
                        }
                    },
                });
                // Pause profile
                registry.addRoute({
                    method: 'post',
                    path: `${apiPrefix}/restrictions/:profileId/pause`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const { profileId } = req.params;
                            const { until, reason } = req.body;
                            await pauseProfile(profileId, until ? new Date(until) : undefined, reason);
                            res.json({ success: true, paused: true });
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Pause profile error:', error);
                            res.status(500).json({ error: 'Failed to pause profile' });
                        }
                    },
                });
                // Resume profile
                registry.addRoute({
                    method: 'post',
                    path: `${apiPrefix}/restrictions/:profileId/resume`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const { profileId } = req.params;
                            await resumeProfile(profileId);
                            res.json({ success: true, paused: false });
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Resume profile error:', error);
                            res.status(500).json({ error: 'Failed to resume profile' });
                        }
                    },
                });
                // Check profile access
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/restrictions/:profileId/check`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const { profileId } = req.params;
                            const result = await checkProfileAccess(profileId);
                            res.json(result);
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Check access error:', error);
                            res.status(500).json({ error: 'Failed to check access' });
                        }
                    },
                });
                // ═══════════════════════════════════════════════════════════════════════
                // Activity Log Routes
                // ═══════════════════════════════════════════════════════════════════════
                // Log activity
                registry.addRoute({
                    method: 'post',
                    path: `${apiPrefix}/activity`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const input = req.body;
                            const activity = await logActivity({
                                ...input,
                                adapter_type: config.adapter.name,
                            });
                            res.status(201).json(activity);
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Log activity error:', error);
                            res.status(500).json({ error: 'Failed to log activity' });
                        }
                    },
                });
                // Get activity log
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/activity/:userId`,
                    pluginId: 'parental',
                    handler: async (req, res) => {
                        try {
                            const { userId } = req.params;
                            const limit = parseInt(req.query.limit) || 100;
                            const profileId = req.query.profileId;
                            const activities = await getActivityLog(userId, limit, profileId);
                            // Format details with adapter if available
                            const formattedActivities = activities.map((activity) => {
                                if (config.adapter.formatActivityDetails) {
                                    return {
                                        ...activity,
                                        formatted_details: config.adapter.formatActivityDetails(activity),
                                    };
                                }
                                return activity;
                            });
                            res.json(formattedActivities);
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Get activity error:', error);
                            res.status(500).json({ error: 'Failed to get activity log' });
                        }
                    },
                });
                // Get adapter info (activity types, defaults)
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/adapter-info`,
                    pluginId: 'parental',
                    handler: async (_req, res) => {
                        try {
                            res.json({
                                name: config.adapter.name,
                                activity_types: config.adapter.getActivityTypes(),
                                default_daily_limit: config.adapter.getDefaultDailyLimit(),
                            });
                        }
                        catch (error) {
                            console.error('[ParentalPlugin] Get adapter info error:', error);
                            res.status(500).json({ error: 'Failed to get adapter info' });
                        }
                    },
                });
            }
            log('Parental plugin started');
        },
        async onStop() {
            log('Stopping parental plugin');
            await config.store.shutdown();
            currentStore = null;
            currentAdapter = null;
            currentConfig = null;
            log('Parental plugin stopped');
        },
    };
}
// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Get the current parental store instance
 */
export function getParentalStore() {
    return currentStore;
}
/**
 * Get the current parental adapter instance
 */
export function getParentalAdapter() {
    return currentAdapter;
}
// ─────────────────────────────────────────────────────────────────────────────
// Guardian Settings Helpers
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get guardian settings for a user
 */
export async function getGuardianSettings(userId) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    return currentStore.getSettings(userId);
}
/**
 * Create guardian settings
 */
export async function createGuardianSettings(input) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    return currentStore.createSettings(input);
}
/**
 * Update guardian settings
 */
export async function updateGuardianSettings(userId, input) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    return currentStore.updateSettings(userId, input);
}
/**
 * Set PIN for guardian
 */
export async function setPin(userId, pin) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    const pinHash = hashPin(pin);
    return currentStore.setPin(userId, pinHash);
}
/**
 * Verify PIN
 */
export async function verifyPin(userId, pin) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    const pinHash = hashPin(pin);
    return currentStore.verifyPin(userId, pinHash);
}
/**
 * Increment failed PIN attempts
 */
export async function incrementFailedPinAttempts(userId) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    return currentStore.incrementFailedPinAttempts(userId);
}
/**
 * Reset failed PIN attempts
 */
export async function resetFailedPinAttempts(userId) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    return currentStore.resetFailedPinAttempts(userId);
}
// ─────────────────────────────────────────────────────────────────────────────
// Profile Restrictions Helpers
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get restrictions for a profile
 */
export async function getRestrictions(profileId) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    return currentStore.getRestrictions(profileId);
}
/**
 * Create a restriction
 */
export async function createRestriction(input) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    return currentStore.createRestriction(input);
}
/**
 * Update a restriction
 */
export async function updateRestriction(id, updates) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    return currentStore.updateRestriction(id, updates);
}
/**
 * Delete a restriction (soft delete)
 */
export async function deleteRestriction(id) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    return currentStore.deleteRestriction(id);
}
/**
 * Pause a profile's access
 */
export async function pauseProfile(profileId, until, reason) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    return currentStore.pauseProfile(profileId, until, reason);
}
/**
 * Resume a profile's access
 */
export async function resumeProfile(profileId) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    return currentStore.resumeProfile(profileId);
}
/**
 * Check if a profile has access based on restrictions
 */
export async function checkProfileAccess(profileId) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    const restrictions = await currentStore.getRestrictions(profileId);
    // Check if any restrictions are paused
    for (const restriction of restrictions) {
        if (restriction.is_paused) {
            // Check if pause has expired
            if (restriction.pause_until && new Date() > restriction.pause_until) {
                // Auto-resume (should be handled by cron, but check here too)
                continue;
            }
            return {
                allowed: false,
                reason: restriction.pause_reason || 'Profile is paused',
            };
        }
        // Check schedule restrictions
        if (restriction.schedule) {
            if (!isWithinSchedule(restriction.schedule)) {
                // Find when access becomes available
                const now = new Date();
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const today = dayNames[now.getDay()];
                const todaySchedule = restriction.schedule[today];
                let availableAt;
                if (todaySchedule) {
                    const [hours, minutes] = todaySchedule.start.split(':').map(Number);
                    availableAt = new Date(now);
                    availableAt.setHours(hours, minutes, 0, 0);
                    // If we're past today's start, set to tomorrow
                    if (now > availableAt) {
                        availableAt.setDate(availableAt.getDate() + 1);
                    }
                }
                return {
                    allowed: false,
                    reason: 'Outside allowed hours',
                    available_at: availableAt,
                };
            }
        }
    }
    // Get time limit restriction and check remaining time
    const timeLimitRestriction = restrictions.find((r) => r.restriction_type === 'time_limit');
    if (timeLimitRestriction?.daily_limit_minutes) {
        // Note: Actual time tracking would be done via usage-plugin
        // This is a placeholder for the check result
        return {
            allowed: true,
            minutes_remaining: timeLimitRestriction.daily_limit_minutes,
        };
    }
    return { allowed: true };
}
// ─────────────────────────────────────────────────────────────────────────────
// Activity Log Helpers
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Log an activity
 */
export async function logActivity(input) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    // Call adapter hook if available
    if (currentAdapter?.onRestrictionViolation && input.activity_type === 'restriction_violation') {
        await currentAdapter.onRestrictionViolation(input.profile_id || '', input.details?.reason || 'Unknown');
    }
    if (currentAdapter?.onDailyLimitReached && input.activity_type === 'time_limit_reached') {
        await currentAdapter.onDailyLimitReached(input.profile_id || '');
    }
    return currentStore.logActivity(input);
}
/**
 * Get activity log
 */
export async function getActivityLog(userId, limit = 100, profileId) {
    if (!currentStore) {
        throw new Error('Parental plugin not initialized');
    }
    return currentStore.getActivityLog(userId, limit, profileId);
}
//# sourceMappingURL=parental-plugin.js.map