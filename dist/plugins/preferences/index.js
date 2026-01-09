/**
 * Preferences Plugin Index
 *
 * User preferences management plugin with PostgreSQL RLS.
 * Depends on the Users Plugin for user identity.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Main plugin
export { createPreferencesPlugin, getPreferencesStore, getPreferences, updatePreferences, deletePreferences, getDefaultPreferences, } from './preferences-plugin.js';
// Stores
export { postgresPreferencesStore, deepMerge } from './stores/index.js';
// UI Components
export { PreferencesStatusWidget } from './PreferencesStatusWidget.js';
export { PreferencesManagementPage } from './PreferencesManagementPage.js';
//# sourceMappingURL=index.js.map