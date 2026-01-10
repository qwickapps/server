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
import type { Plugin } from '../../core/plugin-registry.js';
import type { PreferencesPluginConfig, PreferencesStore } from './types.js';
/**
 * Create the Preferences plugin
 */
export declare function createPreferencesPlugin(config: PreferencesPluginConfig): Plugin;
/**
 * Get the current preferences store instance
 */
export declare function getPreferencesStore(): PreferencesStore | null;
/**
 * Get preferences for a user (merged with defaults)
 */
export declare function getPreferences(userId: string): Promise<Record<string, unknown>>;
/**
 * Update preferences for a user
 * Returns the merged preferences (stored + defaults)
 */
export declare function updatePreferences(userId: string, preferences: Record<string, unknown>): Promise<Record<string, unknown>>;
/**
 * Delete preferences for a user (reset to defaults)
 * Returns true if preferences existed and were deleted
 */
export declare function deletePreferences(userId: string): Promise<boolean>;
/**
 * Get the configured default preferences
 */
export declare function getDefaultPreferences(): Record<string, unknown>;
//# sourceMappingURL=preferences-plugin.d.ts.map