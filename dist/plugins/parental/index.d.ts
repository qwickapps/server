/**
 * Parental Plugin
 *
 * Generic parental/guardian controls with adapter support.
 * Exports all parental-related functionality.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export { createParentalPlugin, getParentalStore, getParentalAdapter, getGuardianSettings, createGuardianSettings, updateGuardianSettings, setPin, verifyPin, incrementFailedPinAttempts, resetFailedPinAttempts, getRestrictions, createRestriction, updateRestriction, deleteRestriction, pauseProfile, resumeProfile, checkProfileAccess, logActivity, getActivityLog, } from './parental-plugin.js';
export type { GuardianSettings, ProfileRestriction, ActivityLog, AccessCheckResult, CreateGuardianSettingsInput, UpdateGuardianSettingsInput, CreateRestrictionInput, LogActivityInput, ParentalAdapter, ParentalStore, ParentalPluginConfig, ParentalApiConfig, PostgresParentalStoreConfig, } from './types.js';
export { postgresParentalStore } from './stores/index.js';
export { kidsAdapter } from './adapters/index.js';
export type { KidsAdapterConfig } from './adapters/index.js';
export { ParentalStatusWidget } from './ParentalStatusWidget.js';
export type { ParentalStatusWidgetProps } from './ParentalStatusWidget.js';
export { ParentalManagementPage } from './ParentalManagementPage.js';
export type { ParentalManagementPageProps } from './ParentalManagementPage.js';
//# sourceMappingURL=index.d.ts.map