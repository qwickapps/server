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
import { deepMerge, postgresPreferencesStore } from './stores/postgres-store.js';
import { MAX_PREFERENCES_SIZE, MAX_NESTING_DEPTH } from './types.js';
import { hasPostgres, getPostgres } from '../postgres-plugin.js';
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
 * Create the Preferences plugin with smart defaults
 *
 * Config is optional - plugin will use defaults and get dependencies from registry.
 * Gracefully handles missing dependencies with clear log messages.
 */
export function createPreferencesPlugin(config = {}) {
    function log(message, data, isError = false) {
        const prefix = '[PreferencesPlugin]';
        if (isError) {
            console.error(`${prefix} ${message}`, data || '');
        }
        else if (config.debug) {
            console.log(`${prefix} ${message}`, data || '');
        }
    }
    return {
        id: 'preferences',
        name: 'Preferences',
        version: '1.0.0',
        async onStart(_pluginConfig, registry) {
            const logger = registry.getLogger('preferences');
            // Check for users plugin dependency
            if (!registry.hasPlugin('users')) {
                logger.warn('Users plugin not loaded! Preferences plugin disabled.');
                registry.registerHealthCheck({
                    name: 'preferences-store',
                    type: 'custom',
                    check: async () => ({
                        healthy: false,
                        details: {
                            error: 'Users plugin not available',
                            state: 'disabled',
                        },
                    }),
                });
                return;
            }
            // Check for postgres in registry
            if (!hasPostgres()) {
                logger.warn('No Database! Preferences plugin disabled.');
                registry.registerHealthCheck({
                    name: 'preferences-store',
                    type: 'custom',
                    check: async () => ({
                        healthy: false,
                        details: {
                            error: 'PostgreSQL not available',
                            state: 'disabled',
                        },
                    }),
                });
                return;
            }
            // Smart defaults - get dependencies from registry
            const store = config.store ?? postgresPreferencesStore({
                pool: () => getPostgres().getPool(),
                autoCreateTables: true,
            });
            const debug = config.debug ?? false;
            const apiPrefix = config.api?.prefix ?? '/'; // Framework adds /preferences prefix automatically
            const apiEnabled = config.api?.enabled ?? true;
            const defaults = config.defaults ?? {};
            log('Starting preferences plugin');
            // Initialize the store (creates tables and RLS policies if needed)
            await store.initialize();
            log('Preferences plugin migrations complete');
            // Store references for helper access
            currentStore = store;
            pluginDefaults = defaults;
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
                            const stored = await store.get(userId);
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
                            const updated = await store.update(userId, newPreferences);
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
                            await store.delete(userId);
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
            if (currentStore) {
                await currentStore.shutdown();
            }
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