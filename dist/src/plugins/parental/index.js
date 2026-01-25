/**
 * Parental Plugin
 *
 * Generic parental/guardian controls with adapter support.
 * Exports all parental-related functionality.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Main plugin
export { createParentalPlugin, getParentalStore, getParentalAdapter, getGuardianSettings, createGuardianSettings, updateGuardianSettings, setPin, verifyPin, incrementFailedPinAttempts, resetFailedPinAttempts, getRestrictions, createRestriction, updateRestriction, deleteRestriction, pauseProfile, resumeProfile, checkProfileAccess, logActivity, getActivityLog, } from './parental-plugin.js';
// Stores
export { postgresParentalStore } from './stores/index.js';
// Adapters
export { kidsAdapter } from './adapters/index.js';
// UI Components are exported from main package index (@qwickapps/server)
// Do NOT export here to avoid loading UI dependencies when importing plugins
//# sourceMappingURL=index.js.map