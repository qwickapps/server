/**
 * Preferences Plugin Index
 *
 * User preferences management plugin with PostgreSQL RLS.
 * Depends on the Users Plugin for user identity.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export { createPreferencesPlugin, getPreferencesStore, getPreferences, updatePreferences, deletePreferences, getDefaultPreferences, } from './preferences-plugin.js';
export type { PreferencesPluginConfig, PreferencesStore, UserPreferences, PostgresPreferencesStoreConfig, PreferencesApiConfig, } from './types.js';
export { postgresPreferencesStore, deepMerge } from './stores/index.js';
export { PreferencesStatusWidget } from './PreferencesStatusWidget.js';
export type { PreferencesStatusWidgetProps } from './PreferencesStatusWidget.js';
export { PreferencesManagementPage } from './PreferencesManagementPage.js';
export type { PreferencesManagementPageProps } from './PreferencesManagementPage.js';
//# sourceMappingURL=index.d.ts.map