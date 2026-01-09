/**
 * Profiles Plugin
 *
 * Generic multi-profile management with age support.
 * Exports all profile-related functionality.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Main plugin
export { createProfilesPlugin, getProfileStore, createProfile, getProfileById, updateProfile, deleteProfile, listUserProfiles, getDefaultProfile, setDefaultProfile, getProfilesByAgeGroup, getChildProfiles, getProfileAge, checkTimeRestrictions, getContentFilterLevel, canAccessContent, } from './profiles-plugin.js';
// Stores
export { postgresProfileStore } from './stores/index.js';
// UI Components
export { ProfilesStatusWidget } from './ProfilesStatusWidget.js';
export { ProfilesManagementPage } from './ProfilesManagementPage.js';
//# sourceMappingURL=index.js.map