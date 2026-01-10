/**
 * Profiles Plugin
 *
 * Generic multi-profile management plugin for @qwickapps/server.
 * Supports age-based categorization and content filtering.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Store instance for helper access
let currentStore = null;
let currentConfig = null;
/**
 * Calculate age from birth date
 */
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}
/**
 * Check if current time is within allowed hours
 */
function isWithinAllowedHours(start, end) {
    if (!start || !end) {
        return true; // No restriction
    }
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    if (startTime <= endTime) {
        // Normal range (e.g., 08:00 - 20:00)
        return currentTime >= startTime && currentTime <= endTime;
    }
    else {
        // Overnight range (e.g., 20:00 - 08:00)
        return currentTime >= startTime || currentTime <= endTime;
    }
}
/**
 * Create the Profiles plugin
 */
export function createProfilesPlugin(config) {
    const debug = config.debug || false;
    const maxProfilesPerUser = config.maxProfilesPerUser || 10;
    const defaultFilterLevel = config.defaultFilterLevel || 'moderate';
    const apiPrefix = config.api?.prefix || '/'; // Framework adds /profiles prefix automatically
    function log(message, data) {
        if (debug) {
            console.log(`[ProfilesPlugin] ${message}`, data || '');
        }
    }
    return {
        id: 'profiles',
        name: 'Profiles',
        version: '1.0.0',
        async onStart(_pluginConfig, registry) {
            log('Starting profiles plugin');
            // Initialize the store (creates tables if needed)
            await config.store.initialize();
            log('Profiles plugin migrations complete');
            // Store references for helper access
            currentStore = config.store;
            currentConfig = config;
            // Register health check
            registry.registerHealthCheck({
                name: 'profiles-store',
                type: 'custom',
                check: async () => {
                    try {
                        await config.store.search({ limit: 1 });
                        return {
                            healthy: true,
                            details: {
                                maxProfilesPerUser,
                                defaultFilterLevel,
                            },
                        };
                    }
                    catch {
                        return { healthy: false };
                    }
                },
            });
            // Add API routes if enabled
            if (config.api?.crud !== false) {
                // List/Search profiles
                registry.addRoute({
                    method: 'get',
                    path: apiPrefix,
                    pluginId: 'profiles',
                    handler: async (req, res) => {
                        try {
                            const params = {
                                org_id: req.query.org_id,
                                user_id: req.query.user_id,
                                age_group: req.query.age_group,
                                is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
                                query: req.query.q,
                                page: parseInt(req.query.page) || 1,
                                limit: Math.min(parseInt(req.query.limit) || 20, 100),
                                sortBy: req.query.sortBy || 'created_at',
                                sortOrder: req.query.sortOrder || 'desc',
                            };
                            const result = await config.store.search(params);
                            res.json(result);
                        }
                        catch (error) {
                            console.error('[ProfilesPlugin] Search error:', error);
                            res.status(500).json({ error: 'Failed to search profiles' });
                        }
                    },
                });
                // Get profile by ID
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/:id`,
                    pluginId: 'profiles',
                    handler: async (req, res) => {
                        try {
                            const profile = await config.store.getById(req.params.id);
                            if (!profile) {
                                return res.status(404).json({ error: 'Profile not found' });
                            }
                            res.json(profile);
                        }
                        catch (error) {
                            console.error('[ProfilesPlugin] Get profile error:', error);
                            res.status(500).json({ error: 'Failed to get profile' });
                        }
                    },
                });
                // Create profile
                registry.addRoute({
                    method: 'post',
                    path: apiPrefix,
                    pluginId: 'profiles',
                    handler: async (req, res) => {
                        try {
                            const input = {
                                org_id: req.body.org_id,
                                user_id: req.body.user_id,
                                name: req.body.name,
                                avatar: req.body.avatar,
                                birth_date: req.body.birth_date ? new Date(req.body.birth_date) : undefined,
                                age: req.body.age,
                                content_filter_level: req.body.content_filter_level || defaultFilterLevel,
                                daily_time_limit_minutes: req.body.daily_time_limit_minutes,
                                allowed_hours_start: req.body.allowed_hours_start,
                                allowed_hours_end: req.body.allowed_hours_end,
                                is_default: req.body.is_default,
                                metadata: req.body.metadata,
                            };
                            // Validate required fields
                            if (!input.user_id) {
                                return res.status(400).json({ error: 'user_id is required' });
                            }
                            if (!input.name || input.name.trim().length === 0) {
                                return res.status(400).json({ error: 'name is required' });
                            }
                            // Check profile limit
                            const currentCount = await config.store.getProfileCount(input.user_id);
                            if (currentCount >= maxProfilesPerUser) {
                                return res.status(400).json({
                                    error: `Maximum profiles (${maxProfilesPerUser}) reached for this user`,
                                });
                            }
                            const profile = await config.store.create(input);
                            res.status(201).json(profile);
                        }
                        catch (error) {
                            console.error('[ProfilesPlugin] Create profile error:', error);
                            res.status(500).json({ error: 'Failed to create profile' });
                        }
                    },
                });
                // Update profile
                registry.addRoute({
                    method: 'put',
                    path: `${apiPrefix}/:id`,
                    pluginId: 'profiles',
                    handler: async (req, res) => {
                        try {
                            const input = {
                                name: req.body.name,
                                avatar: req.body.avatar,
                                birth_date: req.body.birth_date !== undefined
                                    ? (req.body.birth_date ? new Date(req.body.birth_date) : null)
                                    : undefined,
                                age: req.body.age,
                                content_filter_level: req.body.content_filter_level,
                                daily_time_limit_minutes: req.body.daily_time_limit_minutes,
                                allowed_hours_start: req.body.allowed_hours_start,
                                allowed_hours_end: req.body.allowed_hours_end,
                                is_active: req.body.is_active,
                                is_default: req.body.is_default,
                                metadata: req.body.metadata,
                            };
                            const profile = await config.store.update(req.params.id, input);
                            if (!profile) {
                                return res.status(404).json({ error: 'Profile not found' });
                            }
                            res.json(profile);
                        }
                        catch (error) {
                            console.error('[ProfilesPlugin] Update profile error:', error);
                            res.status(500).json({ error: 'Failed to update profile' });
                        }
                    },
                });
                // Delete profile
                registry.addRoute({
                    method: 'delete',
                    path: `${apiPrefix}/:id`,
                    pluginId: 'profiles',
                    handler: async (req, res) => {
                        try {
                            const deleted = await config.store.delete(req.params.id);
                            if (!deleted) {
                                return res.status(404).json({ error: 'Profile not found' });
                            }
                            res.status(204).send();
                        }
                        catch (error) {
                            console.error('[ProfilesPlugin] Delete profile error:', error);
                            res.status(500).json({ error: 'Failed to delete profile' });
                        }
                    },
                });
                // List profiles for a user
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/user/:userId`,
                    pluginId: 'profiles',
                    handler: async (req, res) => {
                        try {
                            const profiles = await config.store.listByUser(req.params.userId);
                            res.json({ profiles });
                        }
                        catch (error) {
                            console.error('[ProfilesPlugin] List user profiles error:', error);
                            res.status(500).json({ error: 'Failed to list profiles' });
                        }
                    },
                });
                // Get default profile for a user
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/user/:userId/default`,
                    pluginId: 'profiles',
                    handler: async (req, res) => {
                        try {
                            const profile = await config.store.getDefaultProfile(req.params.userId);
                            if (!profile) {
                                return res.status(404).json({ error: 'No default profile found' });
                            }
                            res.json(profile);
                        }
                        catch (error) {
                            console.error('[ProfilesPlugin] Get default profile error:', error);
                            res.status(500).json({ error: 'Failed to get default profile' });
                        }
                    },
                });
                // Set default profile
                registry.addRoute({
                    method: 'post',
                    path: `${apiPrefix}/:id/set-default`,
                    pluginId: 'profiles',
                    handler: async (req, res) => {
                        try {
                            const profile = await config.store.getById(req.params.id);
                            if (!profile) {
                                return res.status(404).json({ error: 'Profile not found' });
                            }
                            const success = await config.store.setDefaultProfile(req.params.id, profile.user_id);
                            if (!success) {
                                return res.status(500).json({ error: 'Failed to set default profile' });
                            }
                            const updated = await config.store.getById(req.params.id);
                            res.json(updated);
                        }
                        catch (error) {
                            console.error('[ProfilesPlugin] Set default profile error:', error);
                            res.status(500).json({ error: 'Failed to set default profile' });
                        }
                    },
                });
                // Check time restrictions
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/:id/time-check`,
                    pluginId: 'profiles',
                    handler: async (req, res) => {
                        try {
                            const profile = await config.store.getById(req.params.id);
                            if (!profile) {
                                return res.status(404).json({ error: 'Profile not found' });
                            }
                            const result = checkTimeRestrictions(profile);
                            res.json(result);
                        }
                        catch (error) {
                            console.error('[ProfilesPlugin] Time check error:', error);
                            res.status(500).json({ error: 'Failed to check time restrictions' });
                        }
                    },
                });
            }
            log('Profiles plugin started');
        },
        async onStop() {
            log('Stopping profiles plugin');
            await config.store.shutdown();
            currentStore = null;
            currentConfig = null;
            log('Profiles plugin stopped');
        },
    };
}
// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Get the current profile store instance
 */
export function getProfileStore() {
    return currentStore;
}
/**
 * Create a new profile
 */
export async function createProfile(input) {
    if (!currentStore || !currentConfig) {
        throw new Error('Profiles plugin not initialized');
    }
    // Check profile limit
    const currentCount = await currentStore.getProfileCount(input.user_id);
    const maxProfiles = currentConfig.maxProfilesPerUser || 10;
    if (currentCount >= maxProfiles) {
        throw new Error(`Maximum profiles (${maxProfiles}) reached for this user`);
    }
    // Apply default filter level
    if (!input.content_filter_level) {
        input.content_filter_level = currentConfig.defaultFilterLevel || 'moderate';
    }
    return currentStore.create(input);
}
/**
 * Get a profile by ID
 */
export async function getProfileById(id) {
    if (!currentStore) {
        throw new Error('Profiles plugin not initialized');
    }
    return currentStore.getById(id);
}
/**
 * Update a profile
 */
export async function updateProfile(id, input) {
    if (!currentStore) {
        throw new Error('Profiles plugin not initialized');
    }
    return currentStore.update(id, input);
}
/**
 * Delete a profile
 */
export async function deleteProfile(id) {
    if (!currentStore) {
        throw new Error('Profiles plugin not initialized');
    }
    return currentStore.delete(id);
}
/**
 * List profiles for a user
 */
export async function listUserProfiles(userId) {
    if (!currentStore) {
        throw new Error('Profiles plugin not initialized');
    }
    return currentStore.listByUser(userId);
}
/**
 * Get the default profile for a user
 */
export async function getDefaultProfile(userId) {
    if (!currentStore) {
        throw new Error('Profiles plugin not initialized');
    }
    return currentStore.getDefaultProfile(userId);
}
/**
 * Set a profile as the default
 */
export async function setDefaultProfile(profileId, userId) {
    if (!currentStore) {
        throw new Error('Profiles plugin not initialized');
    }
    return currentStore.setDefaultProfile(profileId, userId);
}
/**
 * Get profiles by age group
 */
export async function getProfilesByAgeGroup(userId, ageGroup) {
    if (!currentStore) {
        throw new Error('Profiles plugin not initialized');
    }
    return currentStore.getByAgeGroup(userId, ageGroup);
}
/**
 * Get child profiles (age_group = 'child')
 */
export async function getChildProfiles(userId) {
    return getProfilesByAgeGroup(userId, 'child');
}
/**
 * Get the current age for a profile
 */
export function getProfileAge(profile) {
    if (profile.birth_date) {
        return calculateAge(profile.birth_date);
    }
    return profile.age || null;
}
/**
 * Check time restrictions for a profile
 */
export function checkTimeRestrictions(profile) {
    // Check allowed hours
    const withinHours = isWithinAllowedHours(profile.allowed_hours_start, profile.allowed_hours_end);
    if (!withinHours) {
        // Calculate when access will be available
        const now = new Date();
        let availableAt;
        if (profile.allowed_hours_start) {
            const [hour, min] = profile.allowed_hours_start.split(':').map(Number);
            availableAt = new Date(now);
            availableAt.setHours(hour, min, 0, 0);
            if (availableAt <= now) {
                availableAt.setDate(availableAt.getDate() + 1);
            }
        }
        return {
            allowed: false,
            reason: 'Outside allowed hours',
            available_at: availableAt,
        };
    }
    // Note: Daily time limit tracking requires usage plugin integration
    // For now, just return allowed if within hours
    return {
        allowed: true,
        minutes_remaining: profile.daily_time_limit_minutes || undefined,
    };
}
/**
 * Get content filter level for a profile
 */
export function getContentFilterLevel(profile) {
    return profile.content_filter_level;
}
/**
 * Check if profile can access content based on filter level
 */
export function canAccessContent(profile, requiredLevel) {
    const levels = ['strict', 'moderate', 'minimal', 'none'];
    const profileLevelIndex = levels.indexOf(profile.content_filter_level);
    const requiredLevelIndex = levels.indexOf(requiredLevel);
    // Profile level must be >= required level (stricter or equal)
    return profileLevelIndex <= requiredLevelIndex;
}
//# sourceMappingURL=profiles-plugin.js.map