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
// UI Components are exported from main package index (@qwickapps/server)
// Do NOT export here to avoid loading UI dependencies when importing plugins
//# sourceMappingURL=index.js.map