/**
 * Preferences Plugin
 *
 * User preferences management plugin for @qwickapps/server.
 * Provides per-user preference storage with PostgreSQL RLS for data isolation.
 *
 * This plugin depends on the Users Plugin for user identity.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { deepMerge } from './stores/postgres-store.js';
import { MAX_PREFERENCES_SIZE, MAX_NESTING_DEPTH } from './types.js';
/**
 * Check if an object exceeds maximum nesting depth
 */
function exceedsMaxDepth(obj, depth = 0) {
    if (depth > MAX_NESTING_DEPTH)
        return true;
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        return Object.values(obj).some(v => exceedsMaxDepth(v, depth + 1));
    }
    if (Array.isArray(obj)) {
        return obj.some(v => exceedsMaxDepth(v, depth + 1));
    }
    return false;
}
// Store instance for helper access
let currentStore = null;
let pluginDefaults = {};
/**
 * Create the Preferences plugin
 */
export function createPreferencesPlugin(config) {
    const debug = config.debug || false;
    // Routes are mounted under /api by the control panel, so don't include /api in prefix
    const apiPrefix = config.api?.prefix || '/'; // Framework adds /preferences prefix automatically
    const apiEnabled = config.api?.enabled !== false;
    function log(message, data) {
        if (debug) {
            console.log(`[PreferencesPlugin] ${message}`, data || '');
        }
    }
    return {
        id: 'preferences',
        name: 'Preferences',
        version: '1.0.0',
        async onStart(_pluginConfig, registry) {
            log('Starting preferences plugin');
            // Check for users plugin dependency
            if (!registry.hasPlugin('users')) {
                throw new Error('Preferences plugin requires Users plugin to be loaded first');
            }
            // Initialize the store (creates tables and RLS policies if needed)
            await config.store.initialize();
            log('Preferences plugin migrations complete');
            // Store references for helper access
            currentStore = config.store;
            pluginDefaults = config.defaults || {};
            // Register health check
            registry.registerHealthCheck({
                name: 'preferences-store',
                type: 'custom',
                check: async () => {
                    try {
                        // Simple health check - store is accessible
                        // We can't actually query without a user context due to RLS,
                        // but we can verify the store is initialized
                        return { healthy: currentStore !== null };
                    }
                    catch {
                        return { healthy: false };
                    }
                },
            });
            // Add API routes if enabled
            if (apiEnabled) {
                // GET /preferences - Get current user's preferences
                registry.addRoute({
                    method: 'get',
                    path: apiPrefix,
                    pluginId: 'preferences',
                    handler: async (req, res) => {
                        try {
                            const authReq = req;
                            const userId = authReq.auth?.user?.id;
                            if (!userId) {
                                return res.status(401).json({ error: 'Authentication required' });
                            }
                            const stored = await config.store.get(userId);
                            // Merge with defaults (defaults as base, stored values override)
                            const preferences = stored
                                ? deepMerge(pluginDefaults, stored)
                                : { ...pluginDefaults };
                            res.json({
                                user_id: userId,
                                preferences,
                            });
                        }
                        catch (error) {
                            console.error('[PreferencesPlugin] Get preferences error:', error);
                            res.status(500).json({ error: 'Failed to get preferences' });
                        }
                    },
                });
                // PUT /preferences - Update current user's preferences
                registry.addRoute({
                    method: 'put',
                    path: apiPrefix,
                    pluginId: 'preferences',
                    handler: async (req, res) => {
                        try {
                            const authReq = req;
                            const userId = authReq.auth?.user?.id;
                            if (!userId) {
                                return res.status(401).json({ error: 'Authentication required' });
                            }
                            const newPreferences = req.body;
                            if (!newPreferences || typeof newPreferences !== 'object' || Array.isArray(newPreferences)) {
                                return res.status(400).json({ error: 'Request body must be a JSON object' });
                            }
                            // Validate payload size
                            const jsonSize = JSON.stringify(newPreferences).length;
                            if (jsonSize > MAX_PREFERENCES_SIZE) {
                                return res.status(413).json({ error: 'Preferences payload too large (max 100KB)' });
                            }
                            // Validate nesting depth
                            if (exceedsMaxDepth(newPreferences)) {
                                return res.status(400).json({ error: 'Preferences object too deeply nested (max 10 levels)' });
                            }
                            const updated = await config.store.update(userId, newPreferences);
                            // Merge with defaults for response
                            const preferences = deepMerge(pluginDefaults, updated);
                            res.json({
                                user_id: userId,
                                preferences,
                            });
                        }
                        catch (error) {
                            console.error('[PreferencesPlugin] Update preferences error:', error);
                            res.status(500).json({ error: 'Failed to update preferences' });
                        }
                    },
                });
                // DELETE /preferences - Reset preferences to defaults
                registry.addRoute({
                    method: 'delete',
                    path: apiPrefix,
                    pluginId: 'preferences',
                    handler: async (req, res) => {
                        try {
                            const authReq = req;
                            const userId = authReq.auth?.user?.id;
                            if (!userId) {
                                return res.status(401).json({ error: 'Authentication required' });
                            }
                            await config.store.delete(userId);
                            // Return 204 No Content (idempotent - success even if no row existed)
                            res.status(204).send();
                        }
                        catch (error) {
                            console.error('[PreferencesPlugin] Delete preferences error:', error);
                            res.status(500).json({ error: 'Failed to delete preferences' });
                        }
                    },
                });
            }
            // Register preferences page in UI
            registry.addPage({
                pluginId: 'preferences',
                id: 'preferences:page',
                route: '/preferences',
                component: 'PreferencesPage',
            });
            log('Preferences plugin started');
        },
        async onStop() {
            log('Stopping preferences plugin');
            await config.store.shutdown();
            currentStore = null;
            pluginDefaults = {};
            log('Preferences plugin stopped');
        },
    };
}
// ========================================
// Helper Functions
// ========================================
/**
 * Get the current preferences store instance
 */
export function getPreferencesStore() {
    return currentStore;
}
/**
 * Get preferences for a user (merged with defaults)
 */
export async function getPreferences(userId) {
    if (!currentStore) {
        throw new Error('Preferences plugin not initialized');
    }
    const stored = await currentStore.get(userId);
    return stored ? deepMerge(pluginDefaults, stored) : { ...pluginDefaults };
}
/**
 * Update preferences for a user
 * Returns the merged preferences (stored + defaults)
 */
export async function updatePreferences(userId, preferences) {
    if (!currentStore) {
        throw new Error('Preferences plugin not initialized');
    }
    const updated = await currentStore.update(userId, preferences);
    return deepMerge(pluginDefaults, updated);
}
/**
 * Delete preferences for a user (reset to defaults)
 * Returns true if preferences existed and were deleted
 */
export async function deletePreferences(userId) {
    if (!currentStore) {
        throw new Error('Preferences plugin not initialized');
    }
    return currentStore.delete(userId);
}
/**
 * Get the configured default preferences
 */
export function getDefaultPreferences() {
    return { ...pluginDefaults };
}
//# sourceMappingURL=preferences-plugin.js.map